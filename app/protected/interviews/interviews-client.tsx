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
  interview_stages: any[] | null; // Array of interview stage objects (see MVP spec)
  activity_log: { type: string; notes: string; date_created: string }[];
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
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(jobs.length > 0 ? jobs[0] : null);
  const [filter, setFilter] = React.useState('');
  // --- New state for stage form ---
  const [stageType, setStageType] = React.useState('Recruiter Screen');
  const [stageDate, setStageDate] = React.useState('');
  const [stageInterviewer, setStageInterviewer] = React.useState('');
  const [stageNotes, setStageNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [stageStatus, setStageStatus] = React.useState('Pending');
  const [stageEmail, setStageEmail] = React.useState('');
  const [stageTitle, setStageTitle] = React.useState('');
  const [stageFollowUp, setStageFollowUp] = React.useState('');
  const [activityType, setActivityType] = React.useState('');
  const [activityNotes, setActivityNotes] = React.useState('');
  const [activitySaving, setActivitySaving] = React.useState(false);
  const [activityError, setActivityError] = React.useState<string | null>(null);

  // ISO 8601 date validation (YYYY-MM-DD or YYYY-MM-DDTHH:MM)
  function isValidISODate(str: string) {
    return /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?$/.test(str);
  }

  // Helper to extract and deduplicate contacts from interview_stages
  function extractContacts(stages: any[] | null) {
    if (!Array.isArray(stages)) return [];
    const seen = new Set();
    const contacts: { name: string; title: string; email: string }[] = [];
    for (const s of stages) {
      const name = s.interviewer || '';
      const title = s.title || '';
      const email = s.email || '';
      if (!name && !title && !email) continue;
      const key = email ? email : `${name}|${title}`;
      if (!seen.has(key)) {
        seen.add(key);
        contacts.push({ name, title, email });
      }
    }
    return contacts;
  }

  async function handleSaveStage() {
    if (!selectedJob) return;
    setSaving(true);
    setError(null);
    if (!isValidISODate(stageDate)) {
      setError('Date must be in YYYY-MM-DD or YYYY-MM-DDTHH:MM format');
      setSaving(false);
      return;
    }
    // Build new stage object
    const newStage = {
      stage_type: stageType,
      interviewer: stageInterviewer,
      title: stageTitle,
      email: stageEmail,
      date: stageDate,
      notes: stageNotes,
      status: stageStatus,
      follow_up: stageFollowUp,
      gpt_output: null,
    };
    // Append to existing stages
    const updatedStages = Array.isArray(selectedJob.interview_stages)
      ? [...selectedJob.interview_stages, newStage]
      : [newStage];
    // Extract contacts for DB update
    const updatedContacts = extractContacts(updatedStages);
    // Update in Supabase
    // TODO: Add RLS for user-level security once enabled
    // Placeholder: No RLS implemented yet
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ interview_stages: updatedStages, contacts: updatedContacts })
      .eq('id', selectedJob.id);
    if (updateError) {
      setError('Failed to save stage: ' + updateError.message);
      setSaving(false);
      return;
    }
    // Update local state
    setStageType('Recruiter Screen');
    setStageDate('');
    setStageInterviewer('');
    setStageNotes('');
    setStageStatus('Pending');
    setStageEmail('');
    setStageTitle('');
    setStageFollowUp('');
    setSelectedJob({ ...selectedJob, interview_stages: updatedStages });
    setSaving(false);
  }

  async function handleSaveActivity() {
    if (!selectedJob) return;
    setActivitySaving(true);
    setActivityError(null);
    if (!activityType.trim() && !activityNotes.trim()) {
      setActivityError('Type or Notes required');
      setActivitySaving(false);
      return;
    }
    const newEntry = {
      type: activityType,
      notes: activityNotes,
      date_created: new Date().toISOString(),
    };
    const updatedLog = Array.isArray(selectedJob.activity_log)
      ? [newEntry, ...selectedJob.activity_log]
      : [newEntry];
    // Update in Supabase
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ activity_log: updatedLog })
      .eq('id', selectedJob.id);
    if (updateError) {
      setActivityError('Failed to save activity: ' + updateError.message);
      setActivitySaving(false);
      return;
    }
    setActivityType('');
    setActivityNotes('');
    setSelectedJob({ ...selectedJob, activity_log: updatedLog });
    setActivitySaving(false);
  }

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
            {/* Stage & Next Steps Card (replaced with stage form) */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Stages</CardTitle>
              </CardHeader>
              <CardContent>
                {/* List all stages */}
                {Array.isArray(selectedJob.interview_stages) && selectedJob.interview_stages.length > 0 ? (
                  <div className="mb-4 space-y-2">
                    {selectedJob.interview_stages.map((stage, idx) => (
                      <div key={idx} className="border rounded p-2 flex flex-col">
                        <div className="font-semibold">{stage.stage_type}</div>
                        <div className="text-xs text-muted-foreground">{stage.date}</div>
                        {stage.interviewer && <div className="text-xs">Interviewer: {stage.interviewer}</div>}
                        {stage.notes && <div className="text-xs">Notes: {stage.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 text-muted-foreground">No interview stages logged yet.</div>
                )}
                {/* Add new stage form */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Interview Type</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={stageType}
                    onChange={e => setStageType(e.target.value)}
                  >
                    <option>Recruiter Screen</option>
                    <option>Hiring Manager</option>
                    <option>Peers</option>
                    <option>Panel</option>
                    <option>Demo</option>
                    <option>Exec</option>
                    <option>HR</option>
                    <option>Offer</option>
                  </select>
                  <label className="block text-sm font-medium mt-2">Status</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={stageStatus}
                    onChange={e => setStageStatus(e.target.value)}
                  >
                    <option>Pending</option>
                    <option>Scheduled</option>
                    <option>Completed</option>
                  </select>
                  <label className="block text-sm font-medium mt-2">Date (YYYY-MM-DD or YYYY-MM-DDTHH:MM)</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={stageDate}
                    onChange={e => setStageDate(e.target.value)}
                    placeholder="2025-04-25 or 2025-04-25T10:30"
                  />
                  <label className="block text-sm font-medium mt-2">Interviewer Name</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={stageInterviewer}
                    onChange={e => setStageInterviewer(e.target.value)}
                    placeholder="Jane Doe"
                  />
                  <label className="block text-sm font-medium mt-2">Interviewer Title</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={stageTitle}
                    onChange={e => setStageTitle(e.target.value)}
                    placeholder="Senior Tech Recruiter"
                  />
                  <label className="block text-sm font-medium mt-2">Interviewer Email</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={stageEmail}
                    onChange={e => setStageEmail(e.target.value)}
                    placeholder="jane@company.com"
                  />
                  <label className="block text-sm font-medium mt-2">Follow-up</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={stageFollowUp}
                    onChange={e => setStageFollowUp(e.target.value)}
                    placeholder="Send thank-you note"
                  />
                  <label className="block text-sm font-medium mt-2">Notes</label>
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    value={stageNotes}
                    onChange={e => setStageNotes(e.target.value)}
                    placeholder="Intro call, focused on cultural alignment"
                  />
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                  <Button
                    className="mt-3"
                    onClick={handleSaveStage}
                    disabled={saving || !stageDate || !isValidISODate(stageDate)}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Log Activity Card (updated) */}
            <Card>
              <CardHeader>
                <CardTitle>Log Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium">Type</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={activityType}
                    onChange={e => setActivityType(e.target.value)}
                    placeholder="General Note, Prep, Thank You, etc."
                  />
                  <label className="block text-sm font-medium mt-2">Notes</label>
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    value={activityNotes}
                    onChange={e => setActivityNotes(e.target.value)}
                    placeholder="Activity details, reminders, etc."
                  />
                  {activityError && <div className="text-red-500 text-sm mt-2">{activityError}</div>}
                  <Button
                    className="mt-3"
                    onClick={handleSaveActivity}
                    disabled={activitySaving || (!activityType.trim() && !activityNotes.trim())}
                  >
                    {activitySaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                {/* Show log entries */}
                <div>
                  <div className="font-semibold mb-2">Activity Log</div>
                  {(() => {
                    const logEntries = Array.isArray(selectedJob.activity_log) ? selectedJob.activity_log : [];
                    return logEntries.length > 0 ? (
                      <ul className="space-y-2">
                        {logEntries.map((entry, idx) => (
                          <li key={idx} className="border rounded p-2">
                            <div className="text-xs text-muted-foreground">{entry.date_created}</div>
                            <div className="font-semibold">{entry.type}</div>
                            <div>{entry.notes}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted-foreground">No activity logged yet.</div>
                    );
                  })()}
                </div>
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
            {/* Contacts Card (populated from interview stages) */}
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const contacts = extractContacts(selectedJob.interview_stages);
                  if (!contacts.length) return <div className="text-muted-foreground">No contacts found.</div>;
                  return (
                    <ul className="space-y-2">
                      {contacts.map((c, i) => (
                        <li key={i} className="border rounded p-2">
                          <div className="font-semibold">{c.name || '[No Name]'}</div>
                          {c.title && <div className="text-xs">{c.title}</div>}
                          {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
                <Button className="mt-3" disabled>Edit Contacts</Button>
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