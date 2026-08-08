import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RootField from "@/components/field/RootField";
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
  return { title: c.title, description: c.constraint };
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
      <CaseBody c={c} />
    </main>
  );
}
