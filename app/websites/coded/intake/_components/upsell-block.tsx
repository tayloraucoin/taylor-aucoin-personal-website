"use client";

import type { UpsellBlock as UpsellBlockCopy } from "@/lib/intake/showcase-copy";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../intake/_components/answer-inputs";
import { Reveal } from "../../../intake/_components/reveal";
import type { useStepAutosave } from "../../../intake/_lib/use-step-autosave";

/**
 * The questions one purchased add-on opens, wherever they belong.
 *
 * **Conditional on what was paid for, never on an answer.** `Reveal`'s `extra`
 * condition reads the settled basket, so nothing here can be opened by ticking
 * a box — and in document mode it renders unconditionally under a line naming
 * the add-on, which is the only way a review of the questions can see a block
 * a preview never buys (ADM-4).
 *
 * One component for all six because the blocks differ only in their words. The
 * copy lives in the pack (`UPSELLS`), so Taylor's pass reaches every add-on's
 * questions in the same file as every other question, and adding a seventh
 * add-on is a copy entry plus one line at the step that should ask it — never
 * a new component.
 *
 * The callout is the durable track's shape, deliberately: same border, same
 * mono eyebrow, same body register. A client who bought Stripe setup on one
 * track and animations on the other should meet the same kind of thing.
 */
export function UpsellQuestions({
  form,
  extras,
  extra,
  block,
}: {
  form: ReturnType<typeof useStepAutosave>;
  /** What this engagement actually paid for. Empty in a preview. */
  extras: readonly string[];
  /** The extras-vocabulary key, e.g. `animations`. */
  extra: string;
  block: UpsellBlockCopy;
}) {
  return (
    <Reveal extras={extras} dependsOn={{ extra }}>
      <>
        <div className="mb-7 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
          <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
            {block.eyebrow}
          </p>
          <p className="mt-3 font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
            {block.body}
          </p>
        </div>

        {block.fields.map((field) =>
          field.options ? (
            <ChoiceAnswer
              key={field.key}
              form={form}
              name={field.key}
              label={field.label}
              help={field.help}
              options={field.options}
              multiple={field.multiple}
            />
          ) : field.long ? (
            <LongAnswer
              key={field.key}
              form={form}
              name={field.key}
              label={field.label}
              help={field.help}
            />
          ) : (
            <TextAnswer
              key={field.key}
              form={form}
              name={field.key}
              label={field.label}
              help={field.help}
            />
          ),
        )}
      </>
    </Reveal>
  );
}
