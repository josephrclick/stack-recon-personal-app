// /app/protected/applications/page.tsx
import { createClient } from "@/utils/supabase/server"; // Use server client for auth check
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the client component
const ApplicationsClient = dynamic(() => import("./applications-client"), {
  ssr: true, // You can set ssr: false if you prefer initial render only on client
  loading: () => <p>Loading applications interface...</p> // Optional loading indicator
});

export default async function ApplicationsPage() {
  const supabase = await createClient();

  // Authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to sign-in if user is not authenticated
    return redirect("/sign-in");
  }

  // Render the client component
  return <ApplicationsClient />;
} 