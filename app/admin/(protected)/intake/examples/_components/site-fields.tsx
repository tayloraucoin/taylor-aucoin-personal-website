"use client";

import {
  BUILD_LEVELS,
  DENSITY_TAGS,
  EXAMPLE_GROUPS,
  GROUND_TAGS,
  GROUP_ORDER,
  MOTION_TAGS,
  STYLE_TAGS,
} from "@/content/intake-examples/taxonomy";
import { hostOf } from "@/lib/intake/taste-picks";
import { EXAMPLE_PACKS, type ExamplePack } from "@/lib/intake/example-packs";
import { ChipSet, FieldLabel, Segmented, TextField } from "./pickers";
import { packLabel } from "./pack-words";

/**
 * Every judgement a site carries, in the order they get made.
 *
 * One component, two callers — the create form and the drawer's editor — so a
 * field cannot exist on one and not the other, and the vocabulary cannot drift
 * between adding a site and editing it. That was the shape of the first cut's
 * worst failure: creation took a URL and editing took everything else.
 */
export type SiteFieldValues = {
  name: string;
  role: string;
  url: string;
  group: string | null;
  ground: string | null;
  motion: string | null;
  density: string | null;
  build: string | null;
  styles: string[];
  embed: boolean;
  checkedOn: string;
  packs: ExamplePack[];
};

const entries = <T extends string>(map: Record<T, string>) =>
  (Object.entries(map) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));

export function SiteFields({
  values,
  onChange,
  slug,
  slugLocked,
}: {
  values: SiteFieldValues;
  onChange: <K extends keyof SiteFieldValues>(
    key: K,
    value: SiteFieldValues[K],
  ) => void;
  slug?: string;
  slugLocked?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <TextField
        label="Name"
        value={values.name}
        onChange={(next) => onChange("name", next)}
        placeholder="Matias Boucard"
      />
      <TextField
        label="Role"
        value={values.role}
        onChange={(next) => onChange("role", next)}
        placeholder="Cinematographer · commercials, music video"
      />
      <TextField
        label="Link"
        value={values.url}
        onChange={(next) => onChange("url", next)}
        mono
        placeholder="https://…"
        note={values.url ? `A client sees: ${hostOf(values.url)}` : undefined}
      />

      {slug ? (
        <div className="flex flex-col gap-2">
          <FieldLabel>Slug</FieldLabel>
          <p className="font-(family-name:--font-mono) text-xs text-(--color-body)">
            {slug}
          </p>
          {slugLocked ? (
            <p className="max-w-[48ch] text-sm text-(--color-dim)">
              {/* [COPY — draft] */}
              Fixed once published — a client&apos;s picks are stored against
              it.
            </p>
          ) : null}
        </div>
      ) : null}

      <ChipSet
        label="Packs"
        values={values.packs}
        options={EXAMPLE_PACKS.map((pack) => ({
          value: pack,
          label: packLabel(pack),
        }))}
        onChange={(next) => onChange("packs", next as ExamplePack[])}
      />

      <Segmented
        label="Group"
        value={values.group}
        options={GROUP_ORDER.map((key) => ({
          value: key,
          label: EXAMPLE_GROUPS[key].title,
        }))}
        onChange={(next) => onChange("group", next)}
        /* The definition of the thing just chosen, at the moment of the
           choice — what stops the fortieth site drifting. */
        note={
          values.group
            ? EXAMPLE_GROUPS[values.group as keyof typeof EXAMPLE_GROUPS]?.line
            : undefined
        }
      />

      <Segmented
        label="Ground"
        value={values.ground}
        options={entries(GROUND_TAGS)}
        onChange={(next) => onChange("ground", next)}
      />
      <Segmented
        label="Motion"
        value={values.motion}
        options={entries(MOTION_TAGS)}
        onChange={(next) => onChange("motion", next)}
      />
      <Segmented
        label="Density"
        value={values.density}
        options={entries(DENSITY_TAGS)}
        onChange={(next) => onChange("density", next)}
      />

      <ChipSet
        label="Styles"
        values={values.styles}
        options={entries(STYLE_TAGS)}
        onChange={(next) => onChange("styles", next)}
        max={3}
        note="Three at most."
      />

      <Segmented
        label="Build"
        value={values.build}
        options={entries(BUILD_LEVELS)}
        onChange={(next) => onChange("build", next)}
        /* D-PORT-15's law, stated where the field is set. */
        note="Never shown to a client. It prints in the intake document, so a favourite tells you what the build costs."
      />

      <label className="flex flex-col gap-2">
        <FieldLabel>Checked on</FieldLabel>
        <span className="flex items-center gap-3">
          <input
            type="date"
            value={values.checkedOn}
            onChange={(event) => onChange("checkedOn", event.target.value)}
            className="min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
          <button
            type="button"
            onClick={() =>
              onChange("checkedOn", new Date().toISOString().slice(0, 10))
            }
            className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-3 text-sm text-(--color-body) hover:bg-(--color-card-hover)"
          >
            Today
          </button>
        </span>
      </label>
    </div>
  );
}

export function emptySiteFields(packs: ExamplePack[] = []): SiteFieldValues {
  return {
    name: "",
    role: "",
    url: "",
    group: null,
    ground: null,
    motion: null,
    density: null,
    build: null,
    styles: [],
    embed: false,
    checkedOn: new Date().toISOString().slice(0, 10),
    packs,
  };
}
