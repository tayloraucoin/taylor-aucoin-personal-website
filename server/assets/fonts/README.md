# Vendored brand fonts (PDF rendering only)

The three site families, subset to Latin and vendored here so PDF generation
works in a serverless function with no network call and no binary dependency.
`next/font/google` covers the web; it produces hashed `.woff2` that `fontkit`
(inside `@react-pdf/renderer`) cannot read, so the PDF path needs its own copy.

| File | Source | Licence |
|---|---|---|
| `SpaceGrotesk-*.ttf` | floriankarsten/space-grotesk, static instances | OFL 1.1 |
| `Manrope-*.ttf` | google/fonts `Manrope[wght].ttf`, instanced at 400/500/600 with `fonttools varLib.instancer` | OFL 1.1 |
| `JetBrainsMono-*.ttf` | JetBrains/JetBrainsMono, static | OFL 1.1 |

Subset with `fonttools subset --unicodes=U+0020-007E,U+00A0-00FF,…` (Latin,
punctuation, currency). ~390KB total. Anything outside that range renders as
a missing glyph in a PDF, so a client name in a non-Latin script needs the
subset widened rather than a fallback font added.

All three are SIL Open Font Licence 1.1: vendoring and embedding in a PDF is
permitted. Do not rename the files to something that could be read as the
reserved font name.
