import type { ReactNode } from "react";
import { ShowcaseStart } from "@/app/websites/coded/intake/_components/showcase-start";
import { StepAbout } from "@/app/websites/coded/intake/_components/steps/step-about";
import type { SaveState } from "@/app/websites/intake/_components/save-indicator";
import { StepShell } from "@/app/websites/intake/_components/step-shell";
import { flavourForKind, stepsFor } from "@/lib/intake/tracks";
import type { AnyIntakeStepKey } from "@/lib/types/intake";
import { SaveLineDriver } from "./save-line-driver";
import { venFixture, type VenStateKey } from "./venture-fixtures";

/**
 * One VEN state, drawn as the client meets it: the start form, or its one
 * step inside `StepShell`, seeded from `venture-fixtures.ts`.
 *
 * Rendered inside the harness's `PreviewModeProvider`, so every write path
 * beneath refuses. Each VEN piece adds the steps its states draw.
 */
export function VentureStateView({
  stateKey,
  token,
  save,
  navigate,
}: {
  stateKey: VenStateKey;
  token: string;
  save: SaveState;
  navigate?: { step: (stepKey: AnyIntakeStepKey) => string; done: string };
}): ReactNode {
  const fixture = venFixture(stateKey);

  if (fixture.surface === "start") {
    return <ShowcaseStart inProgress={null} seed={fixture.startSeed} />;
  }

  const answers = fixture.answers[fixture.surface] ?? {};
  const disciplines = Array.isArray(answers.disciplines)
    ? (answers.disciplines as string[])
    : undefined;
  const flavour = flavourForKind(fixture.kind, disciplines);
  const step = stepsFor("showcase", flavour).find(
    (entry) => entry.key === fixture.surface,
  )!;

  return (
    <StepShell
      track="showcase"
      token={token}
      step={step}
      flavour={flavour}
      navigate={navigate}
      saveSlot={<SaveLineDriver initial={save} />}
    >
      {body()}
    </StepShell>
  );

  function body(): ReactNode {
    switch (fixture.surface) {
      case "about":
        return (
          <StepAbout
            token={token}
            initial={answers}
            initialKind={fixture.kind}
            initialPicking={fixture.picking}
            prefill={{
              contactName: "Sam Fixture",
              contactEmail: "sam@fixture.invalid",
              contactPhone: null,
            }}
            headshots={[]}
          />
        );
      default:
        return (
          <p className="text-meta text-(--color-dim)">
            No VEN fixture drawn for step &ldquo;{fixture.surface}&rdquo; yet.
          </p>
        );
    }
  }
}
