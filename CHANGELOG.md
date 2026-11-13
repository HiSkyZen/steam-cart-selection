## 1.1.6 — 2026-11-13

- Fixed current Steam SSR cart detection using a real captured cart page as the reference structure.
- Steam now serializes route `loaderData` entries as JSON strings; the userscript parses them before inspecting cart state.
- Restored signed-in AccountCart detection by reading `strWebAPIToken` from SSR loader data instead of assuming it exists in `UserConfig.webapi_token`.
- Added authoritative `cartID` handling: `{type: "account"}` selects AccountCart, while `{type: "anonymous", gid: ...}` selects the guest ShoppingCart flow.
- Removed the fragile assumption that presence or absence of a token alone determines whether the cart is signed-in or anonymous.

## 1.1.5 — 2026-11-13

- Fixed logged-out carts that appeared empty after Steam's new SSR cart rollout.
- Added bounded discovery of Steam's hydrated cart object inside `window.SSR.loaderData` and prefer that exact page state when it contains cart items.
- Added page-origin ShoppingCart API requests for anonymous carts, with the previous userscript transport retained only as a fallback.
- Updated anonymous temporary-cart creation, package/bundle insertion, and verification to use the same page-origin transport.
- Retained signed-in AccountCart behavior, recovery safeguards, and legacy `#application_config` compatibility.

## 1.1.4 — 2026-11-13

- Fixed Steam's new Store SSR cart UI, which removed the legacy `#application_config` bootstrap element.
- Added configuration discovery through the current `window.Config`, `window.UserConfig`, and `window.WebConfig` globals while retaining the legacy parser as a fallback.
- Removed the hard failure when page configuration is absent so logged-out guest carts can continue through cookie-based `shoppingCartGID` discovery.
- Added `unsafeWindow` access for userscript managers so Steam page globals can be read from the page context.
- Kept the existing signed-in account-cart and recovery paths unchanged.

## 1.1.3 — 2026-09-16

- Added logged-out Steam guest-cart support using Steam's `shoppingCartGID` cart identifier.
- Guest selective checkout now creates and verifies a separate ShoppingCart containing only the selected packages/bundles, leaving the original anonymous cart untouched.
- Made the Web API transport token-optional for Steam endpoints used by anonymous storefront sessions and added guest `browserid` propagation to ShoppingCart add operations.
- Added public StoreBrowse metadata lookup for guest item names/prices while preserving authenticated account-specific pricing for signed-in users.
- Kept account-cart recovery and destructive fallback strictly limited to signed-in account carts.

## 1.1.2 — 2026-09-16

- Added the generic Spanish `@name:es`/`@description:es` metadata required by Greasy Fork when Spanish additional info is present.
- Declared `@license MIT` in the userscript metadata and added the repository MIT license.

## 1.1.1 — 2026-09-16

- Expanded userscript metadata localization to all 31 Steam interface languages (English default plus 30 localized `@name`/`@description` entries) for Greasy Fork and userscript-manager listings.

## 1.1.0 — 2026-09-16

- Added transaction-bound account-cart recovery with stale-revision protection across tabs and Steam-account binding.
- Added conservative confirmed-receipt detection and automatic post-purchase restoration without persisting the Steam Web API token.
- Added post-restore verification for product identity, gift/private flags, and preservation of gift metadata presence; recovery state is retained on any mismatch.
- Added recovery-failure alerts and background product-page opening for affected items.
- Hardened coupon and unknown-special-flag handling: unsafe parked items are rejected before destructive fallback begins.
- Kept the verified temporary-cart path for plain purchases and the existing manual recovery controls as fallbacks.
- No automated test suite was added; this remains a compact userscript intentionally coupled to Steam's live web APIs.

## 1.0.2 — 2026-09-16

- Fixed the in-panel version label so it reads the installed userscript version from `GM_info` instead of showing a hard-coded `v1.0.0`.

## 1.0.1 — 2026-09-15

- Changed the unknown-language fallback from Korean to English.
- Removed the hard-coded KR country fallback; when Steam does not expose a country, country-specific request fields are omitted instead of forcing a region.

# Changelog

## 1.0.0 — 2026-09-15

- Renamed the project to **Cart Selection for Steam**.
- Promoted the stabilized selective-checkout implementation to the first public release.
- Added localization for all 31 language codes in Steam's current full platform/API language list.
- Added Arabic RTL UI support.
- Added GitHub `@updateURL` and `@downloadURL` metadata for one-click installation and updates.
- Preserved account-sensitive loyalty, ownership, Complete-the-Set, active-discount, and coming-soon pricing through account-cart fallback.
- Retained verified temporary-cart checkout for eligible ordinary items.
- Retained recovery/rollback safeguards for temporarily parked account-cart items.
