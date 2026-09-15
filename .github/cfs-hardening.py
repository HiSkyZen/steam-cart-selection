from pathlib import Path

p = Path('cart-selection-for-steam.user.js')
s = p.read_text(encoding='utf-8')

def once(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected one occurrence, found {n}')
    s = s.replace(old, new, 1)

once("""  function updateRecovery(recovery, stage = null) {
    if (!recovery || typeof recovery !== 'object') return recovery;
    if (stage) recovery.stage = stage;
    recovery.version = RECOVERY_SCHEMA_VERSION;
    recovery.revision = (Number(recovery.revision) || 0) + 1;
    recovery.updated_at = Date.now();
    setRecovery(recovery);
    return recovery;
  }
""", """  function updateRecovery(recovery, stage = null) {
    if (!recovery || typeof recovery !== 'object') return recovery;

    const current = getRecovery();
    const localRevision = Number(recovery.revision) || 0;
    const currentRevision = Number(current?.revision) || 0;
    const localTx = recovery.transaction_id || null;
    const currentTx = current?.transaction_id || null;

    if (localRevision > 0 && !current) {
      throw new Error('Recovery state was cleared in another tab or context.');
    }
    if (localTx && currentTx && localTx !== currentTx) {
      throw new Error('A different recovery transaction is already active.');
    }
    if (localTx && currentTx === localTx && currentRevision > localRevision) {
      throw new Error('Recovery state changed in another tab. Reload before continuing.');
    }

    if (stage) recovery.stage = stage;
    recovery.version = RECOVERY_SCHEMA_VERSION;
    recovery.revision = Math.max(localRevision, currentRevision) + 1;
    recovery.updated_at = Date.now();
    setRecovery(recovery);
    return recovery;
  }
""", 'revision guard')

once("""      const match = matches.find(item => {
        const actualFlags = normalizeFlags(item);
        return actualFlags.is_gift === expectedFlags.is_gift &&
          actualFlags.is_private === expectedFlags.is_private;
      });
""", """      const expectsGiftInfo = backup.gift_info && typeof backup.gift_info === 'object' &&
        Object.keys(backup.gift_info).length > 0;
      const match = matches.find(item => {
        const actualFlags = normalizeFlags(item);
        const hasGiftInfo = item?.gift_info && typeof item.gift_info === 'object' &&
          Object.keys(item.gift_info).length > 0;
        return actualFlags.is_gift === expectedFlags.is_gift &&
          actualFlags.is_private === expectedFlags.is_private &&
          (!expectsGiftInfo || hasGiftInfo);
      });
""", 'gift info verification')

once("""    } catch (e) {
      console.error(`[${SCRIPT_NAME}] checkout failed`, e);
      setStatus(t('error', { error: e.message || e }), 'error');
      if (e?.recoveryItems?.length) reportRecoveryFailure(e, e.recoveryItems);
    } finally {
""", """    } catch (e) {
      console.error(`[${SCRIPT_NAME}] checkout failed`, e);
      setStatus(t('error', { error: e.message || e }), 'error');
      const activeRecovery = getRecovery();
      if (activeRecovery?.stage === 'recovery_required') {
        reportRecoveryFailure(e, activeRecovery.items || e?.recoveryItems || []);
      }
    } finally {
""", 'preflight popup guard')

p.write_text(s, encoding='utf-8')

c = Path('CHANGELOG.md')
t = c.read_text(encoding='utf-8')
t = t.replace(
    '- Added transaction-bound account-cart recovery with revision tracking and Steam-account binding.\n',
    '- Added transaction-bound account-cart recovery with stale-revision protection across tabs and Steam-account binding.\n'
)
t = t.replace(
    '- Added post-restore verification for product identity and gift/private flags; recovery state is retained on any mismatch.\n',
    '- Added post-restore verification for product identity, gift/private flags, and preservation of gift metadata presence; recovery state is retained on any mismatch.\n'
)
c.write_text(t, encoding='utf-8')
