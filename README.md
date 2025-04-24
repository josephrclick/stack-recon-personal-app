# 🧠 StackRecon

**Scan Stack. Find Gap. Insert Value.**  
An AI-powered job targeting system for people who take their careers seriously.

---

## 🚀 What It Does

StackRecon is a tactical, full-stack, AI-augmented job war machine.

It scrapes, analyzes, enriches, and tracks job opportunities with strategic insight and aggressive efficiency. Every record is enriched via OpenAI with custom prompt logic and scored for fit, leverage, and risk. You don’t just track jobs—you run campaigns.

---

## ⚙️ Workflow Overview

1. **Scraping** – Chrome Extension extracts cleaned job descriptions from LinkedIn, Dice, RemoteRocketship, and more.
2. **Batch Ingestion** – All jobs are sent via `/api/ingest-jobs-batch` (secure, tokenized).
3. **Edge-Triggered Enrichment** – When a new job hits the `jobs` table in Supabase, an Edge Function calls OpenAI for deep enrichment using custom GPT-4o prompts.
4. **Database Storage** – Enriched results (including red flags, strategy notes, resume tips, and interview angles) are normalized and stored in Supabase.
5. **Dashboard Filtering** – Jobs are visualized and triaged in a responsive dashboard sorted by fit, opportunity, and risk.

---

## 🧱 Stack Overview

| Layer        | Tech Stack                                                  |
|--------------|-------------------------------------------------------------|
| Frontend     | Next.js (App Router), TypeScript, Tailwind, shadcn/ui       |
| Hosting      | Vercel                                                      |
| Database     | Supabase (PostgreSQL + RLS)                                 |
| Auth         | Supabase Magic Link                                         |
| AI Engine    | OpenAI GPT-4o API                                           |
| Resume Input | Structured JSON (`/lib/resume.json`)                        |
| PDF Engine   | Puppeteer-Core + @sparticuz/chromium                        |
| Ingestion    | Chrome Extension → `/api/ingest-jobs-batch` → Supabase     |
| Enrichment   | Supabase Edge Function → GPT-4o auto-enrichment             |

---

## 💡 AI-Enriched Fields

Each job is enriched with:

- 🔎 Summary, required experience, industry, ideal candidate
- 🧠 GPT resume tips: strengths, gaps, and suggested bullets
- 🧮 Fit score (0–100) + tailored summary
- 🚩 Red flags and strategy notes
- 🔧 Tech stack + strategic leverage
- ❓ Interview angle for psychological advantage

---

## 🖥 Dashboard UI Highlights

- Color-coded job cards by AI fit score
- Full GPT insight view per job
- Action buttons:
  - ✅ Apply → status update
  - 📄 Cover Letter → GPT → PDF
  - 📎 Resume → Custom company-branded PDF
  - 🗑 Delete → Soft archive
- Upcoming: Interview tracker and prep sheet launchers

---

## 🔥 Philosophy

This isn’t another SaaS job board clone.  
This is **a custom GTM system** for your career.  
Designed for elite job targeting. Not for scale. Not for spray-and-pray.

- **Fast ingestion.**
- **Smart enrichment.**
- **Strategic execution.**
- Built for one person. Me. And it works.

---

## 🧠 Use Case

You don’t skim job boards. You **run structured campaigns**.  
You don’t read 20 JDs. You **enrich and attack 2 that matter**.  
You don’t just apply—you **build leverage**.

If you're an employer reading this, know that I build my own systems.  
I don’t wait for the right job—I engineer my own surface area.  
I move fast. I think strategically. And I land where I want to be.

---

## 📁 Repo Structure

```
/app/api/ingest-jobs-batch/         # Ingest endpoint (replaces ingest-job)
/app/api/generate-cover-letter/     # Cover letter PDF (dynamic GPT)
/app/api/generate-resume/           # Resume PDF (static or GPT-aided)
/app/jobs/page.tsx                  # Job board UI
/lib/resume.json                    # Structured resume
/supabase/functions/enrich-job-post/# Edge Function for GPT-4o enrichment
/public/resume/master.pdf           # Static fallback resume
/utils/supabase/                    # Supabase helpers
/chrome-extension/                  # Job scraper
```
