"use client";

import type { TeamMemberAnswer } from "@/lib/validators/intake";
import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { ChoiceAnswer, LongAnswer, TextAnswer } from "../answer-inputs";
import { Field } from "../field";
import { RepeatableBlock } from "../repeatable-block";
import { TextField } from "../text-field";

const JUST_YOU = [
  { value: "yes", label: "Just me" },
  { value: "no", label: "There's a few of us" },
] as const;

const SHOW_TEAM = [
  { value: "yes", label: "Yes, put them on the site" },
  { value: "no", label: "No, keep it to me" },
] as const;

function asTeam(value: unknown): TeamMemberAnswer[] {
  return Array.isArray(value) ? (value as TeamMemberAnswer[]) : [];
}

/**
 * Step 8 — Your team.
 *
 * "Tell us about your team" is asked whether or not they want the team named
 * on the site, and that is deliberate. Someone who says "keep it to me" has
 * refused a team page, not refused to explain how the work actually gets done
 * — and "who a customer usually deals with" is the answer the About page
 * needs either way.
 */
export function StepTeam({
  token,
  initial,
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "team", initial });
  useReportSaveState(form.state, form.retry);

  const hasTeam = form.values.justYou === "no";

  return (
    <>
      <ChoiceAnswer
        form={form}
        name="justYou"
        label="Is it just you?"
        options={JUST_YOU}
      />

      {hasTeam ? (
        <>
          <TextAnswer form={form} name="headcount" label="How many of you?" />

          <LongAnswer
            form={form}
            name="aboutTeam"
            label="Tell us about your team"
            help="How long they've been with you, what each of them is best at, who a customer usually deals with."
          />

          <ChoiceAnswer
            form={form}
            name="showTeam"
            label="Do you want them on the site?"
            options={SHOW_TEAM}
          />

          {form.values.showTeam === "yes" ? (
            <Field id="f-team" label="Names and roles">
              <RepeatableBlock<TeamMemberAnswer>
                items={asTeam(form.values.team)}
                onChange={(next) => form.setValue("team", next)}
                emptyItem={() => ({})}
                addLabel="Add another person"
                renderItem={(member, index, update) => (
                  <div className="space-y-3">
                    <TextField
                      id={`team-${index}-name`}
                      aria-label="Name"
                      placeholder="Name"
                      value={member.name ?? ""}
                      onChange={(e) => update({ ...member, name: e.target.value })}
                      onBlur={form.flush}
                    />
                    <TextField
                      id={`team-${index}-role`}
                      aria-label="Role"
                      placeholder="What they do"
                      value={member.role ?? ""}
                      onChange={(e) => update({ ...member, role: e.target.value })}
                      onBlur={form.flush}
                    />
                  </div>
                )}
              />
            </Field>
          ) : null}
        </>
      ) : null}

      <LongAnswer
        form={form}
        name="yourBackground"
        label="Your background"
        help="How you got into this, training, qualifications."
      />
    </>
  );
}
