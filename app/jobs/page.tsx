// /app/jobs/page.tsx
"use client";

import { createClient } from '@/utils/supabase/client'; // Use client component Supabase
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react'; // Example loading icon

// Define the structure of your job data, including an ID
interface Job {
  id: string; // Assuming a unique ID column exists in your Supabase table
  company_name: string;
  job_title: string;
  salary: string | null;
  overview: string;
  skills_sought: string[] | null;
  required_experience: string | null;
  company_insights: string | null;
  ideal_candidate: string | null;
  ai_resume_tips: {
    strengths: string[] | null;
    gaps: string[] | null;
    suggested_bullets: string[] | null;
  } | null;
  ai_status_score: number;
  job_post_url: string;
  hiring_manager: string | null;
  ai_tailored_summary: string | null;
  company_url: string | null;
  company_linkedin_slug: string | null;
  tech_stack: string[] | null;
  red_flags: string[] | null;
  strategy_notes: string | null;
  status: string; // ('tracked', 'applied', 'archived')
  created_at: string;
}

// Create a client
const queryClient = new QueryClient();

// Wrapper component that provides the query client
export default function JobsPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <JobsPage />
    </QueryClientProvider>
  );
}

function JobsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'tracked')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch jobs: ${fetchError.message}`);
      }

      return data || [];
    }
  });

  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'applied' })
        .eq('id', jobId);

      if (error) {
        throw new Error(`Failed to update job: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'archived' })
        .eq('id', jobId);

      if (error) {
        throw new Error(`Failed to archive job: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJobForDetails(job);
  };

  const handleApplyToggle = (jobId: string) => {
    applyMutation.mutate(jobId);
  };

  const handleDeleteJob = (jobId: string) => {
    deleteMutation.mutate(jobId);
  };

  const handleGenerateCoverLetter = async (job: Job) => {
    try {
      const res = await fetch(`/api/generate-cover-letter?jobId=${job.id}`);
  
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      const safeCompany = job.company_name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const filename = `Cover Letter of Joseph Click - ${safeCompany}.pdf`;
  
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
  
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating cover letter:", err);
      alert("Failed to generate cover letter PDF.");
    }
  };
 
  const handleGenerateResume = async (job: Job) => {
    try {
      const res = await fetch(`/api/generate-resume?jobId=${job.id}`);
  
      if (!res.ok) throw new Error(`Failed to fetch resume: ${res.status}`);
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      const safeCompany = job.company_name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const filename = `Resume of Joseph Click - ${safeCompany}.pdf`;
  
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
  
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Resume download failed:", err);
      alert("Resume download failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-6">
         <Alert variant="destructive">
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error.message}</AlertDescription>
         </Alert>
       </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Job Dashboard</h1>

      <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedJobForDetails(null)}>
        <Table>
          <TableCaption>{jobs?.length === 0 ? "No jobs found." : "A list of your tracked jobs."}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Post URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs?.map((job: Job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.company_name}</TableCell>
                <TableCell>{job.job_title}</TableCell>
                <TableCell>
                  <Badge variant={job.ai_status_score > 75 ? "default" : (job.ai_status_score > 50 ? "secondary" : "outline")}>
                    {job.ai_status_score}
                  </Badge>
                </TableCell>
                <TableCell>
                   <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(job)}>
                         View Details
                      </Button>
                   </DialogTrigger>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <a href={job.job_post_url} target="_blank" rel="noopener noreferrer">View Post</a>
                  </Button>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="default" 
                    size="sm"
                    onClick={() => handleApplyToggle(job.id)}
                    title="Mark as Applied"
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "Applying..." : "Apply"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateCoverLetter(job)}
                  >
                    Cover Letter
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateResume(job)}
                  >
                    Resume
                  </Button>
                   <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deleteMutation.isPending}
                   >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Details Dialog Content */}
        {selectedJobForDetails && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedJobForDetails.job_title}</DialogTitle>
              <DialogDescription>
                {selectedJobForDetails.company_name}
                {selectedJobForDetails.salary && ` | Salary: ${selectedJobForDetails.salary}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
               <h4 className="font-semibold">Overview</h4>
               <p className="text-sm text-muted-foreground">{selectedJobForDetails.overview}</p>

               <h4 className="font-semibold mt-2">Required Experience</h4>
               <p className="text-sm text-muted-foreground">{selectedJobForDetails.required_experience}</p>

               <h4 className="font-semibold mt-2">Skills Sought</h4>
               <p className="text-sm text-muted-foreground">{selectedJobForDetails.skills_sought?.join(', ') || 'N/A'}</p>

               <h4 className="font-semibold mt-2">Company Insights</h4>
               <p className="text-sm text-muted-foreground">{selectedJobForDetails.company_insights}</p>

               <h4 className="font-semibold mt-2">Ideal Candidate</h4>
               <p className="text-sm text-muted-foreground">{selectedJobForDetails.ideal_candidate}</p>

               {selectedJobForDetails.ai_resume_tips && (
                 <>
                    <h4 className="font-semibold mt-2">AI Resume Tips</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                       <p><strong>Strengths:</strong> {selectedJobForDetails.ai_resume_tips.strengths?.join(', ') || 'N/A'}</p>
                       <p><strong>Gaps:</strong> {selectedJobForDetails.ai_resume_tips.gaps?.join(', ') || 'N/A'}</p>
                       <p><strong>Suggested Bullets:</strong></p>
                       <ul className="list-disc pl-5">
                          {selectedJobForDetails.ai_resume_tips.suggested_bullets?.map((bullet, i) => (
                             <li key={i}>{bullet}</li>
                          )) || <li>N/A</li>}
                       </ul>
                    </div>
                 </>
               )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="secondary">
                   Close
                 </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}