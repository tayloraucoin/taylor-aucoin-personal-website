# Taylor's feedback, round 2 — 2026-10-19

Taylor's own words, given after round 1 (lanes A to D) was merged on `feature/website-rebrand` and served on :4320. This file is the source of truth for round 2. Images are in `assets/`.

## Assets

| File                                    | What it is                                                                                                                                                                                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/lightbox-max-update-depth.webp` | Next dev overlay: "Maximum update depth exceeded" at `components/work/MediaLightbox.tsx` (216:7), `useEffect.measure`, on clicking a branding image in home's selected work                                                              |
| `assets/tool-icons-reference.png`       | Reference for the tool-icon idea: a "Methods of madness" row of round-ended pills, each holding one tool logo (Figma, a 3D cube mark, Claude, OpenAI, Gemini, Jira) on a dark ground. A reference only, not a spec: the designer decides |

## Feedback, as given

- For the /work Websites tab, where the All | … chips disappear: maybe don't hide them on desktop, but darken or disable them all instead, because the height still changes. That would stop the sudden jump.
- The Kryshan website has no images. Can you capture them from the website? If not, tell me what to capture.
  - Where is the link? https://kryshanrandel.com/
  - Make sure the images also go onto /websites.
- Error when clicking a branding image in home's selected work. It looks like it opens all the images from selected work, etc. (see the screenshot).
- `~/Desktop/portfolio media` has more media for the experience. Please add it. Use discernment about what to include and in what order.
- Is everything from https://www.tayloraucoin.com/capabilities included?
- On home, can we also use tool icons, similar to the attached? Should I make tools separate from technology? Pass this to our designer to decide what to do, or whether to do it.
- Comment out the notes/email newsletter input. I'll set it up later.
- Should home end with a reference to get in contact, or a CTA? I guess it goes to Work with me, but the link is hardly noticeable.
- I should be able to click a testimonial to open a dialog and read more. The dialog should be able to cycle through the testimonials.

## Orchestrator's notes (2026-10-19, not Taylor's words)

- **The lightbox loop:** the effect at `MediaLightbox.tsx` ~L180–233 depends on `[isOpen, items, railItems]`. If a caller builds `items` or `railItems` inline, they are new arrays on every render, so `measure()`'s `setBox` re-renders and the effect runs again, forever. Also check why a branding click opens every selected-work image: the rail is probably fed the whole section's media instead of the one row's.
- **The /work chip row:** round 1 (lane A, b6fad3d) reserved 52px for the row at md and up, yet Taylor still sees the jump. Reproduce it on :4320 at 1440 before choosing the fix.
- **Kryshan:** the row in `content/work/rows.ts` (`kryshan-randel`) has `gallery: []` and no live link. `app/websites/_components/ExampleRow.tsx` already derives a link's name from its URL.
- **Portfolio media:** 74 files, 815 MB. Each `.mov` has an `.mp4` twin, and ffmpeg isn't installed. One folder is named `cho-ventures/` with `chozen/` inside it: on the site, any file, path, alt text or caption from it says Future of Cities and never Cho, ChoZen or ChoVerse (memory: the family office is Future of Cities).
- **The notes signup:** commenting it out keeps the code and the migration; only the home block stops rendering. This drops a home section Taylor named himself.
