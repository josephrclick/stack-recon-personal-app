// app/protected/interviews/interviews-client.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import React from 'react'

// --- Job Interface (adjust to match your actual Job type if different) ---
interface Job {
  id: string;
  company_insights: string | null;
  created_at: string;
  job_post_url: string;
  company_name: string;
  job_title: string;
  salary: string | null;
  overview: string | null;
  company_url: string | null;
  company_linkedin_slug: string | null;
  required_experience: string | null;
  skills_sought: string[] | null;
  ideal_candidate: string | null;
  ai_resume_tips: any | null;
  ai_tailored_summary: string | null;
  ai_status_score: number | null;
  tech_stack: string[] | null;
  red_flags: string[] | null;
  strategy_notes: string | null;
  status: string | null;
  company_industry: string | null;
  enrichment_attempts: number;
  enrichment_error: string | null;
  job_description: string | null;
  source: string | null;
  error_message: string | null;
  enriched_at: string | null;
  application_status: string | null;
  date_applied: string | null;
  application_notes: string | null;
  next_steps: string | null;
  follow_up_date: string | null;
  recruiter_name: string | null;
  recruiter_email: string | null;
  recruiter_interview_date: string | null;
  hiring_manager_name: string | null;
  hiring_manager_email: string | null;
  hiring_manager_interview_date: string | null;
  technical_interview_date: string | null;
  panel_interview_date: string | null;
  take_home_assignment_due_date: string | null;
  offer_received_date: string | null;
  offer_details: any | null;
  offer_status: string | null;
  date_archived: string | null;
  current_interview_stage: string | null;
  fit_score: number | null;
}

const STAGE_COLORS: Record<string, string> = {
  'Recruiter Screen': 'bg-blue-500',
  'HM Interview': 'bg-purple-500',
  'Peer Interview': 'bg-teal-500',
  'Offer': 'bg-green-500',
};

const FIT_SCORE_COLORS = (score: number | null) => {
  if (score === null) return 'bg-gray-500'; // Handle null score case
  return score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
};

// --- Modify InterviewsClient to accept jobs prop ---
interface InterviewsClientProps {
  jobs: Job[]; // Expecting an array of Job objects
}

export default function InterviewsClient({ jobs }: InterviewsClientProps) {
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(jobs.length > 0 ? jobs[0] : null); // Initialize with first job or null
  const [filter, setFilter] = React.useState('');

  // --- Update filteredJobs to use the jobs prop ---
  const filteredJobs = jobs.filter(j =>
    j.company_name?.toLowerCase().includes(filter.toLowerCase()) || // Use optional chaining in case company_name is null/undefined
    j.job_title?.toLowerCase().includes(filter.toLowerCase())     // Use optional chaining in case job_title is null/undefined
  );

  // --- Handle case where no job is selected ---
  if (!selectedJob && filteredJobs.length > 0) {
    setSelectedJob(filteredJobs[0]); // Select the first job if none is selected and jobs are available
  } else if (!selectedJob && filteredJobs.length === 0) {
    return <div className="p-4">No jobs to display.</div>; // Or display a more informative message
  }

  return (
    <div className="flex h-[100dvh] w-full">
      {/* Sidebar */}
      <aside className="w-1/4 min-w-[260px] max-w-xs border-r bg-muted/50 flex flex-col">
        <div className="p-4">
          <Input
            placeholder="Filter jobs..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className={`flex flex-col gap-1 rounded p-2 cursor-pointer hover:bg-muted ${selectedJob?.id === job.id ? 'bg-muted' : ''}`} // Optional chaining for selectedJob
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{job.company_name} · {job.job_title}</span>
                  {job.current_interview_stage && ( // Conditionally render stage badge
                    <span className={`ml-auto ${STAGE_COLORS[job.current_interview_stage]} text-white rounded-full px-2 py-0.5 text-xs`}>{job.current_interview_stage}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 text-white ${FIT_SCORE_COLORS(job.fit_score)}`}>Fit: {job.fit_score || 'N/A'}</span> {/* Handle null score */}
                  {job.next_steps && <span className="text-muted-foreground">Next: {job.next_steps}</span>} {/* Use next_steps or similar field */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-background">
        {/* Header Card */}
        {selectedJob && ( // Conditionally render main content if selectedJob exists
          <>
            <Card>
              <CardHeader>
                <CardTitle>{selectedJob.job_title} @ {selectedJob.company_name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {selectedJob.current_interview_stage && (
                    <span className={`rounded-full px-2 py-0.5 text-white ${STAGE_COLORS[selectedJob.current_interview_stage]}`}>{selectedJob.current_interview_stage}</span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-white ${FIT_SCORE_COLORS(selectedJob.fit_score)}`}>Fit: {selectedJob.fit_score || 'N/A'}</span>
                  <a href="#" className="ml-4 underline text-sm">View Job Post</a>
                </div>
              </CardHeader>
            </Card>
            {/* AI Insights Card (stub) */}
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">{selectedJob.overview} - {selectedJob.ai_tailored_summary} - {selectedJob.red_flags}</div>
              </CardContent>
            </Card>
            {/* Stage & Next Steps Card (stub) */}
            <Card>
              <CardHeader>
                <CardTitle>Stage & Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <Select options={[
                  { label: 'Recruiter Screen', value: 'Recruiter Screen' },
                  { label: 'HM Interview', value: 'HM Interview' },
                  { label: 'Peer Interview', value: 'Peer Interview' },
                  { label: 'Offer', value: 'Offer' },
                ]} value={selectedJob.current_interview_stage || undefined} disabled /> {/* Use undefined for default Select value */}
                <Input placeholder="Next step defined" className="mt-3" readOnly />
                <DatePicker placeholder="Next interview date" className="mt-3" readOnly />
                <Button className="mt-3" disabled>Save</Button>
              </CardContent>
            </Card>
            {/* Schedule Interview Card (stub) */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Interview</CardTitle>
              </CardHeader>
              <CardContent>
                <Button disabled>Schedule Next Interview</Button>
              </CardContent>
            </Card>
            {/* Log Activity Card (stub) */}
            <Card>
              <CardHeader>
                <CardTitle>Log Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Select options={[
                  { label: 'General Note', value: 'General Note' },
                  { label: 'Prep Note', value: 'Prep Note' },
                  { label: 'Thank You Sent', value: 'Thank You Sent' },
                ]} value="General Note" disabled />
                <Textarea placeholder="Notes" className="mt-3" readOnly />
                <Button className="mt-3" disabled>Add Log Entry</Button>
              </CardContent>
            </Card>
            {/* Generate Prep PDF Card (stub) */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Prep PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <Button disabled>Generate PDF</Button>
              </CardContent>
            </Card>
            {/* Contacts Card (stub) */}
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">[Contacts list]</div>
                <Button className="mt-3" disabled>Edit Contacts</Button>
              </CardContent>
            </Card>
            {/* Chronological Activity Log Card (stub) */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">[Activity log entries]</div>
              </CardContent>
            </Card>
          </>
        )}
         {!selectedJob && filteredJobs.length === 0 && ( // Display message if no jobs after filtering
          <div className="p-4">No jobs match your filter criteria.</div>
        )}
      </main>
    </div>
  );
}