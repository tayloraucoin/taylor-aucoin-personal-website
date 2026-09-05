"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

/**
 * Vendored from shadcn's Radix Select — trimmed to the one shape `/admin`
 * uses. Same vendoring rule as `sheet.tsx` (D-CRM-30 / D-ADM-3): the
 * exception is the Radix dependency, not a registry. Extend this file when a
 * second use case needs groups, separators, or scroll buttons.
 *
 * The trigger carries its own chevron as a child inside `px-3` padding.
 * Native `<select>` cannot move the OS arrow with padding; this primitive
 * exists so admin selects look like shadcn's without reaching for a kit.
 */

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      {...props}
      className={[
        "flex min-h-[44px] w-full items-center justify-between gap-2 rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-body) outline-none",
        "focus-visible:border-(--color-c2)",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>span]:line-clamp-1",
        className ?? "",
      ].join(" ")}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = "item-aligned", ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        {...props}
        className={[
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-y-auto rounded-(--radius) border border-(--color-line) bg-(--color-ground-a) py-1 shadow-lg",
          "data-[state=open]:[animation:sheet-fade-in_var(--dur-fast)_var(--ease-out)]",
          "data-[state=closed]:[animation:sheet-fade-out_var(--dur-fast)_var(--ease-out)]",
          className ?? "",
        ].join(" ")}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      {...props}
      className={[
        "relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm text-(--color-body) outline-none select-none",
        "focus:bg-(--color-tint) focus:text-(--color-ink)",
        "data-[highlighted]:bg-(--color-tint) data-[highlighted]:text-(--color-ink)",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className ?? "",
      ].join(" ")}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
