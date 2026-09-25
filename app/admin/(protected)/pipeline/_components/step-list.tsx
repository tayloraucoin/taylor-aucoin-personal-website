"use client";

import { useEffect, useId, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { CopyButton } from "@/app/admin/_components/copy-button";
import { adminRoutes } from "@/lib/routes";
import { PROMPT_TARGET_LABELS, type PromptTarget } from "@/lib/types/pipeline";
import { reorderStepsAction, setStepArchivedAction } from "../_actions/steps";

/**
 * The playbook, in order (PIPE-2).
 *
 * Copy is the row's primary action; the title is the way in to edit. Order
 * changes by dragging the grip — pointer or keyboard — and saves on drop, so
 * there is no "save order" step to forget. A failed save puts the list back
 * where the server has it and says so.
 */

export type StepListItem = {
  id: string;
  title: string;
  prompt: string | null;
  promptTarget: PromptTarget | null;
  hasEmail: boolean;
};

const INSTRUCTIONS = {
  draggable:
    "To move a step, press Space on its grip. Use the arrow keys to move it, Space again to drop it, Escape to cancel.",
};

export function StepList({
  active,
  archived,
}: {
  active: StepListItem[];
  archived: StepListItem[];
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  // dnd-kit's own counter ids differ between server and client render.
  const dndId = useId();
  const [order, setOrder] = useState(active);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  // The server's order is the truth; take it whenever it changes.
  useEffect(() => setOrder(active), [active]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const titleOf = (id: string | number) =>
    order.find((step) => step.id === id)?.title ?? "the step";
  const positionOf = (id: string | number) =>
    order.findIndex((step) => step.id === id) + 1;

  // dnd-kit's defaults read ids aloud; these say titles and positions.
  const announcements: Announcements = {
    onDragStart: ({ active: a }) =>
      `Picked up ${titleOf(a.id)}, step ${positionOf(a.id)} of ${order.length}.`,
    onDragOver: ({ active: a, over }) =>
      over
        ? `${titleOf(a.id)} is over position ${positionOf(over.id)}.`
        : `${titleOf(a.id)} is no longer over the list.`,
    onDragEnd: ({ active: a, over }) =>
      over
        ? `${titleOf(a.id)} dropped at position ${positionOf(over.id)}.`
        : `${titleOf(a.id)} dropped where it was.`,
    onDragCancel: ({ active: a }) => `Moving ${titleOf(a.id)} cancelled.`,
  };

  function onDragEnd(event: DragEndEvent) {
    const { active: moved, over } = event;
    if (!over || moved.id === over.id) return;

    const before = order;
    const next = arrayMove(
      order,
      order.findIndex((step) => step.id === moved.id),
      order.findIndex((step) => step.id === over.id),
    );
    setOrder(next);
    setMessage("Saving the order…");

    startTransition(async () => {
      const result = await reorderStepsAction(next.map((step) => step.id));
      if (result.ok) {
        setMessage("Order saved.");
        return;
      }
      setOrder(before);
      setMessage(
        result.stale
          ? result.message
          : "The order didn't save. It's back how it was.",
      );
      if (result.stale) router.refresh();
    });
  }

  function unarchive(id: string) {
    setMessage("");
    startTransition(async () => {
      const result = await setStepArchivedAction(id, false);
      setMessage(
        result.ok
          ? `${archived.find((s) => s.id === id)?.title ?? "Step"} is back, at the end.`
          : result.message,
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {order.length === 0 ? (
        <p className="text-sm text-(--color-dim)">
          No steps yet. Start with the first thing you do once a client&rsquo;s
          intake is in.
        </p>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions: INSTRUCTIONS,
          }}
        >
          <SortableContext
            items={order.map((step) => step.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="flex flex-col">
              {order.map((step, index) => (
                <SortableRow
                  key={step.id}
                  step={step}
                  number={index + 1}
                  reduceMotion={reduceMotion}
                  disabled={pending}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <p role="status" className="min-h-5 text-sm text-(--color-dim)">
        {message}
      </p>

      {archived.length > 0 ? (
        <details className="group">
          <summary className="min-h-[44px] cursor-pointer py-2 text-sm text-(--color-body)">
            Archived ({archived.length})
          </summary>
          <ul className="mt-2 flex flex-col">
            {archived.map((step) => (
              <li
                key={step.id}
                className="flex min-h-[44px] flex-wrap items-center gap-3 border-t border-(--color-line-soft) px-3 py-2"
              >
                <Link
                  href={adminRoutes.pipelineStep(step.id)}
                  className="text-sm text-(--color-body) underline-offset-4 hover:underline"
                >
                  {step.title}
                </Link>
                <button
                  type="button"
                  onClick={() => unarchive(step.id)}
                  disabled={pending}
                  className="ml-auto min-h-[44px] px-2 text-sm text-(--color-dim) underline disabled:opacity-60"
                >
                  Unarchive
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

/**
 * One step. Only the grip starts a drag, so the copy button and the title
 * link keep their ordinary behaviour. The settle transition is dropped under
 * reduced motion — the row still moves, it does not glide.
 */
function SortableRow({
  step,
  number,
  reduceMotion,
  disabled,
}: {
  step: StepListItem;
  number: number;
  reduceMotion: boolean;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: reduceMotion ? undefined : transition,
      }}
      className={`flex min-h-[56px] flex-wrap items-center gap-x-3 gap-y-1 border-t border-(--color-line-soft) py-2 pr-1 ${
        isDragging ? "relative z-10 bg-(--color-ground-a) shadow-sm" : ""
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Move ${step.title}`}
        className="flex min-h-[44px] w-8 cursor-grab touch-none items-center justify-center text-(--color-dim) hover:text-(--color-ink) focus-visible:text-(--color-ink) active:cursor-grabbing"
      >
        <GripVertical size={16} aria-hidden />
      </button>

      <span className="w-6 text-right font-(family-name:--font-mono) text-xs text-(--color-dim)">
        {number}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <Link
          href={adminRoutes.pipelineStep(step.id)}
          className="text-sm text-(--color-ink) underline-offset-4 hover:underline"
        >
          {step.title}
        </Link>
        <span className="text-xs text-(--color-dim)">
          {[
            step.prompt ? promptLabel(step.promptTarget) : null,
            step.hasEmail ? "Email" : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Empty"}
        </span>
      </span>

      {step.prompt ? (
        <CopyButton
          text={step.prompt}
          label={
            step.promptTarget
              ? `Copy for ${PROMPT_TARGET_LABELS[step.promptTarget]}`
              : "Copy prompt"
          }
          accessibleLabel={`Copy the prompt for ${step.title}`}
        />
      ) : null}
    </li>
  );
}

/** "Claude Code prompt", or plain "Prompt" if the target is somehow unset. */
function promptLabel(target: PromptTarget | null): string {
  return target ? `${PROMPT_TARGET_LABELS[target]} prompt` : "Prompt";
}
