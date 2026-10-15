# CC — Conscious Connections case study — 45 min

*(First to cut if time runs out.)*

- **CC-01** Publish the CC case study.
  - Content already exists at `content/work/conscious-connections.ts` and is in the display order in `content/work/index.ts`, but is **gated unpublished** by `WORK_PUBLISHED` in `lib/config.ts` (the route 404s today).
  - Complete the entry using the existing template: At a glance / Brief / Process / Decisions / What I Built / What Broke / Outcome. `media: []` must look right (WORK-03 standard).
  - **Framing:** it's live and Taylor's own — lead with the AI conflict-resolution product and the architecture (AI-mediated conflict translation, IPV-signal safety layer), **not traction**. No usage claims.
  - Flip the publish gate in `lib/config.ts`, verify the row appears in Selected Work and the overlay + full page both render, then `npm run build && npx tsc --noEmit`.
