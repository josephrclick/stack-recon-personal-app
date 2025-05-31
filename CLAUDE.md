# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development**: `npm run dev` (starts Next.js dev server on localhost:3000)
- **Build**: `npm run build` (builds the application for production)
- **Start**: `npm start` (starts production server)

No lint or test commands are configured in package.json.

## Architecture Overview

StackRecon is an AI-powered job targeting system built as a Next.js application with the following core workflow:

1. **Job Ingestion**: Chrome extension scrapes job data and sends it via `/api/ingest-jobs-batch` 
2. **AI Enrichment**: Supabase Edge Function triggers on new jobs, calls OpenAI GPT-4o for deep analysis
3. **Database Storage**: Enriched jobs stored in Supabase with AI-generated insights (fit scores, resume tips, red flags, strategy notes)
4. **Dashboard**: Jobs displayed with filtering/sorting by AI fit scores and strategic insights

### Key Technical Components

- **Frontend**: Next.js App Router + TypeScript + Tailwind + shadcn/ui components
- **Database**: Supabase PostgreSQL with comprehensive job schema (see `/.reference/reference-db-columns.json`)
- **AI Integration**: OpenAI GPT-4o via `/api` routes for cover letter/resume generation
- **PDF Generation**: Puppeteer-core + @sparticuz/chromium for document creation
- **Auth**: Supabase Magic Link authentication

### Database Schema

The main `jobs` table includes both scraped data (company_name, job_title, job_description) and AI-enriched fields:
- `ai_status_score` (0-100 fit score)
- `ai_resume_tips` (JSONB with strengths/gaps)
- `red_flags` (array of concerns)
- `strategy_notes` (AI-generated approach)
- `strategic_interview_angle` (psychological advantage tips)

### File Structure Highlights

- `/app/api/` - API routes for job ingestion, PDF generation
- `/app/protected/jobs/` - Main job dashboard
- `/app/protected/interviews/` - Interview tracking interface  
- `/lib/resume.json` - Structured resume data for AI context
- `/lib/templates/coverLetter.ts` - Cover letter generation logic
- `/utils/supabase/` - Database client helpers
- `/components/ui/` - shadcn/ui component library

### Development Philosophy

Single-user system optimized for speed and precision over scalability. Pragmatic solutions preferred over theoretical perfection. The system is designed for tactical job targeting, not spray-and-pray approaches.

### Path Aliases

Uses `@/*` alias pointing to project root for imports.