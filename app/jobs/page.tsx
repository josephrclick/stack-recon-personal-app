"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Job {
  company_name: string;
  job_title: string;
  salary: string;
  overview: string;
  skills_sought: string[];
  required_experience: string;
  company_insights: string;
  ideal_candidate: string;
  ai_resume_tips: {
    strengths: string[];
    gaps: string[];
    suggested_bullets: string[];
  };
  ai_status_score: number;
  job_post_url: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from('jobs').select('*');
      if (error) console.error('Error fetching jobs:', error);
      else setJobs(data);
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Scraped Jobs</h1>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Company</th>
              <th className="p-2">Title</th>
              <th className="p-2">Salary</th>
              <th className="p-2">Overview</th>
              <th className="p-2">Skills</th>
              <th className="p-2">Experience</th>
              <th className="p-2">Insights</th>
              <th className="p-2">Ideal Candidate</th>
              <th className="p-2">Resume Tips</th>
              <th className="p-2">Score</th>
              <th className="p-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={index} className="border-t">
                <td className="p-2 whitespace-nowrap">{job.company_name}</td>
                <td className="p-2 whitespace-nowrap">{job.job_title}</td>
                <td className="p-2 whitespace-nowrap">{job.salary}</td>
                <td className="p-2 max-w-xs truncate" title={job.overview}>{job.overview}</td>
                <td className="p-2 whitespace-nowrap">{job.skills_sought?.join(', ')}</td>
                <td className="p-2 whitespace-nowrap">{job.required_experience}</td>
                <td className="p-2 max-w-xs truncate" title={job.company_insights}>{job.company_insights}</td>
                <td className="p-2 max-w-xs truncate" title={job.ideal_candidate}>{job.ideal_candidate}</td>
                <td className="p-2 max-w-xs">
                  <div><strong>Strengths:</strong> {job.ai_resume_tips?.strengths?.join(', ')}</div>
                  <div><strong>Gaps:</strong> {job.ai_resume_tips?.gaps?.join(', ')}</div>
                  <div><strong>Bullets:</strong> {job.ai_resume_tips?.suggested_bullets?.join(', ')}</div>
                </td>
                <td className="p-2 text-center font-bold">{job.ai_status_score}</td>
                <td className="p-2 text-blue-600 underline">
                  <a href={job.job_post_url} target="_blank" rel="noopener noreferrer">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
