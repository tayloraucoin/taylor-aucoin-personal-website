---
title: "Track: brand"
description: "Read when a product's brand is to be settled, from new-project or migrate as an optional step, or on demand from the prompt builder as an exercise: three regular Claude threads (what, who, value and kit), each reading the one before, then one Claude Code thread to land the files when it is for a repo."
layer: workflows
status: draft
thread: P-M
role: Hearth
date: 2026-10-10
last_reviewed: 2026-10-10
supersedes:
load_when: on request
---

# Brand: what it is, who it is for, then how it looks and speaks

> **In one line:** three threads in regular Claude, not Claude Code, each handing files to the next: what the product is, who buys it, and the brand that joins them. When the brand is for a repo, one Claude Code thread lands the files.

## When it applies

- **Onboarding.** A new project or a migration offers it as an optional step (round F of [`new-project/README.md`](../../runbooks/new-project/README.md), step 9 of [`migrate/README.md`](../../runbooks/migrate/README.md)). The files land in the product's repo.
- **Exercise.** Anyone asks the prompt builder to brand something: a client, an idea, a side project. Nothing lands in a repo; each thread's files are downloads.

It is not this track when the brand exists and only needs applying to the repo: that is step 3 of the new-project guide, or a one-off.

## Stages

| Stage                   | Thread                                                           | Prompt                                                                        | Hands back                                                                                        |
| ----------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 0. Repo scan (optional) | Claude Code in the product's repo, Opus 5.5 at medium, read-only | [`0-repo.md`](../../prompts/brand/0-repo.md)                                  | `repo-scan.md`, for thread 1                                                                      |
| 1. What                 | Regular Claude, Opus 5.5, extended thinking                      | [`1-what.md`](../../prompts/brand/1-what.md)                                  | `market/product.md`, `brand/inspiration.md`                                                       |
| 2. Who                  | Regular Claude, Opus 5.5, Research on                            | [`2-who.md`](../../prompts/brand/2-who.md)                                    | `market/audience.md`                                                                              |
| 3. Value and kit        | Regular Claude, Opus 5.5, extended thinking, code, web search    | [`3-kit.md`](../../prompts/brand/3-kit.md)                                    | `market/value.md`, `brand/pillars.md`, `brand/voice.md`; the bundle, or `kit.md` in exercise mode |
| 4. Land                 | Claude Code in the product's repo (onboarding only)              | The landing prompt in [`branding.md`](../../runbooks/new-project/branding.md) | Every file in its place, the checks green, one commit                                             |

Stage 0 runs only when the product already has code (a migrated repo, or an exercise on an existing app); a fresh duplicate of the toolkit skips it. Paths are under `docs/product/` in the product's repo. Each thread tells the operator which files to save and which thread to open next. Thread 2 can wait: when the operator has no time for research, thread 3 runs on product.md alone and says what it could not ground.

## Cast and QA

Compass and Alembic for the what, Hearth for the instincts; Envoy and Sage for the who; Compass and Sage for the value report, Hearth for the brand with Plumb, Gloss and Turner. QA is the operator's yes at the end of each thread's parts; the landing thread runs at Q1 with the branding table's checks.

## The builder's own questions for this track

Asked in place of Round D. In onboarding the set-up thread already knows the answers and prints the pointer itself.

| #   | Question                            | Options                                                                                                                                                   | Sets                                                   |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| R1  | Onboarding or exercise?             | **Exercise** (Recommended when no repo is named): files come back as downloads. **Onboarding**: files land in a named repo, then the landing thread runs. | Each prompt's `Mode:` line; whether stage 4 runs       |
| R2  | What exists already?                | Nothing but the idea. Some material (name, notes, a deck). A full brand, to audit.                                                                        | What thread 1 is told to expect; thread 3's audit mode |
| R3  | Does the product have code to scan? | **Yes**: name the repo; stage 0 runs first, read-only. **No**: thread 1 starts from the operator's dump.                                                  | Whether stage 0 runs                                   |
| R4  | Run the who research?               | **Yes** (Recommended): the brand is built on evidence about the buyer. **Not now**: thread 3 runs on the what alone and marks its guesses.                | Whether stage 2 runs                                   |

The standing rounds shrink: no QA question (the operator's yes is the check), no branch question, involvement "decide together" (the interview is the work).

## What the builder prints

One block per thread to open, in order, each naming its model and settings, its `Mode:` line filled, and what to attach. The prompts themselves are pasted from the files above, not reprinted. Then the forecast: three threads of about an hour each of the operator's time, most of it in thread 1's dump and thread 3's choices.

## What gets written

Onboarding: in the product's repo, `docs/product/market/` (product, audience, value), `docs/product/brand/` (inspiration, pillars, voice), and the rows of the branding table. Exercise: nothing in any repo.
