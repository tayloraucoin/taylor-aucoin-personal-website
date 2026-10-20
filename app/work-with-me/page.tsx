import type { Metadata } from "next";
import { PageClose } from "@/components/site/PageClose";
import { availability, workWithMeWords } from "@/content/services";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";
import { Building } from "./_components/Building";
import { Faqs } from "./_components/Faqs";
import { Hero } from "./_components/Hero";
import { HowIWork } from "./_components/HowIWork";
import { HowToStart } from "./_components/HowToStart";
import { Roles } from "./_components/Roles";

const description =
  "Product engineer for hire, contract or fractional, remote from Vancouver. Embedded on a big team, or head of product or CTO on a small one.";

export const metadata: Metadata = {
  title: "Work with me",
  description,
  ...socialCard({
    title: `Work with me — ${SITE.name}`,
    description,
  }),
};

/** services.md's order: hero, roles, building, how I work, how to start, FAQ, close. */
export default function WorkWithMePage() {
  return (
    <>
      <main
        id="main"
        className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
      >
        <Hero />
        <Roles />
        <Building />
        <HowIWork />
        <HowToStart />
        <Faqs />
      </main>
      <PageClose
        form="note"
        line={workWithMeWords.close}
        availability={availability}
        surface="services"
        lineAs="h2"
        noteLabel={workWithMeWords.note}
      />
    </>
  );
}
