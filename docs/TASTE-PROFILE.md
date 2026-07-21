# Taste profile — Taylor Aucoin

This document exists because the visual direction was arrived at through many rounds of rejection. An agent that reads only the design tokens will produce something technically compliant and tonally wrong. **Read this first.**

---

## Who this site is for

- **Primary audience: hiring managers.** Taylor is actively job-searching for senior / principal / founding engineer roles. Everything else adapts around that.
- Secondary, later: fractional / consulting clients, investors.
- **Not** for the DJ / festival / conscious-community half of his life. Explicitly excluded from v1.

## What he is

Vancouver-based. ~9.5 years. Senior full-stack **product** engineer and technical founder. Nine products shipped to production across healthtech, AI platforms, e-commerce, and consumer marketplaces. Hybrid identity: engineering + product + design. Currently building Conscious Connections; runs a fractional CTO engagement; has been a founding engineer.

Positioning line for v1: **"Senior product engineer."** It undersells the range, but it's what a hiring manager searches for. Do not editorialize it.

---

## The aesthetic, in his words

Direct quotes and paraphrases from the design conversation:

- _"wanting more dark and techy with beautiful gradients and highlight colors"_
- _"i like when there is a moving border color"_ — said unprompted, twice. This is a **signature element**, not a flourish.
- _"I'm a sucker for dark sleek with opacity lights, as well as gradients."_
- On AuthKit (his single favorite reference): _"I love the depth of color and overall gradient aspects. makes it feel high tech, futuristic, and a bit spacey — but the gradients are all warm with smart depth that makes it feel human."_
- **Warmth is what makes it human.** This is the load-bearing insight. Cold-only gradients read sterile. He rejects the default blue→violet AI-SaaS wash even though he loves the school it belongs to.

### Stated inspirations

- **Mycelium and plant root networks.** Loves subtle or deliberate abstract forms that resemble them — _"even if its an edge to microchip type designs."_ This became the site's signature: a recursive root system that resolves into PCB traces as it grows toward the light.
- **Sunsets and beautiful gradients.** Palette logic only — **no photographic sky imagery.**
- **"Ancient futures."** Confirmed as his actual brand position. Old soul, new machine.
- **"Night elf vibe"** — _"inspiration not direction."_ Hard line: **fantasy faces and creatures are too far.** Abstract only.
- **Night Owl theme (VSCode/Cursor).** His daily environment. He likes `#011627`.

### Reference sites he liked (and exactly why)

| Site                         | What he responded to                                                                                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **authkit.com**              | _"by far my favorite."_ Depth of color, gradients, moving gradient borders on windows, warm-but-spacey feel.                                                                                  |
| **saidalachgar.dev**         | The Selected Work section: clickable rows that elegantly open a full-screen bottom container walking through the project. _"very well executed."_ Also liked the services section animations. |
| **danielsantos.co**          | The "what I can do for you" section — a capabilities/offer block. He wants an equivalent.                                                                                                     |
| **temply.store**             | _"dark sleek with opacity lights"_ — vibed loosely.                                                                                                                                           |
| **joincobalt.com**           | Gradient hero with animated sparkles; dark sleek.                                                                                                                                             |
| **consciousconnections.app** | His own startup. Beautiful gradients and elegance. **Learn from it — do not clone it.**                                                                                                       |

---

## What he rejected — and how hard

This was Wave 1 of references. Every single one was rejected. The vehemence matters.

| Rejected                | His reaction                                             |
| ----------------------- | -------------------------------------------------------- |
| rauno.me                | _"not the vibe."_ Dislikes horizontal scroll of stuff.   |
| emilkowal.ski           | _"way too minimalistic. this is basically a blog page."_ |
| leerob.com              | _"too minimalistic."_                                    |
| patrickcollison.com     | _"minimalistic."_                                        |
| craigmod.com            | _"weirdly editorial. not appropriate at all."_           |
| maggieappleton.com      | _"weird and cluttery."_                                  |
| stephango.com           | _"horrible suggestions."_                                |
| gwern.net               | _"wtf even is this?!? NO!"_                              |
| notes.andymatuschak.org | _"no ..."_                                               |
| joshwcomeau.com         | _"dude, every one of these is horrible."_                |

**Flat nos:**

- Text-first minimalism, blog-shaped layouts, unstyled austerity
- Editorial-literary / serif long-form as the dominant mode
- Illustration, hand-drawn, "digital garden" clutter
- Academic hypertext density
- Novel navigation as a gimmick (horizontal scroll, stacked panels, drivable 3D worlds)
- Whimsy and playfulness as the tone
- **Light backgrounds**
- Heavy 3D spectacle
- Bento grids (_"meh"_)
- Neon-cyberpunk clichés — matrix green, glitch text, scanlines (_"meh"_)

---

## Design decisions that came out of iteration

Each of these was a bug or a rejected idea before it was a rule.

1. **The aurora bleed.** v1's moving border was a conic gradient sitting _behind_ the whole card; the glass blur pulled it through and washed the panel. His note: _"this stuff can't fly, where it makes the text unreadable"_ and _"I can't even really see the border change because of the full northern lights look going on."_ → Border is now a **masked ring**. Card body is near-opaque. **Never put a gradient behind body copy.**

2. **The boxy field.** v1's background network drew random node-pairs with hard 90° corners. _"just okay… I don't like how weird and boxy they feel. I'd prefer like a hybrid between tree root systems and microchips."_ And on the organic→orthogonal transition: _"comes across a tad janky."_ → Field is now a **recursive root system** with tapering branches that snap to **45° chamfered PCB routing** near the light source. Confirmed: _"root is better."_

3. **Gradient on the name.** _"gradient name is a stretch. makes it feel more ameatur."_ → Name is plain white. **Gradient is rationed to accents only.** This restraint is what makes it read senior.

4. **The field lighting up under the CTA.** _"when I hover over the resume button, the stuff behind it shouldn't light up. it makes the resume less featured."_ → Cursor-glow gain fades to 0 over any interactive element. **The interface always wins over the atmosphere.**

5. **The snap.** _"hovering over the Resume makes the filaments below turn off really suddenly. can we make the filament animation fade?"_ → All gain transitions are eased.

6. **The ring reset.** _"hovering over the cards resets the animation."_ → Speed changes must be **lerped in JS**, never done by swapping `animation-duration`.

7. **Card hover.** _"when I hover over the cards the bg of the card should slightly change."_ → Implemented: background warms toward gold, 2px lift, ring brightens and accelerates.

8. **Field scope.** _"I like how they go throughout the page."_ → The root field runs the **full page height**, not just the hero.

9. **Copy.** A placeholder thesis line ("The network is the oldest technology") was rejected: _"way too off base for the context. I'm not a sass product. Just my name?"_ → Hero is his name. **Taylor is writing the real copy himself in Cursor.** Do not write marketing copy for him.

---

## Palette decision

Three palettes were built and compared live.

- **A · Deep Field** (cool only — indigo/violet/cyan): rejected implicitly — it's the default AI-SaaS uniform.
- **B · Ember** (warm only on near-black): loses the cosmos, stops feeling intelligent.
- **C · Mycelia** (Night Owl — navy ground, blue/violet structure, coral/gold light): strong contender.
- **D · Gilt** — **CHOSEN.** Dark blue/purple base, **gold + white** gradients.
- **E · Reliquary** (gold + purple on navy): the close runner-up. Because every color is a CSS variable in one `@theme` block, switching to E later is a one-file change.

Gold hex `#E8B961` was confirmed: _"current hex seems fine."_

## Open question — unresolved

**Case study assets.** Taylor has ~4–5 case studies (Conscious Connections, Everbook, Agora, Calculate by QxMD) but has **not confirmed whether he has real screenshots / UI captures / architecture diagrams.**

The case study template in `components/work/` is therefore built to work **without imagery** — it leads with constraints, decisions, and tradeoffs, and treats media as optional enrichment. This is deliberate. A beautiful site with four thin case studies reads _worse_ to a hiring manager than a plain site with four great ones.

**If media exists, add it to `content/work.ts` and the layout will use it. If it doesn't, the case study still works.**

---

## Voice

- Not startup-marketing. Not "leverage," "seamless," "unlock," "empower."
- Plain, specific, a little dry. Senior-engineer register.
- Sentence case. No exclamation marks.
- Taylor built a `[HUMAN-HAND]` system for his own product specifically to fight AI-generated-copy smell. He will notice. Do not generate copy unless asked.
