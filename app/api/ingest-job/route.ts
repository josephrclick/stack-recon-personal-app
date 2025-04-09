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

  const body = await req.json();

  console.log('📦 Received payload:', body);

  

  const {
    job_post_url,
    job_title,
    company_name,
	  salary,
    job_description,
    job_highlights,
    source,
    company_url,
    company_linkedin_slug
  } = body;

  console.log('📦 Received payload:', body);

  console.log({
    job_description,
    job_post_url,
    source,
    job_description_type: typeof job_description,
  });

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

  const prompt = `You are an expert career advisor and job analyst. Analyze the following job post and return structured JSON.

Job Title: ${job_title}
Company Name: ${company_name}
Salary: ${salary}
Company URL: ${company_url}
Job Highlights: ${job_highlights}
Job Description:
${job_description}

Candidate Resume:
${JSON.stringify(resume)}

Return JSON with:
- company_name
- job_title
- salary (if mentioned)
- overview (short 3-4 sentence summary of the role)
- job_post_url
- hiring_manager (if mentioned)
- required_experience
- skills_sought (array)
- company_insights (GPT’s own insights)
- ideal_candidate (who this job is best for)
- ai_resume_tips (strengths, gaps, suggested_bullets)
- ai_tailored_summary (1-paragraph cover letter-style blurb)
- ai_status_score (0-100 match score)
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  let structured;
  try {
    structured = JSON.parse(completion.choices[0].message.content || '{}');
  } catch (e) {
    
    return NextResponse.json({ error: 'Failed to parse AI response' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  }

  const { data, error } = await supabase.from('jobs').insert([{ ...structured }]);
  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: 'DB error' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  return NextResponse.json({ success: true, data }, {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
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
