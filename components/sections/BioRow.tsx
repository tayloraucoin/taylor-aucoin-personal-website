import Image from "next/image";
import Link from "next/link";
import { bio } from "@/content/services";
import { PHOTO, SITE } from "@/lib/config";

/**
 * Photo + two-line bio row (HOME-04 / SVC-09). Shared by the home page
 * (below Signal — rendered only once PHOTO exists) and the services proof
 * strip (always — the bio carries it until the photo lands).
 */
export default function BioRow() {
  return (
    <div className="mt-10 flex items-center gap-5">
      {/* Deliberately small — Taylor's call: the photo reads best at modest
          size. Do not scale it up. */}
      {PHOTO && (
        <Image
          src={PHOTO}
          alt={SITE.name}
          width={80}
          height={80}
          className="h-20 w-20 shrink-0 rounded-(--radius) object-cover"
        />
      )}
      <p className="max-w-[48ch] text-[13.5px] font-light leading-[1.64] text-(--color-body)">
        {bio}{" "}
        <Link
          href="/about"
          className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          More about me →
        </Link>
      </p>
    </div>
  );
}
