"use client";

import type { ReactNode } from "react";
import type { PersonProof } from "@/lib/validators/showcase-intake";
import { Field } from "../../../intake/_components/field";
import { TextArea, TextField } from "../../../intake/_components/text-field";

/**
 * The link fields, in the order they are worth having.
 *
 * Platform names rather than copy, which is why they live here and not in the
 * copy pack: "LinkedIn" is a proper noun and there is no register to get right.
 * The placeholders are, though, and they are deliberately full URLs — a client
 * who types "@handle" hands us something we then have to guess the platform's
 * URL shape for, and guessing wrong points a link on their site at nobody.
 */
const LINKS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/…" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/…" },
  { key: "x", label: "X", placeholder: "x.com/…" },
  { key: "site", label: "Their own site", placeholder: "https://…" },
] as const satisfies readonly {
  key: keyof PersonProof;
  label: string;
  placeholder: string;
}[];

/**
 * One roster person's background: their links, their awards, their press.
 *
 * Their *experience entries* are not here — they live in the same flat
 * `experience` array everyone else's do, tagged with this person's key, so the
 * extractor and the intake document keep seeing one list of positions rather
 * than one list per person. This card is the annotation the array cannot hold.
 *
 * It is named by the person, not numbered. A roster card is numbered because
 * it is being built; by the time this renders the person already has a name,
 * and "02" would be a worse label than the name we were just given.
 */
export function PersonProofCard({
  name,
  role,
  proof,
  linksLabel,
  linksHelp,
  awardsLabel,
  pressLabel,
  onChange,
  onBlur,
  children,
}: {
  name: string;
  role?: string;
  proof: PersonProof;
  /** All four from the copy pack, so Taylor's pass reaches them. */
  linksLabel: string;
  linksHelp: string;
  awardsLabel: string;
  pressLabel: string;
  onChange: (next: PersonProof) => void;
  onBlur: () => void;
  /** Their experience entries, rendered by the step that owns the array. */
  children: ReactNode;
}) {
  const set = (patch: Partial<PersonProof>) => onChange({ ...proof, ...patch });
  const id = name.replace(/\W+/g, "-").toLowerCase();

  return (
    <section className="mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
      <h3 className="font-display text-[20px] font-medium leading-[1.2] tracking-[-.015em] text-(--color-ink)">
        {name}
        {role ? (
          <span className="font-body text-[15px] font-light text-(--color-dim)">
            {" "}
            · {role}
          </span>
        ) : null}
      </h3>

      <div className="mt-5">{children}</div>

      <Field id={`f-links-${id}`} label={linksLabel} help={linksHelp}>
        <div className="space-y-2.5">
          {LINKS.map((link) => (
            <TextField
              key={link.key}
              id={`f-link-${link.key}-${id}`}
              aria-label={`${link.label} for ${name}`}
              helpId={`f-links-${id}-help`}
              mode="url"
              placeholder={link.placeholder}
              value={proof[link.key] ?? ""}
              onChange={(event) => set({ [link.key]: event.target.value })}
              onBlur={onBlur}
            />
          ))}

          <TextArea
            id={`f-link-other-${id}`}
            aria-label={`Anywhere else for ${name}`}
            helpId={`f-links-${id}-help`}
            rows={2}
            placeholder="Anywhere else — IMDb, Substack, GitHub, a podcast they host"
            value={proof.otherLinks ?? ""}
            onChange={(event) => set({ otherLinks: event.target.value })}
            onBlur={onBlur}
          />
        </div>
      </Field>

      <Field id={`f-person-awards-${id}`} label={awardsLabel}>
        <TextArea
          id={`f-person-awards-input-${id}`}
          rows={3}
          value={proof.awards ?? ""}
          onChange={(event) => set({ awards: event.target.value })}
          onBlur={onBlur}
        />
      </Field>

      <Field id={`f-person-press-${id}`} label={pressLabel}>
        <TextArea
          id={`f-person-press-input-${id}`}
          rows={3}
          value={proof.press ?? ""}
          onChange={(event) => set({ press: event.target.value })}
          onBlur={onBlur}
        />
      </Field>
    </section>
  );
}
