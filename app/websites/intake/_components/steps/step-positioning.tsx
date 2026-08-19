"use client";

import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { LongAnswer, TextAnswer } from "../answer-inputs";

/**
 * Step 4 — Your customers and competition.
 *
 * The three values are three separate inputs rather than one textarea, and
 * that is the entire trick: a single box gets one answer, three boxes get
 * three. The same reasoning is why "what are you not?" is asked directly —
 * the negative usually produces the sharpest line on the finished site.
 */
export function StepPositioning({
  token,
  initial,
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "positioning", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <LongAnswer form={form} name="idealCustomer" label="Describe your ideal customer" />
      <LongAnswer form={form} name="badFit" label="Who's a bad fit?" />
      <LongAnswer
        form={form}
        name="whyPickYou"
        label="Why do people pick you over the alternative?"
      />
      <LongAnswer form={form} name="whoYouLoseTo" label="Who do you lose work to, and why?" />

      <TextAnswer
        form={form}
        name="valueOne"
        label="Three things you won't compromise on"
        help="One per box."
      />
      <TextAnswer form={form} name="valueTwo" label="And the second" />
      <TextAnswer form={form} name="valueThree" label="And the third" />

      <LongAnswer form={form} name="sellYourself" label="Sell yourself in one sentence" />
      <LongAnswer
        form={form}
        name="whatYouAreNot"
        label="What are you not?"
        help="'We're not the cheapest' or 'we're not a chain' — whatever's true."
      />
    </>
  );
}
