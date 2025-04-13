// /app/jobs/app-jobs-page.tsx
"use client";

import { createClient } from '@/utils/supabase/client'; // Use client component Supabase
import { useEffect, useState } from 'react';
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
  seniority_level: string | null;
  job_function: string | null;
  work_arrangement: string | null;
  tech_stack: string[] | null;
  culture_signals: string[] | null;
  red_flags: string[] | null;
  should_apply: boolean;
  strategy_notes: string | null;
  applied_status: boolean; 
  created_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      // Fetch jobs, order by creation date descending if available
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false }); // Adjust column name if different

      if (fetchError) {
        console.error('Error fetching jobs:', fetchError);
        setError(`Failed to fetch jobs: ${fetchError.message}`);
        setJobs([]);
      } else {
        setJobs(data || []);
      }
      setIsLoading(false);
    };

    fetchJobs();
  }, [supabase]); // Re-run if supabase client instance changes (though unlikely)

  // --- Placeholder Action Handlers ---
  // Replace these with actual logic calling Supabase or APIs

  const handleViewDetails = (job: Job) => {
    setSelectedJobForDetails(job);
    // The Dialog component below will handle opening
  };

  const handleApplyToggle = async (jobId: string, currentStatus: boolean) => {
    console.log(`Toggling applied status for job ${jobId} from ${currentStatus}`);
    // Example: Update status in Supabase and refresh UI
    // const { error } = await supabase.from('jobs').update({ applied_status: !currentStatus }).eq('id', jobId);
    // if (error) console.error("Failed to update status", error);
    // else setJobs(jobs.map(j => j.id === jobId ? { ...j, applied_status: !currentStatus } : j));
    alert("Apply toggle functionality not implemented yet.");
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      console.log(`Deleting job ${jobId}`);
      // Example: Delete from Supabase and refresh UI
      // const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      // if (error) console.error("Failed to delete job", error);
      // else setJobs(jobs.filter(j => j.id !== jobId));
      alert("Delete functionality not implemented yet.");
    }
  };

  const handleGenerateCoverLetter = (job: Job) => {
    console.log("Generating cover letter for:", job.job_title);
    alert("Cover letter generation not implemented yet.");
    // Logic to trigger cover letter generation (e.g., API call)
  };

  const handleGenerateResume = (job: Job) => {
    console.log("Generating resume for:", job.job_title);
    alert("Resume generation not implemented yet.");
    // Logic to trigger resume generation
  };

  // --- Render Logic ---

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
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Job Dashboard</h1>

      <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedJobForDetails(null)}>
        <Table>
          <TableCaption>{jobs.length === 0 ? "No jobs found." : "A list of your tracked jobs."}</TableCaption>
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
            {jobs.map((job) => (
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
                    variant={job.applied_status ? "secondary" : "default"} // Example visual cue for applied
                    size="sm"
                    onClick={() => handleApplyToggle(job.id, job.applied_status ?? false)}
                    title={job.applied_status ? "Mark as Not Applied" : "Mark as Applied"}
                  >
                    {job.applied_status ? "Applied" : "Apply"}
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
                  >
                    Delete
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