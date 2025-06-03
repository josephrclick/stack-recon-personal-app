"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
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

const KANBAN_STATUSES = {
  'Applied': 'applied',
  'Recruiter Screen': 'recruiter_call',
  'Hiring Manager': 'hiring_manager',
  'Awaiting Offer': 'offer'
} as const;

const COLUMN_ORDER = ['Applied', 'Recruiter Screen', 'Hiring Manager', 'Awaiting Offer'] as const;

interface KanbanBoardProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onStatusUpdate: (jobId: string, newStatus: string) => void;
  selectedJobId: string | null;
}

export default function KanbanBoard({ jobs, onJobClick, onStatusUpdate, selectedJobId }: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group jobs by status
  const groupedJobs = COLUMN_ORDER.reduce((acc, columnTitle) => {
    const statusKey = KANBAN_STATUSES[columnTitle];
    acc[columnTitle] = jobs.filter(job => job.application_status === statusKey);
    return acc;
  }, {} as Record<string, Job[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find(j => j.id === event.active.id);
    setActiveJob(job || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id as string;
    const newColumnTitle = over.id as keyof typeof KANBAN_STATUSES;
    
    if (newColumnTitle in KANBAN_STATUSES) {
      const newStatus = KANBAN_STATUSES[newColumnTitle];
      onStatusUpdate(jobId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {COLUMN_ORDER.map((columnTitle) => {
          const columnJobs = groupedJobs[columnTitle] || [];
          return (
            <SortableContext
              key={columnTitle}
              items={columnJobs.map(job => job.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                title={columnTitle}
                jobs={columnJobs}
                onJobClick={onJobClick}
                selectedJobId={selectedJobId}
              />
            </SortableContext>
          );
        })}
      </div>
      
      <DragOverlay>
        {activeJob ? (
          <JobCard 
            job={activeJob} 
            onClick={() => {}} 
            isSelected={false}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}