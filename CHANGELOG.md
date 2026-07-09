# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.1.3] - 2026-07-09

### Fixed

- On phones the menu no longer hides items behind an invisible horizontal scroll. Below 720px it wraps onto its own row under the brand with every item visible and centered, and the bar scrolls away with the page instead of pinning several rows to a small screen; the back-to-top button brings it back into reach. Desktop keeps the single sticky row, and section jumps account for the new offsets.

## [2.1.2] - 2026-07-07

### Fixed

- The search clear button no longer drops out of place when pressed (its centering no longer fought the shared button hover transform), and it now correctly stays hidden when the field is empty.

## [2.1.1] - 2026-07-07

### Added

- A clear (x) button inside the search field that appears once you type, wipes the search in one click, and returns focus to the field. Escape also clears it.

## [2.1.0] - 2026-07-07

### Added

- Smart search: every emoji now carries Unicode CLDR keywords plus a curated color and concept layer, so you can search by name, idea (love, danger, zodiac), or color (red, green), not just the exact name.
- Typo tolerance using Damerau edit distance, so "hart" finds the heart and "chekc" finds the check, with a clickable did-you-mean suggestion.
- Relevance-ranked results: searching switches from category groups to a single ranked Results list, best matches first.
- A dependency-free search engine module (`docs/search.js`) with 13 Node tests.

## [2.0.0] - 2026-07-07

### Changed

- Rebuilt the page in the shared toolkit design system: dark theme with a light-mode toggle, sticky navigation, an ambient background scene, an animated header illustration, a scroll-to-top button, and matching typography, so it is consistent with the rest of the suite.
- Restructured the copy board with a search field, category filter chips, a live count, and a click-to-copy toast.

### Added

- Real keyword search: every emoji in the dataset is enriched with its Unicode name, so searching "heart", "star", "check", or "arrow" now finds the right symbol.
- Expanded explainer on why emoji break in WHMCS (database charset, email clients, Unicode age) and an FAQ.
- `?demo` URL parameter that opens the board pre-filtered.
- A dataset schema version, so consumers can tell the enriched format from the original string list.

## [1.0.0] - 2026-07-06

First stable release.

### Added

- Browser copy board with 180 emoji across searchable categories, hosted on GitHub Pages.
- Compatibility notes: which emoji are usually safer in WHMCS and which often break.
- Machine-readable dataset at `docs/data/emoji.json` for reuse in other tools.
- Screenshot preview in the README.
- Issue template for reporting emoji test results, plus a pull request template and contributing guide.
- SEO metadata, sitemap, and robots.txt for the GitHub Pages site.
- MIT license.

[2.1.3]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.3
[2.1.2]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.2
[2.1.1]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.1
[2.1.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.0
[2.0.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.0.0
[1.0.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v1.0.0
