# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

[2.0.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.0.0
[1.0.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v1.0.0
