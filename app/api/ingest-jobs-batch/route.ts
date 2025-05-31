import { NextRequest } from 'next/server';
import { z } from 'zod';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logger } from '@/lib/logger';
import { errorResponse, successResponse, CORS_HEADERS } from '@/lib/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Schema for a single job entry.
 */
const JobSchema = z.object({
  job_title: z.string().optional(),
  company_name: z.string().optional(),
  job_post_url: z.string().min(1, 'job_post_url is required'),
  company_url: z.string().min(1).optional(),
  company_linkedin_slug: z.string().min(1).optional(),
  job_description: z.string().min(1, 'job_description is required'),
  salary: z.string().min(1).optional(),
  source: z.string().min(1, 'source is required'),
});

/**
 * Handler for batch ingest of jobs.
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.EXTENSION_API_KEY) {
    return errorResponse({ error: 'Unauthorized' }, 401);
  }

  const body = await req.json().catch((err) => {
    logger.error({ err }, 'Invalid JSON payload');
    return null;
  });
  if (!body || !Array.isArray(body)) {
    return errorResponse({ error: 'Request body must be an array of jobs' }, 400);
  }

  // Validate payload against schema
  const parsed = z.array(JobSchema).safeParse(body);
  if (!parsed.success) {
    const validationErrors = parsed.error.errors.map((e) => ({
      path: e.path,
      message: e.message,
    }));
    logger.warn({ validationErrors }, 'Validation failed for job payload');
    return errorResponse({ error: 'Validation error', details: validationErrors }, 400);
  }
  const jobs = parsed.data;

  const processed = jobs.length;

  // Check existing jobs by URL
  const jobUrls = jobs.map((j) => j.job_post_url.trim());
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('jobs')
    .select('job_post_url')
    .in('job_post_url', jobUrls);
  if (fetchError) {
    logger.error({ err: fetchError }, 'Failed to fetch existing jobs');
    return errorResponse(
      { error: 'DB fetch error', details: fetchError.message },
      500
    );
  }
  const existingUrls = new Set(existing?.map((row) => row.job_post_url) ?? []);

  const results: Array<{
    job_post_url: string;
    company_name?: string;
    status: 'success' | 'error';
    error?: string;
  }> = [];

  // Partition into duplicates and new
  const newJobs = jobs.filter((j) => {
    const url = j.job_post_url.trim();
    if (existingUrls.has(url)) {
      results.push({
        job_post_url: url,
        company_name: j.company_name,
        status: 'error',
        error: 'Duplicate job_post_url',
      });
      logger.info({ job_post_url: url }, 'Duplicate job_post_url, skipping');
      return false;
    }
    return true;
  });

  // Prepare rows for insertion
  const rows = newJobs.map((j) => ({
    ...j,
    job_post_url: j.job_post_url.trim(),
    company_name: j.company_name?.trim(),
    company_url: j.company_url?.trim(),
    company_linkedin_slug: j.company_linkedin_slug?.trim(),
    job_description: j.job_description.trim(),
    salary: j.salary?.trim(),
    source: j.source.trim(),
    status: 'pending_enrichment',
  }));

  // Bulk insert
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('jobs')
    .insert(rows)
    .select();
  if (insertError) {
    logger.error({ err: insertError }, 'Bulk insert failed');
    return errorResponse(
      { error: 'DB insert error', details: insertError.message },
      500
    );
  }

  // Record successful inserts
  (inserted ?? []).forEach((row) => {
    results.push({
      job_post_url: row.job_post_url,
      company_name: row.company_name,
      status: 'success',
    });
  });

  const successful = inserted?.length ?? 0;
  const failed = processed - successful;
  const statusCode = failed > 0 && successful > 0 ? 207 : failed === 0 ? 200 : 500;

  return successResponse(
    { processed, successful, failed, results },
    statusCode
  );
}

/**
 * CORS preflight handler.
 */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}