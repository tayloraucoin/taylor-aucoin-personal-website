import Link from "next/link";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { StepForm } from "../_components/step-form";

export default async function NewPipelineStepPage() {
  await requireAdmin();

  return (
    <div className="flex max-w-3xl flex-col">
      <Link
        href={adminRoutes.pipeline}
        className="mb-3 w-fit text-sm text-(--color-dim) underline"
      >
        Pipeline
      </Link>
      <AdminPageHeader title="New step" description="It goes at the end of the list." />
      <StepForm mode="new" />
    </div>
  );
}
