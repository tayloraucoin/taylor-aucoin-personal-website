"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

/**
 * Vendored from Conscious Connections' shadcn Sheet (D-CRM-30) — trimmed to
 * the one shape this repo uses: a right-hand sliding panel with no baked-in
 * close button, since every consumer here supplies its own text link. This
 * is `/admin`'s sanctioned exception to the site's no-component-library law
 * (CLAUDE.md); the exception is the dependency, not a kit — extend this file
 * when a second use case needs one, don't reach for a registry.
 *
 * Entrance/exit use hand-written keyframes (`sheet-slide-in` etc., in
 * `app/globals.css`) rather than an animate plugin: Radix mounts
 * SheetContent already in its open data-state, so a CSS `transition` has no
 * "before" frame to animate from. A keyframe `animation` always starts at
 * its own 0%, so it plays on mount, and Radix's Presence machinery plays it
 * in reverse on unmount. Reduced motion needs no extra code — the sitewide
 * rule in globals.css already collapses every animation-duration, which is
 * spec §5's actual law.
 */

const Sheet = DialogPrimitive.Root;
const SheetPortal = DialogPrimitive.Portal;
const SheetClose = DialogPrimitive.Close;
const SheetTitle = DialogPrimitive.Title;

function SheetOverlay(
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
) {
  const { className, ...rest } = props;
  return (
    <DialogPrimitive.Overlay
      {...rest}
      className={[
        "fixed inset-0 z-40 bg-black/60",
        "data-[state=open]:[animation:sheet-fade-in_var(--dur-fast)_var(--ease-out)]",
        "data-[state=closed]:[animation:sheet-fade-out_var(--dur-fast)_var(--ease-out)]",
        className ?? "",
      ].join(" ")}
    />
  );
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function SheetContent({ className, children, ...props }, ref) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        {...props}
        className={[
          "fixed inset-y-0 right-0 z-[41] flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/15 bg-(--color-ground-a) p-6 shadow-lg outline-none",
          "data-[state=open]:[animation:sheet-slide-in_var(--dur-fast)_var(--ease-out)]",
          "data-[state=closed]:[animation:sheet-slide-out_var(--dur-fast)_var(--ease-out)]",
          className ?? "",
        ].join(" ")}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetTitle };
