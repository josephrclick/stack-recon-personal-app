// /lib/promptBuilder.ts

interface ResumeData {
    summary: string;
    skills: string[];
    experience: { title: string; summary: string }[];
    values: string[];
    preferred_industries: string[];
    undesired_industries: string[];
    work_environment_preferences: string[];
  }
  
  export function promptBuilder(jobPostText: string, resume: ResumeData): string {
    return `
  You are a helpful AI assistant analyzing job descriptions for a Sales Engineer named Joseph Click.
  
  The following fields have already been scraped and should NOT be returned: 
  job_title, company_name, job_post_url, company_url, company_linkedin_slug
  
  Instead, analyze the job post text and return the following fields ONLY:
  
  - salary
  - overview
  - required_experience
  - skills_sought
  - ideal_candidate
  - company_industry
  - tech_stack
  - ai_resume_tips (object with: strengths, gaps, suggested_bullets)
  - ai_tailored_summary (2–4 sentence pitch of candidate fit)
  - ai_status_score (0–100)
  - red_flags (list)
  - strategy_notes
  
  Return valid JSON only with no extra keys and return only the JSON object without any other text or commentary, such as \`\`\`json or \`\`\`  .
  
  --- Candidate Info ---
  Summary: ${resume.summary}
  Skills: ${resume.skills.join(', ')}
  Experience:
  ${resume.experience.map(e => `• ${e.title}: ${e.summary}`).join('\n')}
  Values: ${resume.values.join(', ')}
  Preferred Industries: ${resume.preferred_industries.join(', ')}
  Undesired Industries: ${resume.undesired_industries.join(', ')}
  Work Preferences: ${resume.work_environment_preferences.join(', ')}
  
  --- Job Posting ---
  ${jobPostText}
  `;
  }
  