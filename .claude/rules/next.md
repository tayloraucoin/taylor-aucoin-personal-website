---
paths:
  - "app/**"
  - "middleware.ts"
  - "**/next.config.*"
---

# Next.js 15

This repo runs Next 15 (15.5.23 installed; the move to 16 is layer 3, part 1). `params`, `cookies()` and `headers()` are async, and `fetch` is not cached by default.

Place a component by its importers (conventions §1); never `app/_components/`.
