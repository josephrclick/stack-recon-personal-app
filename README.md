# 💼 AI Job Hunt Dashboard (Next.js + Supabase Edition)

This is a personal, single-user AI-powered job hunting tool built with **Next.js**, **Supabase**, and **OpenAI**. It automates the job application workflow—scraping job posts, enriching them with GPT-4o, and storing clean structured data for dashboard management and resume generation.

---

## 🧱 Stack Overview

| Layer       | Tech Stack                                |
|------------|--------------------------------------------|
| Frontend   | Next.js (App Router, TypeScript)           |
| Hosting    | Vercel                                     |
| Database   | Supabase (PostgreSQL + RLS)                |
| Auth       | Supabase Magic Link (Single user)          |
| AI         | OpenAI API (GPT-4o)                        |
| Ingestion  | Chrome Extension → `/api/ingest-job`       |
| Resume     | JSON file injected into GPT prompt context |
| Logging    | Debug output via `console.log` to Vercel Logs |

---

## 📦 Features (Completed)

- ✅ Fully hosted on Vercel with GitHub sync
- ✅ Supabase schema created with `jobs` table
- ✅ `resume.json` generated from PDF, stored in `/lib/`
- ✅ `/api/ingest-job` API endpoint built using App Router (`route.ts`)
- ✅ GPT-4o-mini generates structured job analysis with:
  - Title, Company, Summary, Requirements
  - Resume tips (strengths, gaps, suggested bullets)
- ✅ Markdown formatting from GPT is sanitized before parsing
- ✅ Records are inserted into Supabase with all enriched fields

---

## 🥪 Current Dev Status

✅ POST requests work via Postman  
✅ Job posts appear in Supabase with full AI-enriched metadata  
🔜 Next up: integrate existing Chrome Extension

---

## 🔧 Next Steps

### 🔹 1. Chrome Extension Integration (in progress)
- Connect extension POST logic to `/api/ingest-job`
- Send `html`, `url`, and `source` with `x-api-key` header
- Confirm end-to-end record insertion from browser job page scrape

### 🔹 2. Data Enrichment Strategy
- Expand GPT prompt to pull out more useful fields:
  - Company mission, industry, red flags, values
  - Ideal interview talking points
  - Fit score or urgency rating
- Potential for multi-step prompts or re-processing with another model

### 🔹 3. Dashboard UI (Next phase)
- Build authenticated route to view and manage jobs
- Filter/sort by `status`, `ai_score`, company, etc.
- Add “Generate Resume” button → tailored GPT + PDF output

---

## 💡 Philosophy

This project is intentionally **solo-use**, ultra-streamlined, and optimized for speed. No user management. No multi-tenant support. Just one highly efficient human working smarter than the rest.

---

## 📁 Project File Map (Key Files)

```
/app/api/ingest-job/route.ts   → API endpoint for ingesting HTML
/lib/resume.json               → Structured resume for GPT context
.env.local                     → OpenAI key, Supabase keys, API key
/pages/                        → Future dashboard views
/supabase/                     → Managed via web UI
```

---

## 🔐 .env Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
EXTENSION_API_KEY=sk-ext_xxxxxxxxxxxxxxxxx
```

---

## 🤝 Contributions

Not open to public contributions—this is a personal R&D lab. But I’ll probably build a product out of it later 🤪

