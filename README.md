# WHMCS Emoji Compatibility Guide ✅

A tested reference of emoji that survive WHMCS product names, email templates, and knowledge base articles, with a searchable browser copy board. Runs entirely in your browser.

<p>
  <a href="https://jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide/"><img src="https://img.shields.io/badge/Live%20guide-open-abcf37?style=for-the-badge&logo=githubpages&logoColor=black" alt="Open the live guide"></a>
  <a href="https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/stargazers"><img src="https://img.shields.io/github/stars/JaydenYoonZK/whmcs-emoji-compatibility-guide?style=for-the-badge&logo=github" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/JaydenYoonZK/whmcs-emoji-compatibility-guide?style=for-the-badge" alt="MIT License"></a>
</p>

<a href="https://jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide/?demo">
  <img src="docs/assets/preview.png?v=2" alt="WHMCS Emoji Guide shown in light and dark themes, the hero with its illustration of an emoji that survives a product name and one that breaks" width="100%">
</a>

**[Open the live guide](https://jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide/)** or **[jump to a search demo](https://jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide/?demo)**. Nothing is tracked or uploaded.

## The problem

Some emoji render perfectly in a WHMCS product name or email template. Others turn into `????`, empty boxes, or broken characters the moment they hit an older database or a mail client. The most common cause is a database still on the `utf8` MySQL charset, which cannot store four-byte emoji, so the character is mangled on save. The failure is quiet: the admin area looks fine while the customer sees a broken box.

## What this is

- A **hand-reviewed list of 180 emoji** drawn from the older, widely-supported Unicode ranges that hold up across old and new systems.
- A **smart copy board**: search by name (`heart`), concept (`love`, `danger`, `zodiac`), or color (`red`, `green`), with typo tolerance (`hart`, `chekc`) and did-you-mean suggestions. Filter by category and click to copy. All in your browser, nothing sent anywhere.
- A **machine-readable dataset** at [`docs/data/emoji.json`](docs/data/emoji.json), enriched with Unicode CLDR keywords plus a curated color and concept layer, so it powers real search.
- Plain-language notes on **why emoji break in WHMCS** and what tends to work.

## Use it

No install: [jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide](https://jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide/)

It works offline once the page has loaded. Run locally:

```bash
git clone https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide.git
cd whmcs-emoji-compatibility-guide
npm run serve   # http://localhost:8441
```

## Tests

```bash
npm test
```

14 tests cover the ranked search (exact, prefix, substring, and typo-tolerant matching), did-you-mean suggestions, and a dataset integrity check that every curated emoji is unique, named, and keyworded.

## Usually safer vs often unsupported

| Usually safer | Often unsupported |
|---|---|
| Basic symbols and older Unicode emoji | Country flags |
| Simple single-code-point emoji | New emoji from recent Unicode releases |
| Emoji without skin tone modifiers | Skin tone variations |
| Emoji without gender or family combinations | Complex zero-width-joiner sequences |

Even a safer emoji is worth a real test in your own stack before it goes into a billing-critical or support-critical message.

## Contributing

Real test reports are the most valuable contribution. If an emoji works or breaks in your setup, open an [emoji report](https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/issues/new/choose) with the emoji, your WHMCS and PHP versions, your database charset, and where you tested it. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. Built and maintained by [Jayden Yoon ZK](https://github.com/JaydenYoonZK). Part of a small-business web toolkit alongside [WP Serial Fix](https://github.com/JaydenYoonZK/wp-serial-fix), [WP Config Doctor](https://github.com/JaydenYoonZK/wp-config-doctor), and [WP Plugin Checkup](https://github.com/JaydenYoonZK/wp-plugin-checkup).
