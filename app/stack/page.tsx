import type { Metadata } from "next";
import RootField from "@/components/field/RootField";
import StackBody from "@/components/stack/StackBody";
import PageDismiss from "@/components/ui/PageDismiss";
import { SITE, STACK_META_DESCRIPTION } from "@/lib/config";
import { socialCard } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Full stack",
  description: STACK_META_DESCRIPTION,
  ...socialCard({
    title: `Full stack — ${SITE.name}`,
    description: STACK_META_DESCRIPTION,
  }),
};

export default function StackPage() {
  return (
    <main className="relative">
      <RootField />
      <PageDismiss />
      <StackBody />
    </main>
  );
}
