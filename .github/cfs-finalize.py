from pathlib import Path
import re

path = Path('cart-selection-for-steam.user.js')
s = path.read_text(encoding='utf-8')

def once(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, found {count}')
    s = s.replace(old, new, 1)

def sub_once(pattern, replacement, label):
    global s
    s2, count = re.subn(pattern, replacement, s, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 regex match, found {count}')
    s = s2

once('// @version      1.0.2', '// @version      1.1.0', 'metadata version')
once("? GM_info.script.version : '1.0.2';", "? GM_info.script.version : '1.1.0';", 'runtime version fallback')
once('// @grant        GM_info\n', '// @grant        GM_info\n// @grant        GM_openInTab\n', 'GM_openInTab grant')
once("  const LANGUAGE_KEY = 'cfs_language_v1';\n", "  const LANGUAGE_KEY = 'cfs_language_v1';\n  const RECOVERY_SCHEMA_VERSION = 3;\n", 'recovery schema constant')

old_backup = """  function backupItem(item) {
    return {
      packageid: item.packageid || undefined,
      bundleid: item.bundleid || undefined,
      gift_info: item.gift_info || null,
      flags: normalizeFlags(item),
    };
  }
"""
new_backup = """  function backupItem(item) {
    return {
      packageid: item.packageid || undefined,
      bundleid: item.bundleid || undefined,
      original_line_item_id: lineItemId(item) || undefined,
      gift_info: item.gift_info || null,
      gidcoupon_applied: Number(item.gidcoupon_applied || 0) || 0,
      flags: normalizeFlags(item),
    };
  }

  function createTransactionId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return [...bytes].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function updateRecovery(recovery, stage = null) {
    if (!recovery || typeof recovery !== 'object') return recovery;
    if (stage) recovery.stage = stage;
    recovery.version = RECOVERY_SCHEMA_VERSION;
    recovery.revision = (Number(recovery.revision) || 0) + 1;
    recovery.updated_at = Date.now();
    setRecovery(recovery);
    return recovery;
  }

  function hasAppliedCoupon(item) {
    return Number(item?.gidcoupon_applied || 0) > 0;
  }

  function hasUnknownTruthyFlags(item) {
    const flags = item?.flags;
    if (!flags || typeof flags !== 'object') return false;
    return Object.entries(flags).some(([key, value]) => {
      if (key === 'is_gift' || key === 'is_private') return false;
      return !(value === false || value === 0 || value === '0' || value == null || value === '');
    });
  }

  function cannotSafelyRecreate(item) {
    return hasAppliedCoupon(item) || hasUnknownTruthyFlags(item);
  }

  function requiresAccountCart(item) {
    const flags = normalizeFlags(item);
    const meta = state.metadata.get(lineKey(item));
    return flags.is_gift || flags.is_private || hasAppliedCoupon(item) || hasUnknownTruthyFlags(item) ||
      Boolean(meta?.isComingSoon || meta?.hasConditionalDiscount || meta?.activeDiscounts?.length);
  }

  function recoveryProductUrl(item) {
    if (item?.packageid) return `https://store.steampowered.com/sub/${Number(item.packageid)}/`;
    if (item?.bundleid) return `https://store.steampowered.com/bundle/${Number(item.bundleid)}/`;
    return null;
  }

  function openRecoveryItemPages(items) {
    const urls = [...new Set((items || []).map(recoveryProductUrl).filter(Boolean))].slice(0, 8);
    for (const url of urls) {
      try {
        if (typeof GM_openInTab === 'function') {
          GM_openInTab(url, { active: false, insert: true, setParent: true });
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } catch (e) {
        log('Could not open recovery product page.', url, e);
      }
    }
  }

  function makeRecoveryError(message, items) {
    const error = new Error(message);
    error.recoveryItems = Array.isArray(items) ? items : [];
    return error;
  }

  function reportRecoveryFailure(error, fallbackItems = []) {
    const affected = error?.recoveryItems?.length ? error.recoveryItems : fallbackItems;
    const message = error?.message || String(error || 'Unknown recovery error');
    alert(`${SCRIPT_NAME}: ${t('restoreFailed', { error: message })}`);
    if (affected?.length) openRecoveryItemPages(affected);
  }
"""
once(old_backup, new_backup, 'backup/recovery helper block')

sub_once(
    r"  async function rollbackRemoved\(recovery\) \{.*?\n  \}\n\n  async function restoreRecovery\(\{ quiet = false \} = \{\}\) \{.*?\n  \}\n\n  function canUseDirectCart\(items\) \{.*?\n  \}\n",
    """  async function rollbackRemoved(recovery) {
    if (!recovery?.items?.length) return true;
    return restoreRecovery({ quiet: true, expectedTransactionId: recovery.transaction_id || null });
  }

  function findRestoredMismatch(backups, cartItems) {
    const unresolved = [];
    for (const backup of backups) {
      const key = lineKey(backup);
      const matches = cartItems.filter(item => lineKey(item) === key);
      const expectedFlags = normalizeFlags(backup);
      const match = matches.find(item => {
        const actualFlags = normalizeFlags(item);
        return actualFlags.is_gift === expectedFlags.is_gift &&
          actualFlags.is_private === expectedFlags.is_private;
      });
      if (!match) unresolved.push(backup);
    }
    return unresolved;
  }

  async function restoreRecovery({ quiet = false, expectedTransactionId = null } = {}) {
    const recovery = getRecovery();
    if (!recovery?.items?.length) {
      if (!quiet) setStatus(t('noRecovery'), 'ok');
      return true;
    }

    if (expectedTransactionId && recovery.transaction_id &&
        String(recovery.transaction_id) !== String(expectedTransactionId)) {
      throw makeRecoveryError('Recovery transaction changed before restore.', recovery.items);
    }

    if (!state.config?.token) state.config = await waitForConfig();
    if (!state.config?.token) throw makeRecoveryError(t('tokenMissing'), recovery.items);
    if (recovery.source_steamid && state.config.steamid &&
        String(recovery.source_steamid) !== String(state.config.steamid)) {
      throw makeRecoveryError('Steam account changed. Recovery was not applied to a different account.', recovery.items);
    }

    setStatus(t('restoring', { count: recovery.items.length }));

    try {
      const current = await getAccountCart();
      const currentItems = current.line_items || [];
      const existingKeys = new Set(currentItems.map(lineKey));
      const missing = recovery.items.filter(item => !existingKeys.has(lineKey(item)));

      if (missing.length) await addAccountItems(missing);

      const verified = await getAccountCart();
      const unresolved = findRestoredMismatch(recovery.items, verified.line_items || []);
      if (unresolved.length) {
        throw makeRecoveryError(
          `Steam did not confirm ${unresolved.length} restored item(s) with the expected purchase flags.`,
          unresolved
        );
      }

      clearRecovery();
      if (!quiet) setStatus(t('restored', { count: recovery.items.length }), 'ok');
      return true;
    } catch (error) {
      const latest = getRecovery() || recovery;
      latest.last_error = error?.message || String(error);
      latest.last_error_at = Date.now();
      updateRecovery(latest, 'recovery_required');
      if (!error?.recoveryItems) error.recoveryItems = latest.items || recovery.items;
      throw error;
    }
  }

  function canUseDirectCart(items) {
    if (!state.metadataAuthenticated) return false;
    return items.length > 0 && items.every(item =>
      Boolean(item.packageid || item.bundleid) && !requiresAccountCart(item)
    );
  }
""",
    'restore/canUseDirectCart block'
)

sub_once(
    r"  async function beginSelectiveCheckout\(\) \{.*?\n  \}\n\n  function analyzeFormattedPrice",
    """  async function beginSelectiveCheckout() {
    if (state.busy) return;
    state.busy = true;
    renderFooter();

    try {
      const existingRecovery = getRecovery();
      if (existingRecovery?.items?.length) throw new Error(t('previousRecovery'));

      const freshCart = await getAccountCart();
      const freshItems = freshCart.line_items || [];
      if (!freshItems.length) throw new Error(t('cartEmpty'));

      const selectedKeys = new Set(state.selected);
      const selectedItems = freshItems.filter(item => selectedKeys.has(lineKey(item)));
      const parkedItems = freshItems.filter(item => !selectedKeys.has(lineKey(item)));
      if (!selectedItems.length) throw new Error(t('selectOne'));

      if (!parkedItems.length) {
        setStatus(t('processing'), 'ok');
        location.assign(accountCartCheckoutUrl());
        return;
      }

      const accountSensitive = !state.metadataAuthenticated || selectedItems.some(requiresAccountCart);
      setStatus(t('processing'), accountSensitive ? 'warn' : '');
      const directGid = accountSensitive ? null : await tryDirectTemporaryCart(selectedItems);
      if (directGid) {
        setStatus(t('processing'), 'ok');
        location.assign(checkoutUrl(directGid));
        return;
      }

      const unsafeParked = parkedItems.filter(cannotSafelyRecreate);
      if (unsafeParked.length) {
        throw makeRecoveryError(
          'Selective checkout cannot safely park a coupon-applied or unsupported special cart item. Leave that item selected or remove its special state first.',
          unsafeParked
        );
      }

      const ok = window.confirm(t('fallbackConfirm', {
        selected: selectedItems.length,
        parked: parkedItems.length,
      }));
      if (!ok) return;

      const recovery = {
        version: RECOVERY_SCHEMA_VERSION,
        transaction_id: createTransactionId(),
        revision: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
        stage: 'removing',
        source_steamid: state.config.steamid || null,
        source_country: state.config.country || null,
        items: parkedItems.map(backupItem),
        selected_keys: selectedItems.map(lineKey),
        removed_count: 0,
      };
      updateRecovery(recovery, 'removing');
      setStatus(t('processing'), 'warn');

      try {
        for (const item of parkedItems) {
          await removeAccountItem(item);
          recovery.removed_count += 1;
          updateRecovery(recovery);
        }
      } catch (error) {
        setStatus(t('processing'), 'error');
        try {
          await rollbackRemoved(recovery);
        } catch (rollbackError) {
          log('Rollback failed.', rollbackError);
          recovery.last_error = rollbackError?.message || String(rollbackError);
          updateRecovery(recovery, 'recovery_required');
          reportRecoveryFailure(rollbackError, recovery.items);
        }
        throw error;
      }

      const reducedCart = await getAccountCart();
      const reducedItems = reducedCart.line_items || [];
      const remainingKeys = new Set(reducedItems.map(lineKey));
      const expectedKeys = new Set(selectedItems.map(lineKey));
      const mismatch = [...expectedKeys].some(k => !remainingKeys.has(k)) ||
        [...remainingKeys].some(k => !expectedKeys.has(k));

      if (mismatch) {
        setStatus(t('processing'), 'error');
        await rollbackRemoved(recovery);
        throw new Error('Cart verification failed after parking unselected items.');
      }

      recovery.checkout_started_at = Date.now();
      updateRecovery(recovery, 'checkout');
      setStatus(t('processing'), 'ok');
      location.assign(accountCartCheckoutUrl());
    } catch (e) {
      console.error(`[${SCRIPT_NAME}] checkout failed`, e);
      setStatus(t('error', { error: e.message || e }), 'error');
      if (e?.recoveryItems?.length) reportRecoveryFailure(e, e.recoveryItems);
    } finally {
      state.busy = false;
      renderFooter();
    }
  }

  function analyzeFormattedPrice""",
    'selective checkout block'
)

once(
    """      } catch (e) {
        setStatus(t('restoreFailed', { error: e.message || e }), 'error');
      } finally {
""",
    """      } catch (e) {
        setStatus(t('restoreFailed', { error: e.message || e }), 'error');
        reportRecoveryFailure(e, getRecovery()?.items || []);
      } finally {
""",
    'manual recovery button failure reporting'
)

sub_once(
    r"  function mountCheckoutBanner\(\) \{.*?\n  \}\n\n  async function initCartPage\(\) \{.*?\n  \}\n",
    """  function mountCheckoutBanner() {
    const recovery = getRecovery();
    if (!recovery?.items?.length) return;
    document.getElementById(CHECKOUT_UI_ID)?.remove();

    const el = document.createElement('div');
    el.id = CHECKOUT_UI_ID;
    el.innerHTML = `
      <div class="ssc-checkout-text">
        <strong>${t('checkoutActive')}</strong> ${t('checkoutBanner', { count: recovery.items.length })}
      </div>
      <div class="ssc-checkout-actions">
        <button class="restore">${t('returnRestore')}</button>
        <button class="dismiss">${t('hide')}</button>
      </div>
    `;
    document.body.appendChild(el);
    el.dir = uiLanguage === 'arabic' ? 'rtl' : 'ltr';

    el.querySelector('.restore').addEventListener('click', () => {
      location.href = `${STORE_CART_URL}?ssc_restore=1`;
    });
    el.querySelector('.dismiss').addEventListener('click', () => el.remove());
  }

  function isVisibleCheckoutElement(element) {
    if (!element || element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    return element.getClientRects().length > 0;
  }

  function hasConfirmedCheckoutReceipt() {
    const receipt = document.querySelector('#receipt_area');
    if (!isVisibleCheckoutElement(receipt)) return false;
    if (isVisibleCheckoutElement(document.querySelector('#pending_receipt_area'))) return false;
    if (isVisibleCheckoutElement(receipt.querySelector('#receipt_error_display'))) return false;
    const confirmation = receipt.querySelector('#receipt_confirmation_code');
    const summary = receipt.querySelector('#purchase_summary_area');
    return isVisibleCheckoutElement(confirmation) || isVisibleCheckoutElement(summary);
  }

  function monitorCheckoutCompletion() {
    const initial = getRecovery();
    if (!initial?.items?.length || initial.stage !== 'checkout') return;
    const transactionId = initial.transaction_id || null;
    let completed = false;

    const observer = new MutationObserver(check);
    function check() {
      if (completed || !hasConfirmedCheckoutReceipt()) return;
      const recovery = getRecovery();
      if (!recovery?.items?.length || recovery.stage !== 'checkout') return;
      if (transactionId && recovery.transaction_id && recovery.transaction_id !== transactionId) return;

      completed = true;
      observer.disconnect();
      recovery.purchase_completed_at = Date.now();
      updateRecovery(recovery, 'purchase_complete');

      const tx = encodeURIComponent(recovery.transaction_id || 'legacy');
      setTimeout(() => location.replace(`${STORE_CART_URL}?ssc_restore=auto&cfs_tx=${tx}`), 700);
    }

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
      childList: true,
      subtree: true,
    });
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
    check();
  }

  function initCheckoutPage() {
    mountCheckoutBanner();
    monitorCheckoutCompletion();
  }

  async function initCartPage() {
    mountPanel();
    const params = new URL(location.href).searchParams;
    const recovery = getRecovery();
    const manualRestore = params.get('ssc_restore') === '1';
    const autoRestore = params.get('ssc_restore') === 'auto' || recovery?.stage === 'purchase_complete';
    const requestedTx = params.get('cfs_tx');
    const transactionMatches = !requestedTx || !recovery?.transaction_id || requestedTx === recovery.transaction_id;

    if ((manualRestore || (autoRestore && transactionMatches)) && recovery?.items?.length) {
      try {
        state.config = await waitForConfig();
        await restoreRecovery({
          quiet: true,
          expectedTransactionId: requestedTx && requestedTx !== 'legacy' ? requestedTx : null,
        });
        history.replaceState(null, '', STORE_CART_URL);
        setStatus(t('autoRestored'), 'ok');
      } catch (e) {
        history.replaceState(null, '', STORE_CART_URL);
        setStatus(t('autoRestoreFailed', { error: e.message || e }), 'error');
        reportRecoveryFailure(e, getRecovery()?.items || recovery.items);
      }
    }

    await loadCartUi();
  }
""",
    'checkout monitor/cart init block'
)

once(
    """    } catch (e) {
      alert(`${SCRIPT_NAME}: ${t('restoreFailed', { error: e.message || e })}`);
    }
  });
""",
    """    } catch (e) {
      reportRecoveryFailure(e, getRecovery()?.items || []);
    }
  });
""",
    'menu restore failure reporting'
)

once(
    """  } else if ((host === 'checkout.steampowered.com') ||
             (host === 'store.steampowered.com' && path.startsWith('/checkout'))) {
    mountCheckoutBanner();
  }
""",
    """  } else if ((host === 'checkout.steampowered.com') ||
             (host === 'store.steampowered.com' && path.startsWith('/checkout'))) {
    initCheckoutPage();
  }
""",
    'checkout entrypoint'
)

path.write_text(s, encoding='utf-8')

readme = Path('README.md')
r = readme.read_text(encoding='utf-8')
r = r.replace(
    '- Safely parks unselected account-cart items when fallback is required, verifies the reduced cart, and provides a restore action after checkout.\n',
    '- Safely parks unselected account-cart items when fallback is required, binds recovery to a transaction/account, verifies restoration, and automatically restores after a confirmed Steam receipt.\n'
)
r = r.replace(
    '6. After checkout or cancellation, use the banner to return to the cart and restore the parked items.\n',
    '6. After Steam shows a confirmed purchase receipt, the script automatically returns to the Store origin and restores parked items. The checkout banner and userscript menu remain available as manual recovery fallbacks.\n'
)
r = r.replace(
    'When account-cart fallback is needed, recovery storage contains only the minimum data required to restore parked cart items (package/bundle ID plus gift/private flags). If removal fails part-way through, the script attempts an immediate rollback. The reduced cart is also verified before Steam checkout opens.\n',
    'When account-cart fallback is needed, recovery state is stored in userscript storage with a transaction ID/revision, originating Steam account ID, package/bundle IDs, gift information, and gift/private flags. The Steam Web API token is never persisted. If removal fails part-way through, the script attempts an immediate rollback. Before checkout, the reduced cart is verified; after restoration, the script re-reads the account cart and verifies every restored item and its gift/private flags. Coupon-applied or unknown special-state items are never destructively parked unless they can remain untouched in the selected cart.\n\nIf automatic restoration cannot be verified, recovery state is retained, an alert is shown, and the affected Steam product pages are opened in background tabs where supported.\n'
)
r = r.replace(
    'If checkout was interrupted while the script had parked unselected items, reopen the Steam cart. The recovery box will offer **Restore now**. You can also use the userscript manager menu command for Cart Selection for Steam to restore parked items.\n',
    'If checkout was interrupted before Steam produced a confirmed receipt, use the checkout banner or reopen the Steam cart and choose **Restore now**. A confirmed receipt triggers automatic restoration. If verification fails, the recovery record is kept instead of being discarded, and the affected product pages are opened to make manual recovery straightforward.\n'
)
readme.write_text(r, encoding='utf-8')

changelog = Path('CHANGELOG.md')
c = changelog.read_text(encoding='utf-8')
entry = """## 1.1.0 — 2026-09-16

- Added transaction-bound account-cart recovery with revision tracking and Steam-account binding.
- Added conservative confirmed-receipt detection and automatic post-purchase restoration without persisting the Steam Web API token.
- Added post-restore verification for product identity and gift/private flags; recovery state is retained on any mismatch.
- Added recovery-failure alerts and background product-page opening for affected items.
- Hardened coupon and unknown-special-flag handling: unsafe parked items are rejected before destructive fallback begins.
- Kept the verified temporary-cart path for plain purchases and the existing manual recovery controls as fallbacks.
- No automated test suite was added; this remains a compact userscript intentionally coupled to Steam's live web APIs.

"""
if not c.startswith('## 1.1.0'):
    c = entry + c
changelog.write_text(c, encoding='utf-8')
