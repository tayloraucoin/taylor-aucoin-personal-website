"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import type { ListAction } from "@/lib/intake/entry-merge";
import { BlockMenu } from "./block-menu";
import { DocTag } from "./document";
import { RankButton } from "./rank-button";

const UNDO_WINDOW_MS = 6000;

/**
 * A list of the same block repeated — services, add-ons, staff.
 *
 * Removal is a quiet text link with six seconds of undo rather than a confirm
 * dialog. On a form this forgiving, a modal asking "are you sure?" about a
 * half-typed service line is friction for a mistake that costs nothing; the
 * undo covers the fat-thumb case without stopping anyone.
 *
 * Indices are the site's gold mono row-index idiom, which is what makes a
 * stack of identical cards scannable.
 *
 * Three things are opt-in and default off, so the durable track's four
 * callers — which pass none of them — render exactly what they always have:
 * `reorderable` (Move up / Move down, PORT-33), `draggable` (a grip handle on
 * top of that, PORT-34), and `actions` (the ⋮ menu, PORT-34).
 */
export function RepeatableBlock<T>({
  items,
  onChange,
  emptyItem,
  addLabel,
  addFirstLabel,
  startEmpty = false,
  reorderable = false,
  draggable = false,
  keyOf,
  actions,
  menuLabel = "Actions for this list",
  renderItem,
}: {
  items: readonly T[];
  onChange: (next: T[]) => void;
  emptyItem: () => T;
  addLabel: string;
  /** Shown instead of `addLabel` while the list is empty. */
  addFirstLabel?: string;
  /**
   * Start with no card at all, rather than one waiting to be filled.
   *
   * The default below is the right one for a list the client is expected to
   * have something for. It is the wrong one where having nothing is the
   * ordinary answer: an open card is a question, and a question nobody asked
   * for reads as work owed. The client then has to cancel out of a card they
   * never wanted (Taylor, 2026-09-04, on the taste step's found sites).
   */
  startEmpty?: boolean;
  /**
   * Move up / Move down on every card (PORT-33). Defaults off so the durable
   * track's blocks — which share this component — are unaffected: every
   * coded-track caller opts in explicitly.
   */
  reorderable?: boolean;
  /**
   * A drag handle on every card, in addition to the buttons (PORT-34).
   * Requires `keyOf`: the sortable needs a stable id per card. The buttons
   * stay because they are discoverable and the handle's keyboard grammar
   * (Space, arrows, Space) is not — D-PORT-4's keyboard floor.
   */
  draggable?: boolean;
  /**
   * A stable key for a card, so a move carries its open/shut state and its
   * focus with it rather than resetting whatever now sits at that array
   * index. Every entry shape on this track already mints one (`entryKey`);
   * falls back to array position when omitted, same as before this existed.
   */
  keyOf?: (item: T) => string;
  /**
   * Whole-list actions behind a ⋮ at the top of the block (PORT-34). Each
   * returns the next array and is committed exactly as a Move is. See
   * `standardListActions`.
   */
  actions?: readonly ListAction<T>[];
  /** The ⋮ trigger's accessible name — which list this is. */
  menuLabel?: string;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
}) {
  /**
   * What the last removal took, in original positions, so undo can put a
   * single card or a whole set of duplicates back where they were.
   */
  const [removed, setRemoved] = useState<
    { item: T; index: number }[] | null
  >(null);
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const document = useIsDocument();
  const reduceMotion = useReducedMotion();
  // dnd-kit numbers its `aria-describedby` targets with a module counter,
  // which the server and the client count differently — a hydration warning
  // on every draggable block. A React-issued id is the same on both sides.
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // One block by default, because for most lists here an empty screen reads as
  // broken rather than as an invitation. `startEmpty` inverts that for the
  // lists where nothing is the ordinary answer, and then the add button is the
  // whole invitation.
  const blocks = items.length > 0 ? items : startEmpty ? [] : [emptyItem()];

  /**
   * One entry, and the fact that there can be any number of them.
   *
   * The index chrome, the remove link, and the add button are all machinery for
   * *managing* a list; none of them is a question, and printing the same entry
   * shape three times would say nothing the add label does not. The add label
   * itself is client copy and carries the shape's name ("Add another project"),
   * which is why it rides in the tag rather than being dropped.
   *
   * `update` is a no-op here: a document has no state to change.
   */
  if (document) {
    return (
      <div>
        <DocTag>Repeatable · &ldquo;{addLabel}&rdquo;</DocTag>
        <div className="mt-3 border-l border-(--color-faint) pl-5">
          {/* `items[0] ?? emptyItem()`: a `startEmpty` list has no block to
              show, and a document of the questions still has to print the
              shape it would ask for. */}
          {renderItem(items[0] ?? emptyItem(), 0, () => {})}
        </div>
      </div>
    );
  }

  function update(index: number, next: T) {
    const copy = [...blocks];
    copy[index] = next;
    onChange(copy);
  }

  /** Takes a set of cards out, remembering where each one was. */
  function removeMany(indices: readonly number[]) {
    const gone = new Set(indices);
    setRemoved(
      blocks
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => gone.has(index)),
    );
    onChange(blocks.filter((_, i) => !gone.has(i)));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRemoved(null), UNDO_WINDOW_MS);
  }

  function remove(index: number) {
    removeMany([index]);
  }

  function undo() {
    if (!removed) return;
    const copy = [...blocks];
    // Ascending, so each splice lands at the index it was recorded at.
    for (const { item, index } of [...removed].sort((a, b) => a.index - b.index)) {
      copy.splice(index, 0, item);
    }
    onChange(copy);
    setRemoved(null);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= blocks.length || from === to) return;

    onChange(arrayMove([...blocks], from, to));
    setAnnouncement(`Moved to position ${to + 1} of ${blocks.length}.`);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !keyOf) return;

    const from = blocks.findIndex((item) => keyOf(item) === active.id);
    const to = blocks.findIndex((item) => keyOf(item) === over.id);
    if (from < 0 || to < 0) return;

    move(from, to);
  }

  /**
   * Runs one whole-list action. A removal (fewer cards after than before)
   * goes through the same undo as a single Remove, restored as a group; a
   * pure reorder does not, because nothing was lost.
   */
  function run(action: ListAction<T>) {
    const next = action.apply(blocks);
    setAnnouncement(action.announce(blocks, next));

    if (next.length < blocks.length) {
      const survivors = new Set(next);
      removeMany(
        blocks
          .map((item, index) => (survivors.has(item) ? -1 : index))
          .filter((index) => index >= 0),
      );
      return;
    }

    onChange(next);
  }

  const cards = blocks.map((item, index) => {
    const card = (
      <>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
          <span className="flex items-center gap-2">
            {draggable && keyOf ? <DragHandle /> : null}
            <span className="font-mono text-[10px] tracking-[.18em] text-(--color-c2)">
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1">
            {reorderable ? (
              <>
                <RankButton
                  label={`Move item ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  Move up
                </RankButton>
                <RankButton
                  label={`Move item ${index + 1} down`}
                  disabled={index === blocks.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  Move down
                </RankButton>
              </>
            ) : null}

            {/* `startEmpty` makes "none" a valid state, so the only card must
                be removable too — otherwise adding one by mistake is a card
                the client is stuck with. */}
            {blocks.length > 1 || startEmpty ? (
              <button
                type="button"
                onClick={() => remove(index)}
                className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-c2)"
              >
                Remove
              </button>
            ) : null}
          </span>
        </div>

        {renderItem(item, index, (next) => update(index, next))}
      </>
    );

    const key = keyOf ? keyOf(item) : index;

    return draggable && keyOf ? (
      <SortableCard key={key} id={keyOf(item)} reduceMotion={Boolean(reduceMotion)}>
        {card}
      </SortableCard>
    ) : (
      <div key={key} className={CARD}>
        {card}
      </div>
    );
  });

  return (
    <div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {actions && actions.length > 0 ? (
        <div className="mb-2 flex justify-end">
          <BlockMenu
            label={menuLabel}
            items={actions.map((action) => ({
              key: action.key,
              label: action.label,
              disabledReason: action.disabledReason(blocks),
              onSelect: () => run(action),
            }))}
          />
        </div>
      ) : null}

      {/* dnd-kit mounts only where a caller asked for a handle; the durable
          track's blocks never carry the context, the sensors, or the
          library's DOM. */}
      {draggable && keyOf ? (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{ announcements: ANNOUNCEMENTS, screenReaderInstructions: INSTRUCTIONS }}
        >
          <SortableContext
            items={blocks.map(keyOf)}
            strategy={verticalListSortingStrategy}
          >
            {cards}
          </SortableContext>
        </DndContext>
      ) : (
        cards
      )}

      {removed ? (
        <p
          aria-live="polite"
          className="mb-4 font-body text-[13.5px] font-light text-(--color-c2)"
        >
          {/* [COPY — draft, pending Taylor] on the counted form. */}
          Removed{removed.length > 1 ? ` ${removed.length}` : ""}.{" "}
          <button
            type="button"
            onClick={undo}
            className="underline underline-offset-2 hover:text-(--color-c3)"
          >
            Undo
          </button>
        </p>
      ) : null}

      <GhostButton onClick={() => onChange([...blocks, emptyItem()])}>
        {blocks.length === 0 ? (addFirstLabel ?? addLabel) : addLabel}
      </GhostButton>
    </div>
  );
}

const CARD =
  "mb-4 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4";

/**
 * A card's 1-based position in the list as it stood when the drag began —
 * `items` is fixed for the drag's duration, so "position 3" means the third
 * card the client could see, not a projected index that shifts underneath.
 */
function positionOf(entry: {
  id: string | number;
  data: { current?: { sortable?: { items: (string | number)[] } } };
}) {
  const index = entry.data.current?.sortable?.items.indexOf(entry.id) ?? -1;
  return index >= 0 ? index + 1 : null;
}

/**
 * What a screen reader hears while dragging.
 *
 * dnd-kit's defaults read the sortable ids aloud — twelve random characters
 * per card — so these say positions instead. The block's own live region
 * still reports the result once the drop lands.
 */
const ANNOUNCEMENTS: NonNullable<
  NonNullable<ComponentProps<typeof DndContext>["accessibility"]>["announcements"]
> = {
  onDragStart: ({ active }) => `Picked up item ${positionOf(active) ?? ""}.`.replace("  ", " "),
  onDragOver: ({ over }) =>
    over ? `Over position ${positionOf(over) ?? ""}.` : "No longer over the list.",
  onDragEnd: ({ over }) =>
    over ? `Dropped at position ${positionOf(over) ?? ""}.` : "Dropped where it was.",
  onDragCancel: () => "Reordering cancelled.",
};

const INSTRUCTIONS = {
  draggable:
    "To pick up a card, press Space. Use the arrow keys to move it, Space again to drop it, Escape to cancel.",
};

/**
 * One card, made sortable. The grip inside it is what the sensors listen
 * to: dragging from anywhere else on the card scrolls the page, which is
 * what a card full of inputs has to do on a phone.
 *
 * The lift is the library's transform; the settle is a transition that
 * `prefers-reduced-motion` removes outright — the card still moves, it does
 * not glide.
 */
function SortableCard({
  id,
  reduceMotion,
  children,
}: {
  id: string;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: reduceMotion ? undefined : transition,
        zIndex: isDragging ? 1 : undefined,
        position: "relative",
      }}
      className={`${CARD} ${isDragging ? "opacity-60" : ""}`}
    >
      <GripContext.Provider value={{ attributes, listeners, setActivatorNodeRef }}>
        {children}
      </GripContext.Provider>
    </div>
  );
}

type Grip = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"];
};

/** How the card header's handle reaches the sortable it sits inside. */
const GripContext = createContext<Grip | null>(null);

/**
 * The handle. A real button — 44px, `touch-none` so a drag from it does not
 * scroll — carrying the sortable's attributes and listeners, so pointer,
 * touch, and keyboard (Space, arrows, Space) all work from the one control.
 */
function DragHandle() {
  const grip = useContext(GripContext);
  if (!grip) return null;

  return (
    <button
      type="button"
      ref={grip.setActivatorNodeRef}
      aria-label="Drag to reorder"
      className="-ml-2 flex size-11 shrink-0 touch-none cursor-grab items-center justify-center rounded-(--radius) text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) active:cursor-grabbing"
      {...grip.attributes}
      {...grip.listeners}
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  );
}
