"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";

export type BlockMenuItem = {
  key: string;
  label: string;
  /** Shown instead of `label`, greyed, when the item cannot run right now. */
  disabledReason?: string | null;
  onSelect: () => void;
};

/**
 * The ⋮ beside a list's heading — actions that apply to the whole list.
 *
 * The same shape as Conscious Connections' `EllipsesMenu` (a Radix dropdown
 * behind a `MoreVertical` trigger), restyled to this surface's tokens: the
 * step footer's card-and-hairline floating treatment, mono tracked items, dim
 * to gold on focus. No red anywhere — nothing in here is destructive, because
 * every action that removes something has the block's six-second undo.
 *
 * Radix rather than a hand-rolled popover for the reason `select.tsx` gives:
 * roving focus, Escape, typeahead, and outside-click dismissal are behaviour
 * the platform does not give a `<div>`, and `@radix-ui/react-dialog` and
 * `react-select` are already the house pattern for exactly that class.
 *
 * A disabled item stays in the menu and says why. A greyed line with no
 * explanation reads as broken; "No duplicates" reads as an answer.
 */
export function BlockMenu({
  label,
  items,
}: {
  /** Accessible name for the trigger — which list this is. */
  label: string;
  items: readonly BlockMenuItem[];
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label={label}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius) text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) data-[state=open]:text-(--color-c2)"
        onClick={(event) => event.stopPropagation()}
      >
        <MoreVertical className="size-4" aria-hidden />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-56 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-1 backdrop-blur-[6px]"
        >
          {items.map((item) => {
            const disabled = Boolean(item.disabledReason);

            return (
              <DropdownMenu.Item
                key={item.key}
                disabled={disabled}
                // Radix closes the menu after `onSelect` unless the event is
                // default-prevented — and it is not: choosing an action is the
                // end of the interaction, and the live region says what happened.
                onSelect={() => item.onSelect()}
                className="cursor-pointer select-none rounded-(--radius) px-3 py-2.5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) outline-none data-[highlighted]:text-(--color-c2) data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
              >
                {disabled ? item.disabledReason : item.label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
