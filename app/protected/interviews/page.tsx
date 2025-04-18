// app/protected/interviews/page.tsx

import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/server"; // Import server-side Supabase client
import { redirect } from 'next/navigation'; // Import redirect for auth check if needed

// Dynamically import the client component
const InterviewsClient = dynamic(() => import("./interviews-client"), {
  ssr: true,
  loading: () => <p>Loading interviews interface...</p>
});

export default async function InterviewsPage() {
  const supabase = await createClient(); // Initialize Supabase server client

  // --- Authentication Check (Optional, but recommended for protected pages) ---
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to sign-in if user is not authenticated
    return redirect("/sign-in");
  }
  // --- End Authentication Check ---

  try {
    const { data: jobs, error } = await supabase
      .from('jobs') // Replace 'jobs' with your actual table name if different
      .select('*')   // Select all columns
      // .neq('application_status', 'applied') // Example filter - uncomment and adjust as needed
      // .neq('application_status', 'archived') // Example filter - uncomment and adjust as needed
      .order('created_at', { ascending: false }); // Order by creation date, newest first

    if (error) {
      console.error("Error fetching jobs:", error);
      // Consider displaying a user-friendly error message here in the UI
      return <div>Error loading interviews. Please try again later.</div>;
    }

    return <InterviewsClient jobs={jobs || []} />; // Pass fetched jobs as prop, ensure it's an array
  } catch (error) {
    console.error("Unexpected error fetching jobs:", error);
    return <div>Unexpected error loading interviews. Please try again later.</div>;
  }
}