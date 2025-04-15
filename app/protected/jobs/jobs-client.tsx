"use client";

import { createClient } from '@/utils/supabase/client'; // Use client component Supabase
import { useState, useEffect } from 'react';
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
import { Loader2, ArrowUpDown } from 'lucide-react'; // Example loading icon

// Define the structure of your job data, including an ID
interface Job {
  id: string; // Assuming a unique ID column exists in your Supabase table
  company_name: string;
  company_industry?: string; // Added as optional field
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
export default function JobsClient() {
  return (
    <QueryClientProvider client={queryClient}>
      <JobsPage />
    </QueryClientProvider>
  );
}

function JobsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Job; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [columnWidths, setColumnWidths] = useState([250, 450, 150, 150]); // Initial widths in pixels

  const handleResize = (index: number) => (newWidth: number) => {
    setColumnWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = Math.max(newWidth, 50); // Ensure minimum width
      return newWidths;
    });
  };
  
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

  const handleSort = (key: keyof Job) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedJobs = jobs ? [...jobs].sort((a, b) => {
    if (sortConfig.key === 'salary') {
      const aValue = a[sortConfig.key] ? parseFloat(a[sortConfig.key]!.replace(/[^0-9.-]+/g, '')) : 0;
      const bValue = b[sortConfig.key] ? parseFloat(b[sortConfig.key]!.replace(/[^0-9.-]+/g, '')) : 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle possible undefined values
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Convert to strings for comparison
    const aString = String(aValue);
    const bString = String(bValue);
    
    if (sortConfig.direction === 'asc') {
      return aString.localeCompare(bString);
    }
    return bString.localeCompare(aString);
  }) : [];

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
      if (selectedJob && selectedJob.id === deleteMutation.variables) {
        setSelectedJob(null);
      }
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

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
    <div className="flex h-screen bg-black text-white">
      {/* Left panel with table */}
      <div className="w-[40%] overflow-auto pr-2">
        <h1 className="text-2xl p-4">Job Dashboard</h1>
        
        <Table className="min-w-full table-fixed">
          <TableHeader className="bg-zinc-800 sticky top-0 z-10">
            <TableRow>
              <ResizableTableHead width={columnWidths[0]} onResize={handleResize(0)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('company_name')} className="p-0 text-zinc-400 hover:text-white">
                  Company
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[1]} onResize={handleResize(1)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('job_title')} className="p-0 text-zinc-400 hover:text-white">
                  Job Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[2]} onResize={handleResize(2)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('salary')} className="p-0 text-zinc-400 hover:text-white">
                  Salary
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </ResizableTableHead>
              <ResizableTableHead width={columnWidths[3]} onResize={handleResize(3)} className="text-zinc-400">
                <Button variant="ghost" onClick={() => handleSort('ai_status_score')} className="p-0 text-zinc-400 hover:text-white">
                  Score
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
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
                <TableCell className="font-medium truncate" style={{ width: `${columnWidths[0]}px` }}>{job.company_name}</TableCell>
                <TableCell className="truncate" style={{ width: `${columnWidths[1]}px` }}>{job.job_title}</TableCell>
                <TableCell className="truncate" style={{ width: `${columnWidths[2]}px` }}>{job.salary || 'N/A'}</TableCell>
                <TableCell style={{ width: `${columnWidths[3]}px` }}>
                  <Badge variant={job.ai_status_score > 75 ? "default" : (job.ai_status_score > 50 ? "secondary" : "outline")}>
                    {job.ai_status_score}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Right panel with details */}
      <div className="w-[60%] overflow-auto p-8">
        <div className="bg-zinc-800 rounded-3xl overflow-hidden w-full shadow-xl sticky top-8">
          {selectedJob ? (
            <>
              {/* Action buttons at the top */}
              <div className="p-4 flex justify-between bg-zinc-700">
                <div>
                  <Button 
                    variant="destructive"
                    onClick={() => selectedJob && deleteMutation.mutate(selectedJob.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => selectedJob && handleGenerateResume(selectedJob)}
                  >
                    Resume
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => selectedJob && handleGenerateCoverLetter(selectedJob)}
                  >
                    Cover Letter
                  </Button>
                  <Button 
                    variant="outline"
                    asChild
                  >
                    <a href={selectedJob.job_post_url} target="_blank" rel="noopener noreferrer">
                      View Job
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => selectedJob && applyMutation.mutate(selectedJob.id)}
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "Applying..." : "Applied"}
                  </Button>
                </div>
              </div>
              
              {/* Job details */}
              <div className="px-[5%] py-8">
                <h2 className="text-xl font-bold mb-1">{selectedJob.job_title}</h2>
                <p className="text-zinc-400">{selectedJob.company_name}{selectedJob.company_industry ? ` - (${selectedJob.company_industry})` : ''}</p>
                <p className="text-zinc-400 mb-6">{selectedJob.salary ? `${selectedJob.salary}` : 'N/A'}</p>
                
                <h3 className="font-semibold mt-4">AI Summary</h3>
                <p className="text-sm text-zinc-300 mb-4">{selectedJob.ai_tailored_summary}</p>
                
                <h3 className="font-semibold mt-4">Overview</h3>
                <p className="text-sm text-zinc-300 mb-4">{selectedJob.overview}</p>
                
                <h3 className="font-semibold mt-4">Required Experience</h3>
                <p className="text-sm text-zinc-300 mb-4">{selectedJob.required_experience}</p>
                
                <h3 className="font-semibold mt-4">Skills Sought</h3>
                {selectedJob.skills_sought && selectedJob.skills_sought.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-zinc-300 mb-4">
                    {selectedJob.skills_sought.map((skill, index) => (
                      <li key={index} className="mb-1">{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-300 mb-4">N/A</p>
                )}
                
                <h3 className="font-semibold mt-4">Ideal Candidate</h3>
                <p className="text-sm text-zinc-300 mb-4">{selectedJob.ideal_candidate}</p>
                
                <h3 className="font-semibold mt-4">Tech Stack</h3>
                <p className="text-sm text-zinc-300 mb-4">{selectedJob.tech_stack?.join(', ') || 'N/A'}</p>
                
                <h3 className="font-semibold mt-4">Red Flags</h3>
                {selectedJob.red_flags && selectedJob.red_flags.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-zinc-300 mb-4">
                    {selectedJob.red_flags.map((flag, index) => (
                      <li key={index} className="mb-1">{flag}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-300 mb-4">N/A</p>
                )}
                
                <h3 className="font-semibold mt-4">Strategy Notes</h3>
                <p className="text-sm text-zinc-300 mb-4">{selectedJob.strategy_notes}</p>  
                


                {selectedJob.ai_resume_tips && (
                  <>
                    <h3 className="font-semibold mt-4">AI Resume Tips</h3>
                    <div className="text-sm text-zinc-300 mb-4">
                      <p className="mb-2"><strong>Strengths:</strong> {selectedJob.ai_resume_tips.strengths?.join(', ') || 'N/A'}</p>
                      <p className="mb-2"><strong>Gaps:</strong> {selectedJob.ai_resume_tips.gaps?.join(', ') || 'N/A'}</p>
                      <p className="mb-1"><strong>Suggested Bullets:</strong></p>
                      <ul className="list-disc pl-5">
                        {selectedJob.ai_resume_tips.suggested_bullets?.map((bullet, i) => (
                          <li key={i} className="mb-1">{bullet}</li>
                        )) || <li>N/A</li>}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-64 p-8 text-zinc-500">
              <p>Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 