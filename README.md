# WHMCS Emoji Compatibility Guide

Copy-paste-safe emoji for WHMCS product names, knowledge base articles, email templates, announcements, and client-area UI.

<p>
  <a href="https://jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide/"><img src="https://img.shields.io/badge/Live%20guide-open-10b981?style=for-the-badge&logo=githubpages&logoColor=white" alt="Open live guide"></a>
  <a href="https://github.com/JaydenYoonZK/whmcs-emoji-compatibility-guide/stargazers"><img src="https://img.shields.io/github/stars/JaydenYoonZK/whmcs-emoji-compatibility-guide?style=for-the-badge&logo=github" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/JaydenYoonZK/whmcs-emoji-compatibility-guide?style=for-the-badge" alt="MIT License"></a>
</p>

## Why This Exists

WHMCS installations, templates, databases, and email clients do not always handle modern emoji the same way. Some emoji render perfectly. Others turn into `????`, tofu boxes, or broken characters after saving.

This guide keeps a practical list of emoji that are safer to use in WHMCS environments, plus a copy board you can open in the browser while editing client-facing content.

## Live Copy Board

Open the interactive guide:

[jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide](https://jaydenyoonzk.github.io/whmcs-emoji-compatibility-guide/)

Machine-readable data is also available:

[docs/data/emoji.json](docs/data/emoji.json)

Use it when editing:

- Product and service names
- Email templates
- Knowledge base articles
- Announcements
- Client-area labels
- Admin notes and internal checklists

## Compatibility Notes

These are usually safer:

- Basic symbols
- Older Unicode emoji
- Simple monochrome-style symbols
- Emoji without skin tone modifiers
- Emoji without complex zero-width-joiner sequences

These often fail or render inconsistently:

- Country flags
- New emoji from recent Unicode releases
- Skin tone variations
- Gendered and multi-person combinations
- Highly stylized platform-specific emoji

Always test in your own WHMCS stack before using emoji in billing-critical or support-critical messages.

## Contributing

Found an emoji that works well? Found one that breaks in WHMCS?

Please open an issue with:

- Emoji tested
- WHMCS version
- PHP version
- Database charset/collation if known
- Where it was tested, such as product name, email template, knowledge base, or announcement
- Result, including screenshots if possible

Pull requests are welcome for verified additions, removals, and compatibility notes.

## Roadmap

- Add CSV export
- Add more WHMCS testing contexts
- Add screenshots for common render failures
- Add copy groups for hosting, billing, support, and security use cases

## License

MIT License. Built and maintained by [Jayden Yoon ZK](https://github.com/JaydenYoonZK).
