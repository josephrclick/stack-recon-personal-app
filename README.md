# 💼 AI Job Hunt Dashboard (Next.js + Supabase + OpenAI)

This is a personal, AI-powered job-hunting platform designed to streamline everything from scraping to analysis to resume/cover letter tailoring. Built with **Next.js**, **Supabase**, and **OpenAI**, it’s engineered for one very efficient user (me), with a killer combo of automation, precision, and control.

---

## 🚀 What It Does

1. Scrapes job postings via a Chrome extension.
2. Enriches the job post with GPT-4o, using your personal resume for comparison.
3. Stores structured data in Supabase.
4. Displays all tracked jobs in a sleek dashboard.
5. Highlights strengths, gaps, red flags, and even suggests resume bullets.
6. (Soon) Generates tailored resumes and cover letters on-demand.

This project is fast, solo-optimized, and proudly anti-bloat. No multi-tenant logic, no team overhead, just results.

---

## 🧱 Stack Overview

| Layer          | Tech Stack                                                  |
|----------------|-------------------------------------------------------------|
| Frontend       | Next.js (App Router), React, TypeScript, Tailwind, shadcn/ui |
| Backend        | Next.js API Routes                                          |
| Hosting        | Vercel (with GitHub integration)                            |
| Database       | Supabase (PostgreSQL + Row Level Security)                  |
| Auth           | Supabase Magic Link (Single-user)                           |
| AI Integration | OpenAI API (GPT-4o)                                         |
| Ingestion      | Chrome Extension → `POST /api/ingest-job` (with API key)    |
| Resume Source  | Static JSON (`/lib/resume.json`) parsed into GPT prompt     |

---

## ✅ Current Feature Set

### 📡 Ingestion

- Chrome extension scrapes:
  - Job title, company name, job description, URL, LinkedIn slug
- Sends JSON payload to `/api/ingest-job` using a secure `x-api-key`
- Job description + resume are used to generate AI-enriched metadata

### 🧠 AI Enrichment

- GPT returns:
  - Summary, required experience, ideal candidate, tech stack
  - Resume alignment (strengths, gaps, bullets)
  - Fit score (0–100), red flags, strategy tips
- Prompt explicitly instructs GPT to *not* return fields already scraped (e.g. job_title)

### 🗃 Supabase Storage

- Inserts combined scraped + enriched data into a single `jobs` record
- Fields mapped to a precise schema with arrays safely normalized

### 📊 Dashboard

- `/jobs` route displays all tracked jobs
- Badges indicate AI score
- Click "Details" to view GPT analysis
- Action buttons to:
  - Apply
  - Delete
  - (Soon) Generate resume/cover letter

---

## 🔧 Priorities & Roadmap

### 🧨 High Priority
- [ ] Cover Letter + Resume generators
- [ ] State management
- [ ] Batch processing

### ⚙ Medium Priority
- [ ] Dynamic resume handling (swap between JSON configs)
- [ ] GPT prompt enhancements (interview talking points, urgency)
- [ ] Dashboard filtering/sorting

### 🧪 Low Priority
- [ ] CLI for scraping and batch ingestion
- [ ] Migration tooling (Supabase CLI or drizzle)
- [ ] Unit tests (OpenAI response parsing, Supabase insert)

---

## 🧠 Prompt Strategy

- Stored in `/lib/promptBuilder.ts`
- Injects resume summary, skills, experience, preferences
- Tells GPT:  
  - “Here’s what the job says”  
  - “Here’s who I am”  
  - “Now give me actionable data”
- Returns a clean JSON blob, ready for DB insert

---

## 📁 Project File Map

```
/app/api/ingest-job/route.ts      # Ingests scraped job, sends to GPT, saves to DB
/app/jobs/app-jobs-page.tsx       # Dashboard UI
/lib/promptBuilder.ts             # Builds OpenAI prompt from job + resume
/lib/resume.json                  # Full structured resume for analysis
/utils/supabase/                  # Supabase config & auth
.env.local                        # Secure keys (no NEXT_PUBLIC_)
/chrome-extension/                # Extension source (scrapes LinkedIn)
```

---

## ✨ Philosophy

This project is built for **high-efficiency job hunting** by a single user. It prioritizes:
- Insight over information
- Action over complexity
- Automation over repetition

It’s not a product (yet). It’s a job-hunt war machine.

---

## 🤝 Contributions

This is a personal project and not open to external contributors (yet).  
But if you're building something similar or want to jam on job automation tooling, I’d love to connect.

---

## 🥂 Thanks

To AI, caffeine, curiosity, and Saturday night code sessions.