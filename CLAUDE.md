# ClearBite — Canadian Food Compliance Platform

## Project Overview

ClearBite is a bilingual (EN/KO) web application for navigating Canadian food compliance regulations. It provides AI-powered Q&A with legal citations, product label analysis via vision AI, compliance checklists, and market cross-checks. Target users are food producers and importers operating in Canada.

- **Domain**: clearbite.ca (planned)
- **Status**: Deployed on Vercel (private, not publicly promoted)
- **Owner**: Otherhand Ventures (marco@otherhand.ca)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui (base-nova) |
| Database | Supabase Cloud (Free tier) — PostgreSQL + pgvector |
| Auth | Supabase Auth (@supabase/ssr) |
| AI (LLM) | Anthropic Claude via Vercel AI SDK |
| AI (Embeddings) | OpenAI (text-embedding-3-small, 1536d) |
| Web Search | Exa API (optional) |
| Deployment | Vercel |
| Testing | Vitest 4 |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (server-side)
│   │   ├── chat/           # Q&A (stream + non-stream)
│   │   ├── checklist/      # Compliance checklist generation
│   │   ├── market/         # Market cross-reference
│   │   ├── product-check/  # Vision AI label analysis
│   │   ├── regulations/    # Regulation search + [id] detail
│   │   ├── tokens/         # Balance, packages, referral, transactions
│   │   └── auth/debug/     # Auth debug (dev only)
│   └── [pages]/            # chat, checklist, market, product-check, regulations
├── components/
│   ├── chat/               # Chat UI (messages, input, stream, suggestions)
│   ├── checklist/          # Checklist viewer
│   ├── market/             # Product search
│   ├── product-check/      # Label analysis UI
│   ├── regulations/        # Regulation list
│   ├── tokens/             # Token balance display
│   ├── auth/               # Auth dialog
│   ├── layout/             # Header
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # use-auth, use-auth-guard, use-language, use-toast, use-tokens
├── lib/
│   ├── ai/                 # Prompts, chat engine, product analyzer, verifier, JSON parser
│   ├── rag/                # Chunker, embedder, retriever (hybrid: structured + vector + RRF)
│   ├── analytics/          # Events, gap analysis, session tracking
│   ├── auth/               # Server auth helpers, middleware utils
│   ├── db/                 # Supabase client, DB types
│   ├── checklist/          # Checklist generator
│   ├── market/             # Market scanner
│   ├── tokens/             # Token service (atomic PL/pgSQL operations)
│   ├── validators/         # Zod schemas (chat, product-check)
│   ├── cache.ts            # LRU cache with TTL
│   ├── rate-limit.ts       # In-memory sliding window rate limiter
│   ├── env.ts              # Environment validation
│   └── utils.ts            # General utilities
└── types/                  # chat, market, product-check, regulation, verification
```

## Database Schema (Supabase)

### Core Tables
- **agencies** — Regulatory bodies (CFIA, Health Canada, CBSA)
- **regulations** — Laws (SFCA, SFCR, FDA)
- **regulation_sections** — Hierarchical regulation content (full-text search indexed)
- **regulation_chunks** — Vector embeddings (1536d) for semantic search

### User & Token Tables
- **user_profiles** — Extended user data + referral system
- **user_token_balances** — Current token balance
- **token_transactions** — Immutable ledger (all token operations)
- **token_packages** — Purchasable packages ($5-$149 CAD)
- **api_token_costs** — Per-endpoint token costs

### Key Functions (PL/pgSQL)
- `spend_user_tokens()` — Atomic token deduction
- `add_user_tokens()` — Atomic token addition
- `match_regulation_chunks()` — Vector similarity search

## Token Economics

| Endpoint | Cost | Description |
|----------|------|-------------|
| /api/chat | 3 tokens | Q&A with RAG + verification |
| /api/product-check | 15 tokens | Vision AI label analysis |
| /api/checklist | 5 tokens | Compliance checklist |
| /api/market | 2 tokens | Market cross-check |

- Signup bonus: 30 free tokens
- Referral bonus: 60 tokens each (referrer + referred)
- Packages: 100 tokens/$5, 500/$20, 2000/$69, 5000/$149

## Environment Variables

### Required
- `ANTHROPIC_API_KEY` — Claude API key
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

### Optional
- `SUPABASE_SERVICE_ROLE_KEY` — Admin operations (token management)
- `OPENAI_API_KEY` — Embedding generation
- `EXA_API_KEY` — Web search augmentation

## Key Patterns

- **RAG Pipeline**: Query expansion (bilingual) → Hybrid search (structured + vector) → RRF fusion → LLM answer → Verification
- **Immutability**: All interfaces use `readonly`, token operations are atomic PL/pgSQL
- **Rate Limiting**: In-memory sliding window per endpoint type
- **Streaming**: Chat uses SSE with metadata delimiter pattern (`---METADATA---`)
- **Caching**: LRU cache with TTL for retrieval results and embeddings

## Development

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:3000)
npm run db:seed          # Seed regulations into Supabase
npm run db:embed         # Generate vector embeddings
npm run db:setup         # Seed + embed in sequence
npm run build            # Production build
npm run lint             # ESLint
npx vitest               # Run tests
```

## Migrations

Migrations are in `supabase/migrations/` with sequential numbering.
Note: Numbers 008-011 were skipped during development. Next migration should use 013+.

## Roadmap

1. **Stripe integration** — Real payment for token packages
2. **Regulation data expansion** — Canadian NHP (natural health products), then US FDA
3. **Document auto-generation** — Compliance labels, declaration forms (lower priority)
4. No B2B SaaS/multi-tenant plans currently

## Conventions

- Feature-based file organization (not type-based)
- Bilingual: Korean as default, English as secondary
- All API routes validate input with Zod schemas
- Components follow shadcn/ui patterns
- Immutable data patterns throughout
