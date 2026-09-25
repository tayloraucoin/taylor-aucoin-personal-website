import Link from "next/link";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  listPipelineSteps,
  type PipelineStep,
} from "@/server/services/pipeline";
import { StepList, type StepListItem } from "./_components/step-list";

export const dynamic = "force-dynamic";

function toItem(step: PipelineStep): StepListItem {
  return {
    id: step.id,
    title: step.title,
    prompt: step.prompt,
    hasEmail: step.emailSubject !== null,
  };
}

export default async function PipelinePage() {
  await requireAdmin();

  const { active, archived } = await listPipelineSteps();

  return (
    <div className="flex max-w-3xl flex-col">
      <AdminPageHeader
        title="Pipeline"
        description="The steps every engagement runs through, in order. Copy a prompt into a Claude session; email steps send from an engagement's page."
        actions={
          <Link
            href={adminRoutes.pipelineNew}
            className="flex min-h-[44px] items-center rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white"
          >
            New step
          </Link>
        }
      />

      <StepList active={active.map(toItem)} archived={archived.map(toItem)} />
    </div>
  );
}
