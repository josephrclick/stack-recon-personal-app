// /app/protected/jobs/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const JobsClient = dynamic(() => import("./jobs-client"), { ssr: true });

export default async function JobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <JobsClient />;
}