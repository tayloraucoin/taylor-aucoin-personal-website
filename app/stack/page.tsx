import type { Metadata } from "next";
import RootField from "@/components/field/RootField";
import StackBody from "@/components/stack/StackBody";
import PageDismiss from "@/components/ui/PageDismiss";

export const metadata: Metadata = {
  title: "Full stack",
  description:
    "The complete stack: languages, frameworks, tooling, databases & search, infrastructure, commerce & integrations, and AI engineering.",
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
