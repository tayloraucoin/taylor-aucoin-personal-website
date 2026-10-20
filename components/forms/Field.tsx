import type {
  ChangeEventHandler,
  HTMLInputAutoCompleteAttribute,
  ReactNode,
} from "react";
import { ErrorLine } from "./ErrorLine";

/**
 * The Components inputs and textarea (kit; PP-2 reused): a visible Small 15
 * label, the error line between label and control when invalid, and the
 * control with a strong hairline that turns a 2px text-colour border when
 * invalid. Placeholders are hints under the label, never the label (A-16).
 * Controlled, so a failed send keeps every answer.
 */
export const CONTROL =
  "block w-full rounded-(--radius) border border-(--color-line-strong) bg-transparent px-[14px] text-small text-(--color-ink) placeholder:text-(--color-dim) transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) aria-invalid:border-2 aria-invalid:border-(--color-ink) aria-invalid:px-[13px]";

type Common = {
  id: string;
  name: string;
  label: string;
  hint?: string;
  /** The error line's sentence; its presence marks the field invalid. */
  error?: ReactNode;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  maxLength?: number;
  className?: string;
};

function errorIdFor(id: string) {
  return `${id}-error`;
}

function FieldShell({
  id,
  label,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2.5 block text-small font-medium text-(--color-ink)"
      >
        {label}
      </label>
      {error ? (
        <ErrorLine id={errorIdFor(id)} className="mb-2.5">
          {error}
        </ErrorLine>
      ) : null}
      {children}
    </div>
  );
}

export function TextField({
  id,
  name,
  label,
  hint,
  error,
  value,
  onChange,
  maxLength,
  className,
  type = "text",
  autoComplete,
}: Common & {
  type?: "text" | "email";
  autoComplete?: HTMLInputAutoCompleteAttribute;
}) {
  return (
    <FieldShell id={id} label={label} error={error} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={hint}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorIdFor(id) : undefined}
        className={`${CONTROL} h-[46px]`}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  hint,
  error,
  value,
  onChange,
  maxLength,
  className,
}: Common) {
  return (
    <FieldShell id={id} label={label} error={error} className={className}>
      <textarea
        id={id}
        name={name}
        placeholder={hint}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorIdFor(id) : undefined}
        className={`${CONTROL} h-28 resize-none py-[13px] leading-[1.6] aria-invalid:py-[12px]`}
      />
    </FieldShell>
  );
}
