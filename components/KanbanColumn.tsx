"use client";

import { useDroppable } from '@dnd-kit/core';
import JobCard from './JobCard';

interface Job {
  id: string;
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
  
  // Application tracking fields
  application_status: string | null;
  date_applied: string | null;
  application_notes: string | null;
  next_steps: string | null;
  follow_up_date: string | null;
  
  // Contact information
  recruiter_name: string | null;
  recruiter_email: string | null;
  recruiter_interview_date: string | null;
  hiring_manager_name: string | null;
  hiring_manager_email: string | null;
  hiring_manager_interview_date: string | null;
  
  // Interview timeline
  technical_interview_date: string | null;
  panel_interview_date: string | null;
  take_home_assignment_due_date: string | null;
  offer_received_date: string | null;
  offer_details: any | null;
  offer_status: string | null;
  date_archived: string | null;
  
  // Additional tracking
  current_interview_stage: string | null;
  interview_stages: any | null;
  contacts: any | null;
  activity_log: any | null;
  next_step_due_date: string | null;
  next_step_defined: boolean | null;
  strategic_interview_angle: string | null;
  strategic_leverage: string | null;
}

const COLUMN_COLORS = {
  'Applied': 'bg-blue-500',
  'Recruiter Screen': 'bg-orange-500', 
  'Hiring Manager': 'bg-purple-500',
  'Awaiting Offer': 'bg-green-500'
} as const;

interface KanbanColumnProps {
  title: string;
  jobs: Job[];
  onJobClick: (job: Job) => void;
  selectedJobId: string | null;
}

export default function KanbanColumn({ title, jobs, onJobClick, selectedJobId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
  });

  const columnColor = COLUMN_COLORS[title as keyof typeof COLUMN_COLORS] || 'bg-gray-500';

  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px]">
      {/* Column Header */}
      <div className={`${columnColor} text-white p-3 rounded-t-lg flex justify-between items-center`}>
        <h3 className="font-semibold">{title}</h3>
        <span className="bg-white/20 px-2 py-1 rounded text-sm">
          {jobs.length}
        </span>
      </div>
      
      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 bg-zinc-800 border-2 border-zinc-700 rounded-b-lg p-3 space-y-3 
          min-h-[200px] transition-colors
          ${isOver ? 'border-blue-400 bg-zinc-700' : ''}
        `}
      >
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onClick={() => onJobClick(job)}
            isSelected={selectedJobId === job.id}
            isDragging={false}
          />
        ))}
        
        {jobs.length === 0 && (
          <div className="text-center text-zinc-500 py-8">
            <p className="text-sm">No applications</p>
          </div>
        )}
      </div>
    </div>
  );
}