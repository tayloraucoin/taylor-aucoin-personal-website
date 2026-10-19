"use client";

import { useId, type Ref } from "react";
import { Search, X } from "lucide-react";
import { capabilitiesPage as words } from "./words";

/**
 * The filter field (D-SITE-145, 148): named by its visible label, the
 * placeholder a hint only (A-16). The × shows while there is a query, drawn
 * at 32 inside a 44 target, and clears it.
 */
export function CapabilityFilter({
  ref,
  value,
  onChange,
  onClear,
}: {
  ref: Ref<HTMLInputElement>;
  value: string;
  onChange: (q: string) => void;
  onClear: () => void;
}) {
  const id = useId();
  return (
    <div className="md:w-[360px]">
      <label
        htmlFor={id}
        className="block text-(length:--text-meta) text-(--color-dim)"
      >
        {words.filterLabel}
      </label>
      <div className="relative mt-2">
        <Search
          aria-hidden
          size={16}
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-(--color-dim)"
        />
        <input
          ref={ref}
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={words.filterPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full appearance-none rounded-(--radius) border border-(--color-line-strong) bg-transparent pr-11 pl-10 font-body text-(length:--text-body) text-(--color-ink) placeholder:text-(--color-dim) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            aria-label={words.clear}
            onClick={onClear}
            className="group absolute top-0 right-0 inline-flex size-11 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-(--color-focus)"
          >
            <span className="inline-flex size-8 items-center justify-center text-(--color-dim) transition-colors duration-(--dur-fast) group-hover:text-(--color-ink)">
              <X aria-hidden size={14} strokeWidth={1.5} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
