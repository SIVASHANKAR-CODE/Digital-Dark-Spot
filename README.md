# Digital Dark Spot

## AI-Assisted Information Gap Detection Platform

Digital Dark Spot helps researchers discover what information is **missing**, **contradictory**, **outdated**, or **uncertain** when investigating a topic. Unlike conventional AI summarizers, it identifies the gaps between what sources say and what remains unverified.

### Key Features

- **Information Gap Detection** — Identifies missing details, unanswered questions, and unexplored aspects
- **Contradiction Analysis** — Cross-references claims across sources and highlights conflicts
- **Freshness Assessment** — Flags potentially outdated information with supporting evidence
- **Source-Grounded Findings** — Every finding links back to its supporting source
- **Verification Checklist** — Prioritized next steps for thorough research
- **Exportable Reports** — Professional research reports with citations and limitations

### Architecture

```
├── apps/
│   ├── web/          # React + Vite + TypeScript frontend (PWA)
│   └── api/          # Express + TypeScript backend
├── packages/
│   └── shared/       # Shared TypeScript types
└── docs/             # Documentation
```

### Quick Start

#### Prerequisites

- Node.js 18+ 
- npm 9+

#### Installation

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api && npm install

# Install web dependencies  
cd ../web && npm install
```

#### Environment Setup

```bash
# Copy environment template
cp .env.example apps/api/.env

# Edit with your configuration
# At minimum, the app works in demo mode without any API keys
```

#### Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:api   # Backend on http://localhost:3001
npm run dev:web   # Frontend on http://localhost:5173
```

#### Production Build

```bash
npm run build
npm start
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: http://localhost:5173) |
| `MONGODB_URI` | No | MongoDB connection string (uses in-memory store if not set) |
| `GEMINI_API_KEY` | No | Google Gemini API key for live AI analysis |
| `OPENAI_API_KEY` | No | OpenAI API key (alternative provider) |
| `AI_PROVIDER` | No | AI provider selection: gemini or openai |
| `SEARCH_API_KEY` | No | Web search API key |
| `SEARCH_PROVIDER` | No | Search provider (default: google) |

**Demo Mode**: The application works without any API keys using built-in demonstration data. Demo results are clearly labelled.

### Demo Scenario

Try the built-in example: **"What should a student verify before applying for a scholarship?"**

This demonstrates:
1. Source collection from provided URLs
2. Content extraction and analysis
3. Information gap identification
4. Contradiction detection between sources
5. Freshness assessment of source material
6. Interactive verification checklist
7. Exportable research report

### Technology Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Framer Motion, Lucide Icons

**Backend**: Node.js, Express, TypeScript, Zod validation, Cheerio (content extraction)

**AI**: Google Gemini (configurable), with structured analysis pipeline

**PWA**: Service worker, web manifest, offline shell, installable

### Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

### Deployment

#### Frontend (Vercel/Netlify)

1. Set build command: `cd apps/web && npm run build`
2. Set output directory: `apps/web/dist`
3. Set environment variable `VITE_API_URL` to your API URL

#### Backend (Railway/Render)

1. Set build command: `cd apps/api && npm run build`
2. Set start command: `cd apps/api && npm start`
3. Set environment variables from `.env.example`

### Project Status

Built for the Shinchan Online Hackathon 2026.

### License

MIT

