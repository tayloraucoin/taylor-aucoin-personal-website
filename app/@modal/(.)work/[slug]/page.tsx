import { notFound } from "next/navigation";
import CaseOverlay from "@/components/work/CaseOverlay";
import { bySlug } from "@/content/work";

export default async function InterceptedWork({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = bySlug(slug);
  if (!c) notFound();
  return <CaseOverlay c={c} />;
}
