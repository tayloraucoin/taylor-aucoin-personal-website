import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RootField from "@/components/field/RootField";
import PageDismiss from "@/components/ui/PageDismiss";
import CaseBody from "@/components/work/CaseBody";
import { bySlug, publishedWork } from "@/content/work";

export function generateStaticParams() {
  return publishedWork.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = bySlug(slug);
  if (!c) return {};
  const brief = typeof c.brief === "string" ? c.brief : c.brief?.intro;
  return {
    title: c.title,
    description: brief ?? c.constraint ?? c.tagline,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = bySlug(slug);
  if (!c) notFound();
  return (
    <main className="relative">
      <RootField />
      <PageDismiss />
      <CaseBody c={c} />
    </main>
  );
}
