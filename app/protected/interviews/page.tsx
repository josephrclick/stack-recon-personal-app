"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import React from 'react'

const DUMMY_JOBS = [
  {
    id: '1',
    company_name: 'Acme Corp',
    job_title: 'Frontend Engineer',
    current_interview_stage: 'Recruiter Screen',
    fit_score: 82,
    next: '2024-06-10 14:00',
  },
  {
    id: '2',
    company_name: 'Globex',
    job_title: 'Backend Developer',
    current_interview_stage: 'HM Interview',
    fit_score: 68,
    next: '2024-06-12 09:30',
  },
  {
    id: '3',
    company_name: 'Initech',
    job_title: 'Full Stack Dev',
    current_interview_stage: 'Offer',
    fit_score: 45,
    next: null,
  },
]

const STAGE_COLORS: Record<string, string> = {
  'Recruiter Screen': 'bg-blue-500',
  'HM Interview': 'bg-purple-500',
  'Peer Interview': 'bg-teal-500',
  'Offer': 'bg-green-500',
}

const FIT_SCORE_COLORS = (score: number) =>
  score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'

export default function InterviewsPage() {
  const [selectedJob, setSelectedJob] = React.useState(DUMMY_JOBS[0])
  const [filter, setFilter] = React.useState('')
  const filteredJobs = DUMMY_JOBS.filter(j =>
    j.company_name.toLowerCase().includes(filter.toLowerCase()) ||
    j.job_title.toLowerCase().includes(filter.toLowerCase())
  )

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
                className={`flex flex-col gap-1 rounded p-2 cursor-pointer hover:bg-muted ${selectedJob.id === job.id ? 'bg-muted' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{job.company_name} · {job.job_title}</span>
                  <span className={`ml-auto ${STAGE_COLORS[job.current_interview_stage]} text-white rounded-full px-2 py-0.5 text-xs`}>{job.current_interview_stage}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 text-white ${FIT_SCORE_COLORS(job.fit_score)}`}>Fit: {job.fit_score}</span>
                  {job.next && <span className="text-muted-foreground">Next: {job.next}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-background">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedJob.job_title} @ {selectedJob.company_name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className={`rounded-full px-2 py-0.5 text-white ${STAGE_COLORS[selectedJob.current_interview_stage]}`}>{selectedJob.current_interview_stage}</span>
              <span className={`rounded-full px-2 py-0.5 text-white ${FIT_SCORE_COLORS(selectedJob.fit_score)}`}>Fit: {selectedJob.fit_score}</span>
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
            <div className="text-muted-foreground">[AI summary, strengths, gaps, red flags, bullets]</div>
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
            ]} value={selectedJob.current_interview_stage} disabled />
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
      </main>
    </div>
  )
}
