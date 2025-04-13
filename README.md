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

# 💼 AI Job Hunt Dashboard (Next.js + Supabase Edition)

This is a personal, single-user AI-powered job hunting tool built with **Next.js**, **Supabase**, and **OpenAI**. It aims to automate parts of the job application workflow—ingesting job post data (via a Chrome extension), enriching it using GPT-4o, storing structured data for dashboard management, and assisting with resume/cover letter generation.

---

## 🧱 Stack Overview

| Layer       | Tech Stack                                                      |
| :---------- | :-------------------------------------------------------------- |
| Frontend    | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Hosting     | Vercel                                                          |
| Database    | Supabase (PostgreSQL + RLS)                                     |
| Auth        | Supabase Auth (Email/Password)                                  |
| AI          | OpenAI API (GPT-4o-mini)                                        |
| Ingestion   | Chrome Extension → `/api/ingest-job` (via API Key)              |
| Resume      | Static JSON file (`lib/resume.json`) used for GPT prompt context |
| Logging     | Basic `console.log`/`console.error` to Vercel Logs              |

---

## ✅ Features & Current Status

* **Hosting & Deployment:** Fully hosted on Vercel with GitHub sync.
* **Database:** Supabase project created with `jobs` table schema defined.
* **Core API:** `/api/ingest-job` endpoint functional:
    * Accepts job details via POST request (requires `x-api-key` header).
    * Uses `gpt-4o-mini` to analyze job description against static resume (`lib/resume.json`).
    * Generates structured job analysis including overview, requirements, and AI resume tips.
    * Sanitizes AI output and inserts enriched data into the Supabase `jobs` table.
* **Authentication:** Basic user authentication implemented using Supabase Auth (Email/Password):
    * Sign Up, Sign In, Sign Out functionality via Server Actions.
    * Password Reset flow implemented.
    * Protected routes configured via Next.js Middleware.
* **Dashboard UI:** Functional dashboard page (`/jobs`) built with `shadcn/ui`:
    * Displays jobs fetched from Supabase in a table.
    * Includes placeholders for action buttons (Apply, Delete, Generate Docs).
    * Modal dialog for viewing detailed job information & AI analysis.

---

## 🔧 Next Steps & Priorities

### High Priority

1.  **Chrome Extension Integration:** Connect the companion Chrome Extension to the `/api/ingest-job` endpoint to enable scraping and sending data directly from job posting pages. Ensure `x-api-key` header is included.
2.  **Implement Dashboard Actions:** Wire up the action buttons on the dashboard:
    * `Apply`/`Applied` toggle: Update job status in Supabase.
    * `Delete`: Remove job record from Supabase.
    * `Cover Letter`/`Resume`: Trigger generation (likely via new API calls or server actions).
3.  **Dynamic Resume Management:** Replace the static `lib/resume.json`. Implement UI for uploading/editing resume content, storing it securely (e.g., associated with the user profile in Supabase), and using it dynamically in the API prompt.
4.  **Enhance API Security:** Transition `/api/ingest-job` endpoint from static `x-api-key` authentication to using the authenticated user's Supabase session/JWT for authorization.

### Medium Priority

5.  **Dashboard Enhancements:** Add filtering, sorting, and potentially searching capabilities to the jobs table.
6.  **Refine Error Handling:** Improve error handling and user feedback, especially for Server Actions (show errors in UI state instead of URL params) and API calls. Implement more structured logging.
7.  **Configuration Management:** Move hardcoded values (like OpenAI model name, temperature) from code into environment variables.
8.  **Testing:** Introduce automated tests (unit tests for key functions, integration tests for API/auth flows).

### Low Priority

9.  **Database Migrations:** Set up Supabase CLI or similar tool to manage database schema changes programmatically.
10. **Data Enrichment:** Expand the OpenAI prompt to extract more fields (e.g., company mission, red flags, interview talking points).

---

## 💡 Philosophy

This project is intentionally **solo-use**, ultra-streamlined, and optimized for speed and personal efficiency. No complex user management or multi-tenant support.

---

## 📁 Project File Map (Key Files)

/app/api/ingest-job/route.ts # API endpoint for ingesting & processing job data
/app/jobs/app-jobs-page.tsx  # Primary dashboard UI component
/app/actions.ts              # Server Actions for authentication
/middleware.ts               # Next.js middleware for auth/session handling
/lib/resume.json             # Static structured resume for GPT context (to be replaced)
/utils/supabase/             # Supabase client/server/middleware helpers
/utils/utils.ts              # Utility functions (e.g., encodedRedirect)
/components/ui/              # Shadcn/ui components
.env.local                   # Environment variables (API keys, Supabase creds)

---

🤝 Contributions

This is currently a personal project. Contributions are not open at this time.