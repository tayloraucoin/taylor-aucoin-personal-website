"use client";

import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";

const AUDIENCES = [
  { value: "producers", label: "Producers or production companies" },
  { value: "agencies", label: "Agencies or brands" },
  { value: "direct", label: "Direct clients" },
  { value: "festivals", label: "Festivals or programmers" },
  { value: "students", label: "Students or their parents" },
  { value: "press", label: "Press" },
  { value: "recruiters", label: "Recruiters or employers" },
  { value: "peers", label: "Other people in my field" },
  { value: "investors", label: "Investors" },
  { value: "collaborators", label: "Prospective collaborators" },
] as const;

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
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "audience", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <ChoiceAnswer
        form={form}
        name="audiences"
        label="Who ends up on your site?"
        options={AUDIENCES}
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
          label="What should they do next?"
          help="For each kind of visitor — watch the reel, email you, book a call, pass your name along. Plain words are fine."
        />

        <LongAnswer
          form={form}
          name="wantMoreOf"
          label="What work do you want more of?"
          help="The site's job is shaping what comes next, not cataloguing what came before. What do you want the phone ringing about?"
        />

        <LongAnswer
          form={form}
          name="stopAttracting"
          label="What do you want to stop attracting?"
          help="Work you'd rather age out of — even if it pays."
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
          help={`"I'm not the cheap option" or "I'm not a corporate video guy" — whatever's true.`}
        />

        <LongAnswer
          form={form}
          name="afterOneVisit"
          label="After one visit, what should someone think of you?"
          help={`The impression, in your own words. "Someone you'd trust with a crew" reads differently from "someone who makes strange, beautiful things" — both are good answers.`}
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
