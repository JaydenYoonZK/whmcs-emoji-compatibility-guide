# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.3.8] - 2026-07-10

### Changed

- The theme toggle is redesigned from an emoji swap into a morphing mark. One vector drawing plays the whole switch: the sun's core grows into the moon while a masked bite slides in to carve the crescent, the eight rays spring away with an overshoot, and the mark tilts to seat the crescent, all reversed when switching back. The moon is brand chartreuse at night and the sun is warm amber by day, the round button trades the key edge for a soft brand halo on hover, and a tooltip appears below it saying which mode a click will switch to, on hover and keyboard focus only, never on touch. The morph is disabled under reduced-motion preferences.
- The README preview is regenerated.

## [2.3.7] - 2026-07-10

### Fixed

- The back-to-top button no longer casts a heavy black smudge in light mode. Its shadow was a single wide dark-theme blur that was never re-tuned for a cream background. Each theme now gets a layered shadow of its own: a tight warm contact shadow plus a soft chartreuse halo in light mode, and a grounded contact shadow with a gentle chartreuse under-glow in dark, with matching hover and pressed variants.

## [2.3.6] - 2026-07-10

### Changed

- Removed the pulsing status dot from the privacy pill. The animated dot has become one of the most recognizable template cliches on the web, and it was redundant next to the lock icon that already carries the meaning. The pill now leads with the lock alone, with its padding evened out.
- The README preview is regenerated.

## [2.3.5] - 2026-07-10

### Added

- Tactile depth across the interface. Every button is now built like a physical key: a hard edge shadow beneath it, a soft ambient shadow, and a hairline top bevel. Hovering lifts the key slightly, and pressing travels it down while the edge collapses underneath, a real press you can feel. Primary buttons carry a chartreuse edge and glow, secondary buttons use a warm brand-brown edge in light mode and a deep neutral one in dark, disabled buttons stay flat since a dead control should not look pressable, and the movement is disabled under reduced-motion preferences while the shadow feedback remains. Cards gain a quiet layered elevation per theme.
- The README preview is regenerated.

## [2.3.4] - 2026-07-10

### Fixed

- The menu's hover state no longer turns grey, and no longer sticks. Hovering used a grey panel tone that clashed with the brand language, and on phones a tap glued that grey pill to the last-tapped item because touch browsers keep a sticky hover. Hover styling now only applies on devices with a real pointer and uses a faint chartreuse brand tint, while the active item keeps the stronger chartreuse wash and always wins when it is both hovered and active.
- The active menu item now also carries `aria-current`, so screen readers hear which section you are in, kept in sync with the highlight by the same scroll logic.

## [2.3.3] - 2026-07-10

### Changed

- Light mode brings the brand home. The signature chartreuse #abcf37 button with dark ink text, the same button dark mode has always had, is now the primary action in light mode too, and chartreuse drives the accent washes, the menu band, the page glow, and the decorative scene. The airy cream background and crisp white cards return, links use a fresh deep green that passes AA on every chartreuse wash, and the verdict colors return to the vivid set with bright washes. Every rendered text pair measures 4.5:1 or better on the live page (the brand button measures above 10:1), and the dark theme is untouched.
- The README preview is regenerated for the new palette.

## [2.3.2] - 2026-07-10

### Changed

- Light mode now uses the studio palette chosen from design references: sand background #EEE3CF, warm ivory cards, coral #FE6E54 primary buttons with dark ink text (mirroring dark mode's dark-on-chartreuse buttons), a deep coral accent for links and highlights, sage #93A86C washes with the dark green #375554 as success text, a pale gold #FCDB99 wash under warning pills, teal #40A5A0 washes with indigo #363D6E as info text, and a coral, sage, and teal decorative scene. Every rendered text pair measures 4.5:1 or better on the live page, and the dark theme is untouched.
- The README preview is regenerated for the new palette.

## [2.3.1] - 2026-07-10

### Changed

- Light mode is redesigned around a warm editorial palette inspired by premium product sites: terracotta coral becomes the accent for buttons, links, and highlights, the success wash turns sage, the danger red deepens toward crimson so it stays clearly apart from the coral, type warms one step browner, the menu band turns soft sage, and the decorative scene (orbs, spheres, cube wireframes) moves to coral, sage, and warm brown. The cream background and the whole dark theme are untouched, and every rendered text pair measures 4.5:1 or better on the live page.
- The README preview is regenerated for the new light palette.

## [2.3.0] - 2026-07-10

### Added

- A generated CSV export of the emoji dataset for spreadsheet use.
- Curated copy groups for hosting, billing, support, and security content, built only from emoji already in the reviewed safe list.
- A clearer screenshot-reporting checklist for real WHMCS render failures.
- CI now checks that the CSV export is regenerated from the JSON source.

### Changed

- Light mode's palette is rebuilt around fresh hues instead of darkened earth tones. The accent is now a vivid deep green, success is emerald, the warning orange is clear instead of brown, and the red is brighter. Chip and pill washes are tinted from bright brand colors rather than from the dark text colors, so they read as lively pastels instead of a gray film, and the light-mode decorative constants (page glow, cube wireframes, spheres) moved from olive to brand chartreuse. Every rendered text pair was re-measured at 4.5:1 or better on the live page; dark mode is untouched.
- The README preview is regenerated to show the new light palette beside dark mode.

## [2.2.1] - 2026-07-10

### Added

- GitHub Actions now runs the search tests and syntax checks on Node 18, 20, and 22 across Linux, macOS, and Windows.
- A security policy points private vulnerability reports to GitHub Security Advisories.
- The package metadata now limits packed files to the reusable search engine, emoji dataset, README, and license.

### Fixed

- The README stars badge now links to the repository page, avoiding GitHub's 404 on the empty stargazers page.
- The copy button now falls back cleanly when `navigator.clipboard` is unavailable, instead of throwing before the existing fallback can run.
- The `?demo` page no longer throws an early-load search error while the emoji dataset is still loading.
- The browser app cache-busts its search-module import so GitHub Pages serves the current search engine after deployment.

## [2.2.0] - 2026-07-09

### Added

- A package.json, so the project runs like the rest of the suite: `npm test` runs the test suite and `npm run serve` starts the local server. The repo had a test file but no way to run it with the standard command.
- A dataset integrity test. It checks that every curated emoji is unique, has a name and a keyword list, and that the schema and review date are present, so a future edit cannot quietly corrupt the reference the whole tool is built on.
- A Content Security Policy on the page. The only request it makes is for its own emoji dataset, so `connect-src` is limited to same-origin and nothing can be sent elsewhere. Verified in a browser: the board still loads and searches, and a request to any other origin is blocked.

### Changed

- Accessibility: the search box now has a real label instead of one hidden with `display:none`.
- 14 tests, up from 13.

### Notes

This release followed a full audit of the search engine and dataset. Both are sound: the ranked matcher handles exact, prefix, substring, and typo-tolerant matches correctly ("hart" still finds the heart), and the 180 curated emoji are all unique, named, and keyworded.

## [2.1.7] - 2026-07-09

### Changed

- Light mode's status colors are livelier and now measurably meet WCAG AA. The olive green, brown amber, and muted red came from darkening alone, which made them muddy; they are replaced with fully saturated deep equivalents (accent #4c7a00, green #1d7a25, orange #ba4700, red #c62a22), the soft chip tints were eased to match, primary buttons in light mode use white text on the deep accent, and light muted text was deepened one step. Measured on the rendered page, every status pill, link, button label, and muted text now sits at 4.5:1 or better; the previous accent and the muted text on tinted chips quietly failed. Dark mode is untouched.

## [2.1.6] - 2026-07-09

### Added

- The hero illustration now has a light-mode version. It is the same inline drawing recolored through the theme tokens, so it follows the theme toggle instantly and always stays in step with the palette. Dark mode is unchanged.

## [2.1.5] - 2026-07-09

### Fixed

- Clicking a menu item now always highlights the item you clicked. The highlight was driven by an observer watching a band in the middle of the viewport, but a menu jump lands the section heading at the top, outside that band, so the green pill often stayed on a section the page had merely scrolled past. The active item is now computed directly from the scroll position: the last section whose heading sits above the reading line under the header, with the last section winning at the very bottom of the page.

## [2.1.4] - 2026-07-09

### Changed

- The menu now sits in its own tinted band under the brand bar on every screen size, giving the header a clear hierarchy: brand and theme toggle on top, menu below, every item always visible. The whole header is sticky again on all devices, and section jumps measure the header instead of assuming its height, so they land exactly below it however many rows the menu wraps to.

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

[2.3.8]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.8
[2.3.7]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.7
[2.3.6]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.6
[2.3.5]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.5
[2.3.4]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.4
[2.3.3]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.3
[2.3.2]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.2
[2.3.1]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.1
[2.3.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.3.0
[2.2.1]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.2.1
[2.2.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.2.0
[2.1.7]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.7
[2.1.6]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.6
[2.1.5]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.5
[2.1.4]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.4
[2.1.3]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.3
[2.1.2]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.2
[2.1.1]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.1
[2.1.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.1.0
[2.0.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v2.0.0
[1.0.0]: https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/releases/tag/v1.0.0
