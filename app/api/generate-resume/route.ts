import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return new NextResponse('Missing jobId', { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: job, error } = await supabase
    .from('jobs')
    .select('company_name')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return new NextResponse('Job not found', { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'public', 'resume', 'master.pdf');
  let fileBuffer: Buffer;

  try {
    fileBuffer = await fs.readFile(filePath);
  } catch (err) {
    console.error('❌ Error reading resume PDF:', err);
    return new NextResponse('Resume not found', { status: 500 });
  }

  const safeCompany = job.company_name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  const filename = `Resume of Joseph Click - ${safeCompany}.pdf`;

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
