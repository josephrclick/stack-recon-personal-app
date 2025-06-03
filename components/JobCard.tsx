"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Target, Brain, Clock } from 'lucide-react';

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

interface JobCardProps {
  job: Job;
  onClick: () => void;
  isSelected: boolean;
  isDragging: boolean;
}

export default function JobCard({ job, onClick, isSelected, isDragging }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getScoreColor = (score: number | null): string => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  const hasAIInsights = job.red_flags?.length || job.strategy_notes || job.ai_resume_tips;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        cursor-pointer transition-all hover:shadow-md
        ${isSelected ? 'ring-2 ring-blue-400 bg-zinc-700' : 'bg-zinc-900'}
        ${isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Company and Score */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{job.company_name}</h4>
            <p className="text-sm text-zinc-400 truncate">{job.job_title}</p>
          </div>
          
          {job.ai_status_score && (
            <Badge 
              className={`${getScoreColor(job.ai_status_score)} text-white text-xs ml-2 shrink-0`}
            >
              {job.ai_status_score}
            </Badge>
          )}
        </div>

        {/* AI Summary */}
        {job.ai_tailored_summary && (
          <p className="text-xs text-zinc-300 line-clamp-2">
            {job.ai_tailored_summary}
          </p>
        )}

        {/* Insights Icons */}
        {hasAIInsights && (
          <div className="flex gap-2">
            {job.red_flags?.length && (
              <div className="flex items-center text-red-400" title={`${job.red_flags.length} red flags`}>
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs ml-1">{job.red_flags.length}</span>
              </div>
            )}
            {job.strategy_notes && (
              <div className="flex items-center text-blue-400" title="Has strategy notes">
                <Target className="h-3 w-3" />
              </div>
            )}
            {job.ai_resume_tips && (
              <div className="flex items-center text-purple-400" title="Has resume tips">
                <Brain className="h-3 w-3" />
              </div>
            )}
          </div>
        )}

        {/* Footer with Salary and Date */}
        <div className="flex justify-between items-center text-xs text-zinc-500">
          <span>{job.salary || 'No salary'}</span>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDate(job.date_applied)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}