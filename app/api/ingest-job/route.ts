import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import resume from '@/lib/resume.json';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.NEXT_OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.NEXT_EXTENSION_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let html, url, source;
  try {
    const body = await req.json();
    html = body.html;
    url = body.url;
    source = body.source || 'unknown';

    if (!html || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error parsing JSON body:', err);
    return NextResponse.json({ error: 'Invalid JSON body', details: err }, { status: 400 });
  }

  const prompt = `You are an AI job analyst. Given the job post HTML and resume, extract key fields and provide resume tailoring insights. Return ONLY valid JSON. Do NOT include markdown or backticks.

Job Post HTML:
${html}

Resume:
${JSON.stringify(resume)}

Return JSON:
{
  company_name: string,
  job_title: string,
  overview: string,
  job_post_url: string,
  hiring_manager: string | null,
  required_experience: string,
  skills_sought: string[],
  company_insights: string,
  ideal_candidate: string,
  ai_resume_tips: {
    strengths: string[],
    gaps: string[],
    suggested_bullets: string[]
  },
  ai_tailored_summary: string,
  ai_status_score: number (0-100)
}`;

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a job intelligence assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    let raw = chat.choices[0].message.content || '{}';
    raw = raw.trim().replace(/^```json\\s*/i, '').replace(/```$/, '');
    const responseData = JSON.parse(raw);

    console.log('GPT Response:', responseData);

    const insert = await supabase.from('jobs').insert({
      ...responseData,
      job_post_url: url,
      source,
      raw_html: html,
      ai_version: 'gpt-4o-v1',
      status: 'new'
    }).select().single();

    if (insert.error) {
      console.error('Supabase insert error:', insert.error);
      return NextResponse.json({ error: 'Supabase insert failed', details: insert.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, job: insert.data });
  } catch (error) {
    console.error('Error in processing job:', error);
    return NextResponse.json({ error: 'Failed to process job', details: error }, { status: 500 });
  }
}
