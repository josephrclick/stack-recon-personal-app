import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { coverLetterTemplate } from '@/lib/templates/coverLetter';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return new NextResponse('Missing jobId', { status: 400 });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    console.error('❌ Job fetch error:', error);
    return new NextResponse('Job not found', { status: 404 });
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const replacements: Record<string, string> = {
    '{{companyName}}': job.company_name || '',
    '{{jobTitle}}': job.job_title || '',
    '{{date}}': currentDate,
  };

  let html = coverLetterTemplate;
  for (const [key, val] of Object.entries(replacements)) {
    html = html.replaceAll(key, val);
  }

  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await page.waitForFunction(() =>
    document.fonts.check('20pt Courgette') &&
    document.fonts.check('bold 20pt Garamond')
  );

  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
    },
    preferCSSPageSize: true,
  });

  await browser.close();

  const safeCompany = job.company_name?.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  const filename = `Cover Letter of Joseph Click - ${safeCompany}.pdf`;

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
