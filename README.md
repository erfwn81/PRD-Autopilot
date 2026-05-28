# PRD Autopilot

> Turn a fuzzy feature idea into a complete, professional PRD in under 5 minutes — through a structured AI-powered interview.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_ORG/prd-autopilot)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Claude](https://img.shields.io/badge/Claude-Sonnet_4.5-D4A574)
![License](https://img.shields.io/badge/license-MIT-green)

---

## The Problem

Writing a PRD from scratch takes a senior PM 4–8 hours. Junior PMs write incomplete ones. Engineers build the wrong thing because the spec was vague.

PRD Autopilot fixes this with a structured AI interview that forces clarity *before* generating output — making the result trustworthy and specific, not a generic wall of text.

---

## Demo

> **Live app**: [prd-autopilot.vercel.app](https://prd-autopilot.vercel.app)

**Try it with this prompt:**
```
I want to build a feature that lets users share their dashboard 
with external stakeholders without giving them edit access.
```

---

## How It Works

```
Your idea (2–3 sentences)
        │
        ▼
  AI generates 5 targeted clarifying questions
  (one at a time, conversational)
        │
        ▼
  You answer each question in plain language
        │
        ▼
  Full PRD generated from your context
        │
        ▼
  Export → Notion / PDF / Markdown
```

### Every generated PRD includes

| Section | Description |
|---|---|
| Problem statement | 2–3 paragraphs: problem, who has it, why now |
| User personas | 2–3 named personas with role, context, pain point |
| Jobs to be done | 3–5 JTBD statements |
| User stories | 6+ stories with priority (must/should/nice) |
| Acceptance criteria | Given/When/Then for each major story |
| Edge cases | 5+ scenarios the engineering team must handle |
| Out of scope | Explicit list of what is NOT in this release |
| Success metrics | 3–5 KPIs with target values and measurement method |
| Phased rollout | Phase 1 MVP → Phase 2 Iteration → Phase 3 Scale |
| Open questions | Unresolved decisions with owner and impact |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Anthropic Claude API (`claude-sonnet-4-5`) |
| PDF export | jsPDF |
| Notion export | Notion API |
| Analytics | Novus.ai |
| Deployment | Vercel |

---

## Project Structure

```
prd-autopilot/
├── app/
│   ├── layout.tsx                    # Root layout + Novus.ai
│   ├── page.tsx                      # Landing page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx            # PRD history
│   ├── new/page.tsx                  # Start new PRD
│   └── prd/[sessionId]/
│       ├── page.tsx                  # Interview flow
│       └── result/page.tsx           # PRD view + export
├── components/
│   ├── ui/                           # Button, Input, Textarea, Card, Spinner
│   ├── interview/                    # InitialInput, QuestionCard, InterviewProgress
│   ├── prd/                          # PRDDocument, PRDSection, ExportBar
│   └── layout/                       # Header, Footer
├── lib/
│   ├── supabase/                     # client.ts + server.ts
│   ├── claude/                       # generateQuestions.ts + generatePRD.ts + prompts.ts
│   └── export/                       # toMarkdown.ts + toNotion.ts + toPDF.ts
├── app/api/
│   ├── interview/start/route.ts
│   ├── interview/answer/route.ts
│   ├── prd/generate/route.ts
│   ├── prd/update/route.ts
│   └── prd/export/notion/route.ts
└── types/index.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Notion](https://developers.notion.com) integration token
- A [Novus.ai](https://novus.ai) project ID

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/prd-autopilot.git
cd prd-autopilot
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
NOTION_API_KEY=secret_...
NEXT_PUBLIC_NOVUS_PROJECT_ID=your-novus-id
```

### 3. Run the database schema

Open your Supabase project → SQL Editor → paste and run:

```sql
create table prd_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  initial_input text not null,
  status text not null default 'interviewing',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table interview_qa (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references prd_sessions(id) on delete cascade,
  question_number integer not null,
  question text not null,
  answer text,
  created_at timestamptz default now()
);

create table prd_documents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references prd_sessions(id) on delete cascade,
  problem_statement text,
  user_personas jsonb,
  jobs_to_be_done jsonb,
  user_stories jsonb,
  acceptance_criteria jsonb,
  edge_cases jsonb,
  out_of_scope jsonb,
  success_metrics jsonb,
  rollout_plan jsonb,
  open_questions jsonb,
  raw_markdown text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table prd_sessions enable row level security;
alter table interview_qa enable row level security;
alter table prd_documents enable row level security;

create policy "Users own their sessions"
  on prd_sessions for all using (auth.uid() = user_id);

create policy "Users own their QA"
  on interview_qa for all using (
    session_id in (select id from prd_sessions where user_id = auth.uid())
  );

create policy "Users own their PRDs"
  on prd_documents for all using (
    session_id in (select id from prd_sessions where user_id = auth.uid())
  );
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

### `POST /api/interview/start`

Create a session and receive the first interview question.

**Request**
```json
{
  "initialInput": "I want to build a feature that lets users share their dashboard with external stakeholders without giving them edit access."
}
```

**Response**
```json
{
  "sessionId": "uuid",
  "question": "Who are the external stakeholders — customers, investors, or internal teams from other departments?",
  "questionNumber": 1,
  "totalQuestions": 5
}
```

---

### `POST /api/interview/answer`

Save an answer and receive the next question (or signal completion).

**Request**
```json
{
  "sessionId": "uuid",
  "questionNumber": 1,
  "answer": "Mostly customers and investors who need to see metrics but shouldn't change anything."
}
```

**Response** (questions 1–4)
```json
{
  "question": "What specific data do they need to see — just charts, or also comments and filters?",
  "questionNumber": 2,
  "totalQuestions": 5,
  "done": false
}
```

**Response** (question 5)
```json
{
  "done": true,
  "sessionId": "uuid"
}
```

---

### `POST /api/prd/generate`

Generate the full PRD after all 5 answers are collected.

**Request**
```json
{ "sessionId": "uuid" }
```

**Response** — full `PRDDocument` object (all 10 sections)

---

### `PATCH /api/prd/update`

Save inline edits to a PRD section.

**Request**
```json
{
  "sessionId": "uuid",
  "section": "problem_statement",
  "value": "Updated text..."
}
```

---

### `POST /api/prd/export/notion`

Push the PRD to a Notion workspace.

**Request**
```json
{
  "sessionId": "uuid",
  "notionPageId": "optional-parent-page-id"
}
```

---

## Team

Built for the **Mind the Product — World Product Day 2026** hackathon.

| Role | Owns |
|---|---|
| Backend / AI | All API routes, Claude prompts, Supabase schema, Notion export |
| Frontend / UX | All pages, interview UI, PRD renderer, export bar, mobile |
| Infra / Demo | Auth, dashboard, Vercel deploy, Novus.ai, demo video |

---

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

---

## Deployment

This app is optimized for Vercel.

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` to the Vercel project settings
4. Deploy

Every push to `main` triggers a production deploy automatically.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a pull request

---


