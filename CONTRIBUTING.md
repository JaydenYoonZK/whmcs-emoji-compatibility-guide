# Contributing

Thanks for helping improve the WHMCS Emoji Compatibility Guide.

## Good Reports

The most useful reports include:

- The emoji tested
- WHMCS version
- PHP version
- Database charset and collation if known
- Where you tested it, such as product name, email template, knowledge base, or announcement
- Whether it rendered correctly after saving and reloading
- Screenshot or short screen recording if possible

## Pull Requests

For compatibility changes:

1. Add only emoji you have tested in WHMCS.
2. Keep the conservative profile free of supplementary-plane code points, regional flags, skin tone modifiers, and ZWJ sequences.
3. Keep categories alphabetized by section where practical.
4. Include a short note in your pull request describing the test environment.
5. Run `npm run export:csv` and `npm test` before opening the pull request.

Small, verified improvements are preferred over large untested dumps.
