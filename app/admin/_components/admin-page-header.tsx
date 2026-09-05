import type { ReactNode } from "react";

/**
 * The title block every admin surface should open with.
 *
 * Ported in shape from Conscious Connections' `AdminPageHeader`, in this site's
 * type. It exists here so ADM-2 has something to build against; retrofitting it
 * onto the CRM's existing pages is deliberately not part of ADM-1, and those
 * pages are untouched.
 */
export function AdminPageHeader({
  title,
  description,
  actions,
}: Readonly<{
  title: string;
  description?: string;
  actions?: ReactNode;
}>) {
  return (
    <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-(family-name:--font-display) text-2xl text-(--color-ink)">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[60ch] text-sm text-(--color-dim)">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-end gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
