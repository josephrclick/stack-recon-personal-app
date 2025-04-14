import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function cleanFalsy(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== '')
  );
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.EXTENSION_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const jobsArray = await req.json();
  
  // Validate that the input is an array
  if (!Array.isArray(jobsArray)) {
    return NextResponse.json({ error: 'Input must be an array of job objects' }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Initialize results array to track processing outcomes
  const results = [];

  // Process each job in the array
  for (const jobData of jobsArray) {
    const {
      job_title,
      company_name,
      job_post_url,
      company_url,
      company_linkedin_slug,
      job_description,
      salary,
      source
    } = jobData;

    // Validate required fields
    const isValid = [job_description, job_post_url, source].every(
      (v) => typeof v === 'string' && v.trim().length > 0
    );

    if (!isValid) {
      results.push({
        status: 'error',
        error: 'Missing required fields',
        job_data: { job_post_url, company_name }
      });
      continue; // Skip to next job
    }

    try {
      // Check for duplicate company
      let isDuplicate = false;
      if (company_name && typeof company_name === 'string' && company_name.trim()) {
        const { count, error: countError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .ilike('company_name', company_name.trim());

        if (countError) {
          results.push({
            status: 'error',
            error: 'DB count check failed',
            details: countError.message,
            job_data: { job_post_url, company_name }
          });
          console.error(`🧱 Supabase count error for ${job_post_url}:`, countError);
          continue;
        }

        if (count && count > 0) {
          results.push({
            status: 'error',
            error: `Duplicate company name found: ${company_name}`,
            job_data: { job_post_url, company_name }
          });
          console.warn(`🚫 Duplicate company found: ${company_name} for ${job_post_url}`);
          isDuplicate = true;
          continue;
        }
      }

      if (!isDuplicate) {
        // Insert job data into database
        const formattedJobData = cleanFalsy({
          job_title,
          company_name,
          job_post_url,
          company_url,
          company_linkedin_slug,
          job_description,
          salary,
          source,
          status: 'pending_enrichment'
        });
        
        const { data, error } = await supabase.from('jobs').insert([formattedJobData]);
        
        if (error) {
          results.push({
            status: 'error',
            error: 'DB insert failed',
            details: error.message,
            job_data: { job_post_url, company_name }
          });
          console.error(`🧱 Supabase insert error for ${job_post_url}:`, error);
          continue;
        }
        
        results.push({
          status: 'success',
          job_data: { job_post_url, company_name },
          data
        });
      }
    } catch (err) {
      results.push({
        status: 'error',
        error: 'Unhandled processing error',
        job_data: { job_post_url, company_name }
      });
      console.log(`🔥 Processing crash for ${job_post_url}:`, err);
    }
  }

  // Return the results
  return NextResponse.json({ 
    success: true, 
    processed: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    results
  }, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
    }
  });
} 