"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/_components/ui/select";

/**
 * The seven questionnaires, as a select.
 *
 * It was a row of tabs while there were two copy packs to switch between. Since
 * PORT-11 there are seven views and their labels are phrases rather than words,
 * so the row ran wider than the header and pushed the track switch off the line.
 * Seven options with prose labels is what a select is for.
 *
 * **The choice still ends up in the URL**, which is the property the tabs were
 * chosen for: a view stays linkable and survives a reload, which is most of
 * what a review surface is. This is the only client leaf on the page; the
 * header and the whole question stack stay server-rendered.
 */
export function KindSelect({
  options,
  current,
}: Readonly<{
  options: readonly { value: string; label: string; href: string }[];
  current: string;
}>) {
  const router = useRouter();

  return (
    <div>
      <label
        htmlFor="preview-kind"
        className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
      >
        What the site is for
      </label>
      <div className="mt-1.5">
        <Select
          value={current}
          onValueChange={(value) => {
            const picked = options.find((option) => option.value === value);
            if (picked) router.push(picked.href);
          }}
        >
          <SelectTrigger id="preview-kind" className="sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
