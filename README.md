# Cart Selection for Steam

Select only the items you want to buy from your Steam cart while keeping everything else in the cart.

[**Install Cart Selection for Steam**](https://raw.githubusercontent.com/HiSkyZen/steam-cart-selection/main/cart-selection-for-steam.user.js)

> Requires a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/). Open the install link above and your userscript manager should show its installation screen.

## Features

- Select individual packages and bundles in the Steam cart.
- Shows the combined price of only the selected items.
- Preserves account-specific pricing such as loyalty, ownership, Complete-the-Set, and pre-purchase discounts by falling back to Steam's signed-in account cart when required.
- Uses a non-destructive temporary shopping cart when Steam can safely represent the selected items there.
- Safely parks unselected account-cart items when fallback is required, binds recovery to a transaction/account, verifies restoration, and automatically restores after a confirmed Steam receipt.
- Does **not** persist your Steam Web API token.
- Automatically checks for updates through the raw GitHub userscript URL.

## Languages

The interface follows Steam's current language and supports every language code in Steam's [full platform/API language list](https://partner.steamgames.com/doc/store/localization/languages):

Arabic, Bulgarian, Chinese (Simplified), Chinese (Traditional), Czech, Danish, Dutch, English, Finnish, French, German, Greek, Hungarian, Indonesian, Italian, Japanese, Korean, Malay, Norwegian, Polish, Portuguese, Portuguese-Brazil, Romanian, Russian, Spanish-Spain, Spanish-Latin America, Swedish, Thai, Turkish, Ukrainian, and Vietnamese.

English is used as the fallback if an unknown language code is encountered. Arabic also enables RTL layout for the userscript UI.

## How it works

1. Open the [Steam cart](https://store.steampowered.com/cart/).
2. Use the **Cart Selection for Steam** panel to choose the items you want.
3. Review the selected total and click the localized **Checkout selected** button.
4. For ordinary products, the script first tries a separate temporary Steam shopping cart and verifies that every selected package/bundle is actually present.
5. For account-sensitive prices (including active/conditional discounts and coming-soon products), or whenever temporary-cart verification is not trustworthy, it uses the signed-in account cart instead. Unselected items are backed up by package/bundle ID and temporarily removed.
6. After Steam shows a confirmed purchase receipt, the script automatically returns to the Store origin and restores parked items. The checkout banner and userscript menu remain available as manual recovery fallbacks.

## Safety / privacy

The userscript reads the Steam Store page's existing signed-in Web API token only while making requests to `api.steampowered.com`. The token is never written to userscript storage.

When account-cart fallback is needed, recovery state is stored in userscript storage with a transaction ID/revision, originating Steam account ID, package/bundle IDs, gift information, and gift/private flags. The Steam Web API token is never persisted. If removal fails part-way through, the script attempts an immediate rollback. Before checkout, the reduced cart is verified; after restoration, the script re-reads the account cart and verifies every restored item and its gift/private flags. Coupon-applied or unknown special-state items are never destructively parked unless they can remain untouched in the selected cart.

If automatic restoration cannot be verified, recovery state is retained, an alert is shown, and the affected Steam product pages are opened in background tabs where supported.

## Supported pages

- `https://store.steampowered.com/cart/*`
- `https://store.steampowered.com/checkout/*`
- `https://checkout.steampowered.com/*`

## Updating

`@updateURL` and `@downloadURL` both point to the `main` branch's raw userscript. Tampermonkey/Violentmonkey can therefore update the installation directly from this repository.

## Troubleshooting

If checkout was interrupted before Steam produced a confirmed receipt, use the checkout banner or reopen the Steam cart and choose **Restore now**. A confirmed receipt triggers automatic restoration. If verification fails, the recovery record is kept instead of being discarded, and the affected product pages are opened to make manual recovery straightforward.

If Steam changes its internal cart APIs, open an issue and include the visible error message and reproduction steps. Avoid posting HAR files publicly without removing authentication tokens first.

## Disclaimer

This is an unofficial userscript and is not affiliated with Valve or Steam. It relies on Steam Store web interfaces and internal Web API endpoints, which can change without notice.
