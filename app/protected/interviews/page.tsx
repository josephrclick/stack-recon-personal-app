// app/protected/interviews/page.tsx

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const ApplicationsClient = dynamic(() => import("./applications-client"), {
  loading: () => <p>Loading applications dashboard...</p>
});

export default async function InterviewsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  return <ApplicationsClient />;
}