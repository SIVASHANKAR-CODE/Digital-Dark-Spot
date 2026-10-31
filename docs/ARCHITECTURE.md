# Architecture

## System Overview

Digital Dark Spot is a monorepo containing a React frontend PWA and Express backend API that work together to provide AI-assisted information gap detection.

## Data Flow

```
User Input (Research Question + URLs)
        │
        ▼
┌─────────────────┐
│   Frontend App   │  React + Vite + TypeScript
│   (PWA Shell)    │  
└────────┬────────┘
         │ REST API calls
         ▼
┌─────────────────┐
│   Express API    │  Request validation, rate limiting
│   /api/v1/*      │  
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│ Content │ │ AI Analysis │
│ Extract │ │   Engine    │
└────┬───┘ └──────┬─────┘
     │            │
     ▼            ▼
┌────────┐ ┌────────────┐
│  Web   │ │  Gemini /   │
│ Pages  │ │  Demo Mode  │
└────────┘ └────────────┘
         │
         ▼
┌─────────────────┐
│  Analysis Result │  Structured JSON
│  - Findings      │  with source refs
│  - Gaps          │
│  - Conflicts     │
│  - Freshness     │
│  - Checklist     │
└─────────────────┘
```

## Analysis Pipeline

1. **Request Validation** — Zod schema validation of research question and URLs
2. **URL Safety Check** — Block private IPs, metadata endpoints, non-HTTP protocols
3. **Content Extraction** — Fetch pages, parse HTML with Cheerio, extract article text
4. **Content Sanitization** — Strip scripts, clean HTML, truncate to size limits
5. **Source Normalization** — Extract metadata, dates, word counts
6. **AI Analysis** — Send structured prompt to AI provider with all source content
7. **Output Validation** — Verify source ID references, strip invalid references
8. **Result Assembly** — Combine into typed AnalysisResult with checklist items

## Security Model

- URL safety validation prevents SSRF (blocks private IPs, localhost, metadata endpoints)
- Content sanitization prevents XSS from extracted web content
- Rate limiting prevents abuse
- Helmet sets security headers
- API keys never leave the server
- Retrieved content treated as untrusted data
- AI output validated against schemas

## Key Design Decisions

1. **In-Memory Store** — Simpler than MongoDB for hackathon. Can swap to MongoDB via config.
2. **Demo Mode** — Works without API keys. Clearly labelled demo data.
3. **Structured AI Prompts** — JSON schema output rather than free-form text parsing.
4. **Source-Grounded Analysis** — Every finding must reference actual retrieved sources.
5. **Uncertainty Labels** — AI interpretations always marked as potential/possible.

