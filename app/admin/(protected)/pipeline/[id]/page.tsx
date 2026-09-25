import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { getPipelineStep } from "@/server/services/pipeline";
import { StepForm } from "../_components/step-form";

export const dynamic = "force-dynamic";

export default async function PipelineStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const step = await getPipelineStep(id);
  if (!step) notFound();

  return (
    <div className="flex max-w-3xl flex-col">
      <Link
        href={adminRoutes.pipeline}
        className="mb-3 w-fit text-sm text-(--color-dim) underline"
      >
        Pipeline
      </Link>
      <AdminPageHeader
        title={step.title}
        description={
          step.used
            ? "Used on an engagement, so it can be archived but not deleted."
            : undefined
        }
      />
      <StepForm
        mode="edit"
        id={step.id}
        initial={{
          title: step.title,
          prompt: step.prompt ?? "",
          emailSubject: step.emailSubject ?? "",
          emailBody: step.emailBody ?? "",
        }}
        archived={step.archivedAt !== null}
        used={step.used}
      />
    </div>
  );
}
