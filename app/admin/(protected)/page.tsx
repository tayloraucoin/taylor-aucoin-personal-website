import { redirect } from "next/navigation";
import { adminRoutes } from "@/lib/routes";

/** The queue is the job. Everything else is looked up from it. */
export default function AdminHomePage() {
  redirect(adminRoutes.queue);
}
