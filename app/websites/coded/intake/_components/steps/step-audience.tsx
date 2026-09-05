"use client";

import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor } from "@/lib/intake/tracks";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";

/**
 * Step 2 — Who this site is for.
 *
 * Every label and help line is
 * `docs/websites/portfolio-intake-questions-v2.md` § Step 2, verbatim.
 *
 * The longest unrelieved run of long-text questions in the flow, so it is
 * grouped rather than listed: who is here, then what the site should do about
 * them, then who the person is. A creative answering nine open boxes in a row
 * stops at about the fifth; three short stretches with a hairline between them
 * read as three questions, not nine.
 */
export function StepAudience({
  token,
  initial,
  flavour,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
}) {
  const pack = copyPackFor(flavour);
  const form = useStepAutosave({ token, stepKey: "audience", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <ChoiceAnswer
        form={form}
        name="audiences"
        label="Who ends up on your site?"
        options={pack.audiences}
        multiple
      />

      <TextAnswer form={form} name="audiencesOther" label="Anyone else?" />

      <TextAnswer
        form={form}
        name="whoMattersMost"
        label="Who matters most?"
        help="If the site could only impress one of them, which one?"
      />

      <Group label="What the site should do about them">
        <LongAnswer
          form={form}
          name="whatShouldTheyDo"
          label="What do you want a visitor to actually do?"
          help="The buttons, in other words. For each kind of visitor: watch something, email you, book a call, download the deck, pass your name along. Plain words are fine — name the action, not the feeling."
        />

        <LongAnswer
          form={form}
          name="wantMoreOf"
          label={pack.wantMoreOf.label}
          help={pack.wantMoreOf.help}
        />

        <LongAnswer
          form={form}
          name="stopAttracting"
          label={pack.stopAttracting.label}
          help={pack.stopAttracting.help}
        />
      </Group>

      <Group label="How they should read you">
        <LongAnswer
          form={form}
          name="whyPickYou"
          label="Why do people pick you?"
          help="What people say when they recommend you — not what you'd write in a cover letter."
        />

        <LongAnswer
          form={form}
          name="whatYouAreNot"
          label="What are you not?"
          help={pack.whatYouAreNotHelp}
        />

        <LongAnswer
          form={form}
          name="afterOneVisit"
          label="After one visit, what should someone think of you?"
          help={pack.afterOneVisitHelp}
        />
      </Group>
    </>
  );
}

/**
 * A hairline-separated cluster with a mono group label — the StepShell law for
 * a step past roughly seven fields (UX spec §5.1).
 */
function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-(--color-faint) pt-7">
      <h2 className="mb-6 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
        {label}
      </h2>
      {children}
    </section>
  );
}
