"use client";

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react'; // Removed useEffect as it wasn't used here
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'; // Removed useQueryClient if not sorting server-side
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  ResizableTableHead
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowUpDown } from 'lucide-react';

// --- Job Interface (Includes all new application fields) ---
// (Keep the same comprehensive interface as defined in the previous step)
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
}


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

// Renamed the main component slightly to avoid naming conflict
function ApplicationsClient() {
  const supabase = createClient();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Job; direction: 'asc' | 'desc' }>({ key: 'date_applied', direction: 'desc' });
  const [columnWidths, setColumnWidths] = useState([200, 300, 150, 150, 150, 250, 150]);

  const handleResize = (index: number) => (newWidth: number) => {
    setColumnWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = Math.max(newWidth, 50);
      return newWidths;
    });
  };

  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ['applications', sortConfig], // Include sortConfig in key if sorting server-side
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('application_status', 'applied') // Adjust filter as needed
        .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' }); // Server-side sort

      if (fetchError) {
        throw new Error(`Failed to fetch applications: ${fetchError.message}`);
      }
      return data || [];
    },
  });

  const handleSort = (key: keyof Job) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction: newDirection });
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Formatting Error';
    }
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

  // Use the fetched (and server-sorted) data directly
  const sortedJobs = jobs || [];

  return (
    <div className="w-full h-screen overflow-auto p-4 bg-black text-white">
      <h1 className="text-2xl mb-4">My Applications</h1>

      <Table className="min-w-full table-fixed">
        <TableHeader className="bg-zinc-800 sticky top-0 z-10">
          <TableRow>
            {/* Table Headers */}
            <ResizableTableHead width={columnWidths[0]} onResize={handleResize(0)} className="text-zinc-400">
              <Button variant="ghost" onClick={() => handleSort('company_name')} className="p-0 text-zinc-400 hover:text-white">
                Company <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </ResizableTableHead>
            <ResizableTableHead width={columnWidths[1]} onResize={handleResize(1)} className="text-zinc-400">
              <Button variant="ghost" onClick={() => handleSort('job_title')} className="p-0 text-zinc-400 hover:text-white">
                Job Title <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </ResizableTableHead>
            <ResizableTableHead width={columnWidths[2]} onResize={handleResize(2)} className="text-zinc-400">
              <Button variant="ghost" onClick={() => handleSort('date_applied')} className="p-0 text-zinc-400 hover:text-white">
                Date Applied <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </ResizableTableHead>
            <ResizableTableHead width={columnWidths[3]} onResize={handleResize(3)} className="text-zinc-400">
              <Button variant="ghost" onClick={() => handleSort('application_status')} className="p-0 text-zinc-400 hover:text-white">
                Status <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </ResizableTableHead>
            <ResizableTableHead width={columnWidths[4]} onResize={handleResize(4)} className="text-zinc-400">
              <Button variant="ghost" onClick={() => handleSort('recruiter_interview_date')} className="p-0 text-zinc-400 hover:text-white">
                Recruiter Call <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </ResizableTableHead>
            <ResizableTableHead width={columnWidths[5]} onResize={handleResize(5)} className="text-zinc-400">
              <Button variant="ghost" onClick={() => handleSort('next_steps')} className="p-0 text-zinc-400 hover:text-white">
                Next Steps <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </ResizableTableHead>
            <ResizableTableHead width={columnWidths[6]} onResize={handleResize(6)} className="text-zinc-400">
              <Button variant="ghost" onClick={() => handleSort('hiring_manager_interview_date')} className="p-0 text-zinc-400 hover:text-white">
                HM Call <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </ResizableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Table Body */}
          {sortedJobs.length > 0 ? sortedJobs.map((job: Job) => (
            <TableRow key={job.id} className="hover:bg-zinc-800 bg-black">
              <TableCell className="font-medium truncate" style={{ width: `${columnWidths[0]}px` }}>{job.company_name}</TableCell>
              <TableCell className="truncate" style={{ width: `${columnWidths[1]}px` }}>{job.job_title}</TableCell>
              <TableCell className="truncate" style={{ width: `${columnWidths[2]}px` }}>{formatDate(job.date_applied)}</TableCell>
              <TableCell className="truncate" style={{ width: `${columnWidths[3]}px` }}>{job.application_status || 'N/A'}</TableCell>
              <TableCell className="truncate" style={{ width: `${columnWidths[4]}px` }}>{formatDate(job.recruiter_interview_date)}</TableCell>
              <TableCell className="truncate" style={{ width: `${columnWidths[5]}px` }}>{job.next_steps || 'N/A'}</TableCell>
              <TableCell className="truncate" style={{ width: `${columnWidths[6]}px` }}>{formatDate(job.hiring_manager_interview_date)}</TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                No applications found matching the criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}