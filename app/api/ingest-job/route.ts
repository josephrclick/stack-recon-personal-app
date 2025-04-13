import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import resumeJson from '@/lib/resume.json';
import { promptBuilder } from '@/lib/promptBuilder';

function extractJSON(raw: string): any {
  const clean = raw
    .replace(/^```json\s*/i, '')  // remove ```json (case insensitive)
    .replace(/^```/, '')          // remove stray ``` if it exists
    .replace(/```$/, '')          // remove closing ``` at end
    .trim();

  return JSON.parse(clean);
}

function cleanFalsy(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== '')
  );
}

function ensureArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(v => v.trim());
  return [];
}


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.NEXT_OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.NEXT_EXTENSION_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const {
    job_title,
    company_name,
    job_post_url,
    company_url,
    company_linkedin_slug,
    job_description,
    salary,
    source
  } = await req.json();

  const isValid = [job_description, job_post_url, source].every(
    (v) => typeof v === 'string' && v.trim().length > 0
  );

  if (!isValid) {
    console.warn('🚨 Missing or invalid fields:', { job_description, job_post_url, source });
    return NextResponse.json({ error: 'Missing required fields' }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  }

  const prompt = promptBuilder(job_description, resumeJson);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  let structured;
  try {
    structured = extractJSON(completion.choices[0].message.content || '');
  } catch (e) {
    console.log('❌ Failed to parse JSON from OpenAI:', completion.choices[0].message.content);
    return NextResponse.json({ error: 'Failed to parse AI response' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  const arrayFields = ['skills_sought', 'tech_stack', 'red_flags'];

  for (const field of arrayFields) {
    if (structured[field]) {
      structured[field] = ensureArray(structured[field]);
    }
  }

  if (structured.ai_resume_tips) {
    structured.ai_resume_tips.strengths = ensureArray(structured.ai_resume_tips.strengths);
    structured.ai_resume_tips.gaps = ensureArray(structured.ai_resume_tips.gaps);
    structured.ai_resume_tips.suggested_bullets = ensureArray(structured.ai_resume_tips.suggested_bullets);
  }  

  try {
    const jobData = cleanFalsy({
      ...structured,
      job_title,
      company_name,
      job_post_url,
      company_url,
      company_linkedin_slug,
      salary,
      status: 'tracked'
    });
  
    const { data, error } = await supabase.from('jobs').insert([jobData]);
  
    if (error) {
      console.error('🧱 Supabase insert error:', error);
      return NextResponse.json({ error: 'DB insert failed', details: error.message }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  
    return NextResponse.json({ success: true, data }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    console.log('🔥 Insert crash:', err);
    return NextResponse.json({ error: 'Unhandled insert error' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }  
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
