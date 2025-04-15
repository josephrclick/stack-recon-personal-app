# 🧠 StackRecon

**Scan Stack. Find Gap. Insert Value.**

StackRecon is a personal, AI-powered job targeting system built for precision, speed, and control. It scrapes, analyzes, enriches, and tracks job opportunities with tactical clarity — engineered for a single operator running a high-efficiency campaign.

---

## 🚀 What It Does

1. Scrapes job descriptions via a custom Chrome Extension
2. Enriches each job post using OpenAI and your structured resume
3. Stores the data in Supabase with clean schema + score-based sorting
4. Displays jobs in a fast, sortable, filterable dashboard
5. Provides AI insight: strengths, gaps, red flags, bullet suggestions
6. Generates downloadable PDFs: dynamic cover letters and static resumes

Everything works. MVP is done. This system is now in daily use.

---

## 🧱 Stack Overview

| Layer        | Tech Stack                                                  |
|--------------|-------------------------------------------------------------|
| Frontend     | Next.js (App Router), TypeScript, Tailwind, shadcn/ui       |
| Hosting      | Vercel                                                      |
| Database     | Supabase (PostgreSQL + Row-Level Security)                  |
| Auth         | Supabase Magic Link (single-user mode)                      |
| AI Engine    | OpenAI GPT-4o API                                           |
| Resume Input | Static JSON resume (`/lib/resume.json`)                     |
| PDF Engine   | Puppeteer-Core + @sparticuz/chromium                        |
| Ingestion    | Chrome Extension → API → Supabase                           |

---

## ✅ Feature Highlights

### 📡 Job Ingestion

- Scrapes: title, company, job description, post URL, LinkedIn slug
- Sent to `/api/ingest-job` with secure `x-api-key`
- Parsed into prompt alongside resume context

### 🧠 GPT Enrichment

- Extracted fields:
  - Summary, requirements, ideal candidate, tech stack
  - Strengths, gaps, suggested resume bullets
  - Fit score (0–100), red flags, strategy notes

### 🗂 Supabase Storage

- All fields normalized and stored in `jobs` table
- Clean insert logic with type-safe fallbacks

### 📊 Dashboard UI

- `/jobs` page displays all tracked roles
- Color-coded AI score badges
- Modal: view full GPT breakdown
- Action buttons:
  - ✅ Apply → Updates status
  - 🗑 Delete → Archives
  - 📄 Cover Letter → Generates PDF via Puppeteer
  - 📎 Resume → Downloads branded PDF with company-specific filename

---

## 🛠 Current Status

✅ MVP complete  
✅ All APIs deployed  
✅ Vercel production ready  
✅ Resume + Cover Letter downloads functional  
✅ Chrome Extension tested and connected

---

## 🧪 Roadmap (Optional Enhancements)

| Priority   | Feature                                  |
|------------|-------------------------------------------|
| High       | State management, batch ingestion         |
| Medium     | Dynamic resume switching, GPT prompt tuning |
| Low        | CLI tools, Supabase migration automation, unit tests

---

## 📁 Project Structure

```
/app/api/ingest-job/route.ts        # Ingest + enrich + insert
/app/api/generate-cover-letter/     # Cover letter as dynamic PDF
/app/api/generate-resume/           # Resume PDF (renamed from static file)
/app/jobs/page.tsx                  # Main dashboard UI
/lib/promptBuilder.ts               # GPT prompt engine
/lib/resume.json                    # Structured resume input
/lib/templates/coverLetter.ts       # HTML cover letter with dynamic variables
/public/resume/master.pdf           # Static resume asset
/utils/supabase/                    # Supabase client helpers
.env.local                          # Environment variables
/chrome-extension/                  # Scraper for LinkedIn & job boards
```

---

## 🧠 Philosophy

This isn’t a SaaS product.  
This is a **job-hunt war machine**.  

It’s built for single-user speed and precision, not scale.  
It prioritizes insight over clutter, targeting over volume, and automation over repetition.  
Everything that’s here exists to help **you land high-leverage roles faster**.

---

## 📌 Usage Note

This repo is private and built for personal use. If you are reading this, you are special, and this repo is intended to demonstrate:
- Drive to build, learn, grow, and win
- Technical fluency across full stack
- System design thinking
- Attention to detail
- Tooling that reflects actual value-driven job search behavior

---

## 🤝 Contributions

This is a solo project.  
Not open to public contributions — yet.  
But if you’re building something similar or want to swap ideas, get in touch.

---

## 🍻 Thanks

To caffeine, clean code, quiet evenings, GPT-4o, and the desire to make every application count.
