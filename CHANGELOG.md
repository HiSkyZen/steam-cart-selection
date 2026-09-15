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
