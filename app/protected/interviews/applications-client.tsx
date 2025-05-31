"use client";

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  ResizableTableHead
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowUpDown, Calendar, User, Mail, Phone, Building, Briefcase, Clock, Plus, Archive, Download } from 'lucide-react';

// Enhanced Job Interface with all application tracking fields
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

const APPLICATION_STAGES = [
  'applied',
  'screening', 
  'recruiter_call',
  'technical_interview',
  'hiring_manager',
  'panel_interview',
  'final_round',
  'offer',
  'negotiation',
  'accepted',
  'rejected',
  'withdrawn'
];

const STAGE_COLORS: { [key: string]: string } = {
  'applied': 'bg-blue-500',
  'screening': 'bg-yellow-500',
  'recruiter_call': 'bg-orange-500',
  'technical_interview': 'bg-purple-500',
  'hiring_manager': 'bg-indigo-500',
  'panel_interview': 'bg-pink-500',
  'final_round': 'bg-red-500',
  'offer': 'bg-green-500',
  'negotiation': 'bg-green-600',
  'accepted': 'bg-emerald-500',
  'rejected': 'bg-gray-500',
  'withdrawn': 'bg-gray-400'
};

// Create a client
const queryClient = new QueryClient();

// Wrapper component - exported as default
export default function ApplicationsClientWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationsClient />
    </QueryClientProvider>
  );
}

function ApplicationsClient() {
  const supabase = createClient();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Job; direction: 'asc' | 'desc' }>({ 
    key: 'date_applied', 
    direction: 'desc' 
  });
  const [columnWidths, setColumnWidths] = useState([180, 250, 120, 120, 120, 100, 80]);
  const [stageFilter, setStageFilter] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const handleResize = (index: number) => (newWidth: number) => {
    setColumnWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = Math.max(newWidth, 50);
      return newWidths;
    });
  };

  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ['applications', sortConfig, stageFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*')
        .not('date_applied', 'is', null)
        .is('date_archived', null);
      
      if (stageFilter && stageFilter !== 'all') {
        query = query.eq('application_status', stageFilter);
      }
      
      query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      
      const { data, error: fetchError } = await query;
      if (fetchError) {
        throw new Error(`Failed to fetch applications: ${fetchError.message}`);
      }
      return data || [];
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ jobId, newStage }: { jobId: string; newStage: string }) => {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          application_status: newStage,
          current_interview_stage: newStage
        })
        .eq('id', jobId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ jobId, note }: { jobId: string; note: string }) => {
      const currentNotes = selectedJob?.application_notes || '';
      const timestamp = new Date().toLocaleString();
      const updatedNotes = currentNotes 
        ? `${currentNotes}\n\n[${timestamp}] ${note}`
        : `[${timestamp}] ${note}`;
      
      const { error } = await supabase
        .from('jobs')
        .update({ application_notes: updatedNotes })
        .eq('id', jobId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setNewNote('');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .update({ date_archived: new Date().toISOString() })
        .eq('id', jobId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setSelectedJob(null);
    }
  });

  const handleSort = (key: keyof Job) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction: newDirection });
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return 'Error';
    }
  };

  const getLastActivity = (job: Job): string => {
    const dates = [
      { date: job.recruiter_interview_date, activity: 'Recruiter Call' },
      { date: job.hiring_manager_interview_date, activity: 'Manager Interview' },
      { date: job.technical_interview_date, activity: 'Technical Interview' },
      { date: job.panel_interview_date, activity: 'Panel Interview' },
      { date: job.offer_received_date, activity: 'Offer Received' }
    ].filter(item => item.date).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
    
    return dates.length > 0 ? dates[0].activity : 'Applied';
  };

  const renderStageBadge = (stage: string | null) => {
    if (!stage) return <Badge variant="outline">Unknown</Badge>;
    const color = STAGE_COLORS[stage] || 'bg-gray-500';
    return (
      <Badge className={`${color} text-white border-0`}>
        {stage.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-6">
         <Alert variant="destructive">
           <AlertTitle>Error Loading Applications</AlertTitle>
           <AlertDescription>{error.message}</AlertDescription>
         </Alert>
       </div>
    );
  }

  const sortedJobs = jobs || [];

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left panel - Applications List */}
      <div className="w-[45%] overflow-auto pr-2">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Applications Dashboard</h1>
          
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Select 
              value={stageFilter} 
              onChange={(e) => setStageFilter(e.target.value)}
              options={[
                { label: 'All Stages', value: '' },
                ...APPLICATION_STAGES.map(stage => ({
                  label: stage.replace('_', ' ').toUpperCase(),
                  value: stage
                }))
              ]}
              className="w-48 bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>

        <Table className="min-w-full table-fixed">
          <TableHeader className="bg-zinc-800 sticky top-0 z-10">
            <TableRow>
              <ResizableTableHead width={columnWidths[0]} onResize={handleResize(0)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('company_name')} className="p-0 text-zinc-400 hover:text-white">
                  Company <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[1]} onResize={handleResize(1)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('job_title')} className="p-0 text-zinc-400 hover:text-white">
                  Role <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[2]} onResize={handleResize(2)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('application_status')} className="p-0 text-zinc-400 hover:text-white">
                  Stage <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[3]} onResize={handleResize(3)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('date_applied')} className="p-0 text-zinc-400 hover:text-white">
                  Applied <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[4]} onResize={handleResize(4)} className="text-zinc-400">
                Last Activity
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[5]} onResize={handleResize(5)} className="text-zinc-400">
                Salary
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[6]} onResize={handleResize(6)} className="text-zinc-400">
                Action
              </ResizableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedJobs.map((job: Job) => (
              <TableRow 
                key={job.id} 
                className={`hover:bg-zinc-800 cursor-pointer ${selectedJob?.id === job.id ? 'bg-zinc-800' : 'bg-black'}`}
                onClick={() => setSelectedJob(job)}
              >
                <TableCell className="font-medium truncate" style={{ width: `${columnWidths[0]}px` }}>
                  {job.company_name}
                </TableCell>
                <TableCell className="truncate" style={{ width: `${columnWidths[1]}px` }}>
                  {job.job_title}
                </TableCell>
                <TableCell style={{ width: `${columnWidths[2]}px` }}>
                  {renderStageBadge(job.application_status)}
                </TableCell>
                <TableCell className="text-sm" style={{ width: `${columnWidths[3]}px` }}>
                  {formatDate(job.date_applied)}
                </TableCell>
                <TableCell className="text-sm text-zinc-400" style={{ width: `${columnWidths[4]}px` }}>
                  {getLastActivity(job)}
                </TableCell>
                <TableCell className="text-sm" style={{ width: `${columnWidths[5]}px` }}>
                  {job.salary || 'N/A'}
                </TableCell>
                <TableCell style={{ width: `${columnWidths[6]}px` }}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sortedJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                  No applications found. Apply to some jobs to track them here!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Right panel - Application Details */}
      <div className="w-[55%] overflow-auto p-4">
        {selectedJob ? (
          <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-xl">
            {/* Header with Actions */}
            <div className="bg-zinc-800 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedJob.job_title}</h2>
                <p className="text-zinc-400">{selectedJob.company_name}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Timeline
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => archiveMutation.mutate(selectedJob.id)}
                  disabled={archiveMutation.isPending}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Application Summary */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Application Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-zinc-400">Current Stage</Label>
                      <Select 
                        value={selectedJob.application_status || ''} 
                        onChange={(e) => updateStageMutation.mutate({ jobId: selectedJob.id, newStage: e.target.value })}
                        options={APPLICATION_STAGES.map(stage => ({
                          label: stage.replace('_', ' ').toUpperCase(),
                          value: stage
                        }))}
                        className="bg-zinc-700 border-zinc-600"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-zinc-400">Salary Range</Label>
                      <p className="text-sm">{selectedJob.salary || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-zinc-400">Applied On</Label>
                      <p className="text-sm">{formatDate(selectedJob.date_applied)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-zinc-400">Follow-up Date</Label>
                      <p className="text-sm">{formatDate(selectedJob.follow_up_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-zinc-400">Recruiter</Label>
                      <p className="text-sm">{selectedJob.recruiter_name || 'Not assigned'}</p>
                      {selectedJob.recruiter_email && (
                        <p className="text-xs text-zinc-500">{selectedJob.recruiter_email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-zinc-400">Hiring Manager</Label>
                      <p className="text-sm">{selectedJob.hiring_manager_name || 'Not assigned'}</p>
                      {selectedJob.hiring_manager_email && (
                        <p className="text-xs text-zinc-500">{selectedJob.hiring_manager_email}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Timeline */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Interview Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Recruiter Screen', date: selectedJob.recruiter_interview_date },
                    { label: 'Technical Interview', date: selectedJob.technical_interview_date },
                    { label: 'Hiring Manager', date: selectedJob.hiring_manager_interview_date },
                    { label: 'Panel Interview', date: selectedJob.panel_interview_date },
                    { label: 'Take-home Due', date: selectedJob.take_home_assignment_due_date },
                    { label: 'Offer Received', date: selectedJob.offer_received_date }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-zinc-700 last:border-b-0">
                      <span className="text-sm">{item.label}</span>
                      <span className="text-sm text-zinc-400">{formatDate(item.date)}</span>
                    </div>
                  ))}
                  
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm text-zinc-400">Next Steps</Label>
                    <p className="text-sm">{selectedJob.next_steps || 'No next steps defined'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle>Notes & Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-zinc-400">Application Notes</Label>
                    <div className="mt-2 p-3 bg-zinc-700 rounded text-sm max-h-40 overflow-y-auto">
                      {selectedJob.application_notes ? (
                        <pre className="whitespace-pre-wrap text-xs">{selectedJob.application_notes}</pre>
                      ) : (
                        <p className="text-zinc-500 italic">No notes yet</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-zinc-400">Add Note</Label>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add interview feedback, next steps, or other notes..."
                      className="bg-zinc-700 border-zinc-600"
                      rows={3}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => addNoteMutation.mutate({ jobId: selectedJob.id, note: newNote })}
                      disabled={!newNote.trim() || addNoteMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Strategic Information */}
              {(selectedJob.strategic_interview_angle || selectedJob.strategic_leverage) && (
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle>Strategic Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedJob.strategic_interview_angle && (
                      <div>
                        <Label className="text-sm text-zinc-400">Interview Angle</Label>
                        <p className="text-sm mt-1">{selectedJob.strategic_interview_angle}</p>
                      </div>
                    )}
                    {selectedJob.strategic_leverage && (
                      <div>
                        <Label className="text-sm text-zinc-400">Strategic Leverage</Label>
                        <p className="text-sm mt-1">{selectedJob.strategic_leverage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-zinc-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">Select an application to view details</p>
              <p className="text-sm">Click on any row in the table to see full application information</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}