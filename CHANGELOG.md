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
