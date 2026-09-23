import { groupReviewAnswers, scaleChange, tenths } from "@/lib/review/answers";
import type { ReviewAnswer, ReviewAnswers } from "@/lib/types/review";

/**
 * A submission's structured answers (REV-2), in the order the client's form
 * asked them, each note under its answer. Read from the stored label
 * snapshot only, so it needs nothing from the client site (M-REV-5).
 */
export function ReviewAnswersView({
  answers,
}: Readonly<{ answers: ReviewAnswers | null | undefined }>) {
  const sections = groupReviewAnswers(answers);

  if (sections.length === 0) {
    return (
      <p className="text-sm text-(--color-dim)">
        No structured answers in this submission.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h4 className="text-xs tracking-wide text-(--color-dim) uppercase">
            {section.title}
          </h4>
          <dl className="flex flex-col gap-3">
            {section.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-1 border-l-2 border-(--color-line-soft) pl-3"
              >
                <dt className="text-sm text-(--color-ink)">{entry.label}</dt>
                {entry.answer ? (
                  <dd className="text-sm text-(--color-body)">
                    <AnswerValue answer={entry.answer} />
                  </dd>
                ) : null}
                {entry.note ? (
                  <dd className="text-sm whitespace-pre-wrap text-(--color-body) italic">
                    &ldquo;{entry.note}&rdquo;
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function AnswerValue({ answer }: Readonly<{ answer: ReviewAnswer }>) {
  switch (answer.kind) {
    case "rank":
      return (
        <ol className="flex flex-col">
          {answer.value.map((option, i) => (
            <li key={option.id}>
              <span className="font-(family-name:--font-mono) text-xs text-(--color-dim)">
                {i + 1}.
              </span>{" "}
              {option.label}
            </li>
          ))}
        </ol>
      );
    case "scale":
      return (
        <span className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-(family-name:--font-mono) text-(--color-ink)">
            {tenths(answer.value)}
          </span>
          {answer.baseline !== null ? (
            <span className="text-xs">
              {tenths(answer.baseline)} at intake ·{" "}
              {scaleChange(answer.value, answer.baseline)}
            </span>
          ) : null}
          <span className="text-xs text-(--color-dim)">
            {answer.ends.low} 0 ↔ 7 {answer.ends.high}
          </span>
        </span>
      );
    case "choice":
      return <>{answer.value.label}</>;
    case "text":
      return <span className="whitespace-pre-wrap">{answer.value}</span>;
  }
}
