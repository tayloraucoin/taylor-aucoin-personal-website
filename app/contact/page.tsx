import type { Metadata } from "next";
import { NoteForm } from "@/components/contact/NoteForm";
import { contact } from "@/content/contact";
import { readPageState, type PageSearchParams } from "@/lib/page-state";
import { CONTACT_STATES, contactFixtures } from "./_fixtures";

export const metadata: Metadata = { title: contact.title };

/**
 * `/contact` (D-SITE-165): the Display H1 over the note, in one 640 column
 * (services-build). The note is emailed to Taylor and never stored
 * (D-SITE-224); the header keeps its call button here (D-SITE-202).
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const state = await readPageState(searchParams, CONTACT_STATES);
  const seed = state === "default" ? undefined : contactFixtures[state];

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1192px] px-[22px] pt-12 pb-20 md:px-14 md:pt-24 md:pb-24"
    >
      <div className="max-w-[640px]">
        <h1 className="font-display text-[48px] leading-none font-semibold tracking-(--tracking-display) text-(--color-ink)">
          {contact.h1}
        </h1>
        <NoteForm
          key={state}
          from="contact"
          sentVariant="with_call"
          intro={<p>{contact.intro}</p>}
          seed={seed}
        />
      </div>
    </main>
  );
}
