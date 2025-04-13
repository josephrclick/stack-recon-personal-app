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
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
      { role: 'user', content: prompt }
    ]
  });
  } catch (e) {
    console.log('❌ Failed to call OpenAI:', e);
    return NextResponse.json({ error: 'Failed to call OpenAI API' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
  
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
    // --- BEGIN DUPLICATE CHECK ---
    if (company_name && typeof company_name === 'string' && company_name.trim()) {
      const { count, error: countError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true }) // Efficiently get only the count
        .ilike('company_name', company_name.trim()); // Case-insensitive match

      if (countError) {
        console.error('🧱 Supabase count error:', countError);
        // Decide if you want to proceed or fail here. Failing might be safer.
        return NextResponse.json({ error: 'DB count check failed', details: countError.message }, {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      if (count && count > 0) {
        console.warn(`🚫 Duplicate company found: ${company_name}`);
        return NextResponse.json({ error: `Duplicate company name found: ${company_name}` }, {
          status: 409, // 409 Conflict is appropriate for duplicates
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    } else {
        // Optional: Handle cases where company_name is missing or invalid if it's strictly required
        // console.warn('⚠️ Company name missing or invalid for duplicate check.');
        // Depending on your requirements, you might want to return a 400 error here
        // or allow the insert to proceed if company_name is optional.
    }
  } catch (err) {
    console.error('🧱 Duplicate check error:', err);
    return NextResponse.json({ error: 'Duplicate check failed' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
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
