````md
# PRD Autopilot

> Turn ideas into engineering ready PRDs, validation reports, and investor pitch decks in minutes.

PRD Autopilot is an AI powered founder platform that helps users validate startup ideas, generate Product Requirements Documents (PRDs), analyze product quality, create investor ready pitch decks, and collaborate with AI throughout the product development process.

Built for **Mind the Product – World Product Day 2026 Hackathon**.

---

## Live Demo

https://prd-autopilot.vercel.app

---

## Features

### Idea Validation

Validate startup ideas before building them using AI-powered:

- Market research
- Competitor analysis
- SWOT analysis
- Risk assessment
- Customer profiling
- Go / No-Go recommendations

### AI Powered PRD Generation

Users describe an idea and answer five targeted follow up questions.

PRD Autopilot automatically generates:

- Problem Statement
- User Personas
- Jobs To Be Done
- User Stories
- Acceptance Criteria
- Edge Cases & Error States
- Out of Scope
- Success Metrics
- Phased Rollout Plan
- Open Questions

### PRD Health Scoring

Analyze generated PRDs and receive:

- Quality scores
- Gap analysis
- Actionable recommendations
- Improvement suggestions

### Ticket & Backlog Generation

Convert PRDs into structured product work items.

### Pitch Deck Generator

Automatically generate investor-ready pitch decks including:

- Problem
- Solution
- Market Opportunity
- Product
- Business Model
- Competition
- Traction
- Team
- Funding Ask

### AI Product Advisor

Chat with an AI powered product advisor to:

- Refine ideas
- Improve PRDs
- Brainstorm features
- Explore product strategy

### Exports

Export documents to:

- PDF
- Markdown
- Notion

---

## Workflow

```text
Idea
↓
Validation Report
↓
AI Interview
↓
PRD Generation
↓
PRD Health Score
↓
Ticket Generation
↓
Pitch Deck
↓
AI Product Advisor
````

---

## Tech Stack

### Frontend

* Next.js 14
* TypeScript
* Tailwind CSS

### Backend

* Supabase
* Groq API (Llama 3.3 70B)

### Infrastructure

* Vercel

### Integrations

* Notion API
* Novus Analytics

---

## Getting Started

### Prerequisites

* Node.js 18+
* npm

### Installation

```bash
git clone https://github.com/erfwn81/PRD-Autopilot.git
cd PRD-Autopilot
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
NOTION_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Team

### Erfan Mirzaee

Backend, AI Systems, Architecture, Deployment

### Elijah Rodriguez

Frontend, Dashboard, UI/UX, Mobile Optimization

### Esmeralda Amado

Authentication, QA Testing, Demo Video, Devpost Submission

---

## Hackathon

Built for:

**Mind the Product – World Product Day 2026**

---

## Links

### Live Demo

https://prd-autopilot.vercel.app

### GitHub Repository

https://github.com/erfwn81/PRD-Autopilot

---

## License

MIT License

```
```
