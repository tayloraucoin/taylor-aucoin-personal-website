# GRID — Capability card grid — 2 hrs

**Placement decision (make once, don't debate twice):** lives on `/services`, below the offer cards. A separate `/capabilities` page adds a nav item and a click for no conversion gain. If Taylor overrules, moving it is a one-file change — build it as a self-contained section component (`components/services/CapabilityGrid.tsx`).

- **GRID-01** Card grid component + click-to-open dialog. Reuse the shared `components/ui/Overlay.tsx` shell (extracted for `/stack` in CAP-04) rather than writing a new dialog — focus trap, `Escape`, backdrop click, focus-return are already solved there. Cards get the standard interactive treatment (field gain fades on hover, `:focus-visible` ring).

- **GRID-02** Write 8–12 cards. **Card titles are problems, not technologies. Tech goes in the subtitle.** Typed content, e.g. `content/capabilities.ts`. Suggested set:
  1. Payments, tax, and refunds that survive real orders — *Stripe · tax engines · webhooks*
  2. Ship AI features that don't rot your codebase — *LLM orchestration · evals · agent workflows*
  3. Consolidate several half-built systems into one — *monorepo · shared schema · migrations*
  4. Search and discovery that actually finds things — *Elasticsearch · ranking · recommendations*
  5. Make a slow app fast — *rendering performance · caching · Lighthouse*
  6. Turn a spec into a shipped product, solo — *0→1 delivery*
  7. Data and state architecture that survives feature growth — *typed end-to-end · schema design*
  8. Realtime voice and audio interfaces — *streaming AI · latency budgets*
  9. Booking and inventory flows — *allocation · availability · edge cases*
  10. Correctness under pressure — *defect prevention · clinical-grade care*
  11. Lead and level up a junior team — *mentorship · code review · standards*
  12. Write the spec everyone else can build from — *specification · decision records*

- **GRID-03** Dialog content per card: 2–3 sentences on approach → link to the case study where it was done (`/work/[slug]`) → "usually shows up as: [offer]" line mapping to one of the three SVC-03 offers. Article links are **optional placeholders — do not write articles today.** *(First cut candidate after CC-01: if time runs out, ship the cards without dialogs.)*
