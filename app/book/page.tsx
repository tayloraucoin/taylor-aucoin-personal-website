import type { Metadata } from "next";
import { book } from "@/content/book";
import { readPageState, type PageSearchParams } from "@/lib/page-state";
import { ScreeningForm } from "./_components/ScreeningForm";
import { BOOK_STATES, bookFixtures } from "./_fixtures";

export const metadata: Metadata = { title: book.title };

/**
 * `/book` (D-SITE-165): the screening before a call, in one 640 column
 * (services-build). Every view stays on this URL; the header drops its call
 * button here (D-SITE-167). Nothing is stored.
 */
export default async function BookPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const state = await readPageState(searchParams, BOOK_STATES);
  const seed = state === "default" ? undefined : bookFixtures[state];

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1192px] px-[22px] pt-12 pb-20 md:px-14 md:pt-24 md:pb-24"
    >
      <div className="max-w-[640px]">
        <ScreeningForm key={state} seed={seed} />
      </div>
    </main>
  );
}
