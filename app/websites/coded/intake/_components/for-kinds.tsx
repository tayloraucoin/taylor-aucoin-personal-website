"use client";

import type { ReactNode } from "react";
import { useKindScope } from "@/components/intake/preview-mode";
import type {
  ShowcaseGroup,
  ShowcaseKind,
  ShowcaseKindQuestion,
  ShowcaseWorkShape,
} from "@/lib/intake/showcase-kinds";
import {
  groupsFor,
  kindAsks,
  showcaseKinds,
  workShapeFor,
} from "@/lib/intake/tracks";

/**
 * A block that some kinds meet and others do not.
 *
 * Unlike a `Reveal`, nothing here is conditional on an answer: the kind is
 * fixed before step 1 renders, so these blocks are **present or absent, never
 * revealed** (`showcase-kinds.ts`). On a client's screen this wrapper does
 * exactly what the ternary it replaces did.
 *
 * What it adds is the **overview**. In the "Every kind" scope both branches
 * render, each tagged with the kinds that actually meet it — so a reviewer
 * reading top to bottom sees base questions untagged and kind-specific ones
 * named, in one pass, without a matrix table that would be a second home for
 * the copy (D-ADM-11).
 *
 * **The tag is computed from the kind registry, never typed.** That is the
 * whole reason the per-kind facts moved onto `KindEntry` in commit 1 (M-ADM-7):
 * an overview that reports "who is asked this" from a component's private
 * comparison is an overview that can lie, and two of those comparisons already
 * disagreed with each other about what they meant.
 *
 * Placement is by consumer: kinds are a coded-track concept and every caller is
 * in this tree. The registry is reached through `lib/intake/tracks.ts`, the
 * sanctioned seam — never by importing `showcase-kinds.ts` directly.
 */

/** A predicate over kinds. The three helpers below cover every real use. */
export type KindTest = (kind: ShowcaseKind) => boolean;

/** Kinds whose questionnaire carries a field group — the ask, the claims. */
export function hasGroup(group: ShowcaseGroup): KindTest {
  return (kind) => groupsFor(kind).has(group);
}

/** Kinds asked one of the five optional questions. */
export function asks(question: ShowcaseKindQuestion): KindTest {
  return (kind) => kindAsks(kind, question);
}

/**
 * The kinds a test is *not* true of.
 *
 * Added at PORT-19, when the video question was retired and the tools group
 * was left as the only side of its branch. Writing it as `not(asks("video"))`
 * keeps the registry the source of who meets it — the alternative was an
 * `otherwise` with an empty element opposite it, which reads as a branch that
 * has forgotten what it is for, and an overview tag that would name the empty
 * side as if something were there.
 */
export function not(test: KindTest): KindTest {
  return (kind) => !test(kind);
}

/** Kinds whose step 4 fills a particular array. */
export function fills(shape: ShowcaseWorkShape): KindTest {
  return (kind) => workShapeFor(kind) === shape;
}

/** The kinds a test is true of, as their keys, in registry order. */
function matching(test: KindTest): string[] {
  return showcaseKinds()
    .filter((entry) => test(entry.key))
    .map((entry) => entry.key);
}

/**
 * Keys rather than the client-facing labels, deliberately.
 *
 * The labels are prose sentences ("A venture or project — raising money…") and
 * six of them on one line is unreadable; the keys are short, they are what the
 * URL and the answers document carry, and this admin already shows an internal
 * key beside a public name (the track switch, 2026-09-01).
 */
function KindTag({ kinds }: Readonly<{ kinds: readonly string[] }>) {
  return (
    <p
      data-md="kinds"
      className="mb-3 font-mono text-[10px] tracking-[.12em] text-(--color-c2)"
    >
      asked of: {kinds.join(" · ")}
    </p>
  );
}

export function ForKinds({
  kind,
  test,
  otherwise,
  children,
}: Readonly<{
  kind: ShowcaseKind;
  test: KindTest;
  /**
   * What the kinds failing the test are asked instead, where there is such a
   * thing — a photo of the place rather than of the person, the tools question
   * rather than the video one. Absent for a block that simply does not exist
   * for them.
   */
  otherwise?: ReactNode;
  children: ReactNode;
}>) {
  const scope = useKindScope();

  if (scope === "one") {
    return <>{test(kind) ? children : (otherwise ?? null)}</>;
  }

  const yes = matching(test);
  const no = showcaseKinds()
    .map((entry) => entry.key)
    .filter((key) => !yes.includes(key));

  return (
    <>
      <div className="mb-8">
        <KindTag kinds={yes} />
        {children}
      </div>
      {otherwise ? (
        <div className="mb-8">
          <KindTag kinds={no} />
          {otherwise}
        </div>
      ) : null}
    </>
  );
}

/**
 * A branch the overview can name but cannot render.
 *
 * The venture pack is the only one whose `stage` question has no generic floor,
 * so in the "Every kind" scope — which renders generic words — there is no copy
 * to show. Printing nothing would be the silent omission this surface forbids;
 * inventing a sentence would be worse. So it says who is asked, and where the
 * words are (D-ADM-11).
 */
export function ForKindsStub({
  test,
  note,
}: Readonly<{ test: KindTest; note: string }>) {
  // Nothing to say on a single-kind view: either that kind is asked the
  // question and its own pack supplies the words, or it is not asked at all.
  if (useKindScope() === "one") return null;

  return (
    <div className="mb-8">
      <KindTag kinds={matching(test)} />
      <p
        data-md="help"
        className="font-body text-[15px] font-light leading-[1.5] text-(--color-dim)"
      >
        {note}
      </p>
    </div>
  );
}
