# OHMAZE

Canadian food & NHP compliance platform powered by AI. Ask regulatory questions, analyze product labels, generate compliance checklists, and cross-check market requirements — all backed by actual Canadian legislation with 3-step verification.

## Features

- **Q&A Chat** — RAG-based answers citing SFCA, SFCR, FDA, and more
- **Product Label Check** — Upload a food label photo for import eligibility analysis (Vision AI)
- **Compliance Checklists** — Auto-generated checklists by product category
- **Market Cross-check** — Verify similar products already sold in Canada
- **Regulation Browser** — Search and read Canadian food regulations directly

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| AI | Anthropic Claude (LLM), OpenAI (embeddings) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project (cloud or local via Docker)
- API keys: Anthropic (required), OpenAI (for embeddings), Exa (optional)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template and fill in your keys
cp .env.example .env.local
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Admin operations (token management) |
| `OPENAI_API_KEY` | No | Embedding generation |
| `EXA_API_KEY` | No | Web search augmentation |

### Database Setup

Run migrations against your Supabase project, then seed and generate embeddings:

```bash
# Apply migrations (via Supabase CLI)
supabase db push

# Seed regulation data + generate vector embeddings
npm run db:setup
```

### Development

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npx vitest         # Run tests
```

## Project Structure

```
src/
├── app/            # Pages + API routes
├── components/     # Feature-based components + shadcn/ui
├── hooks/          # Custom React hooks
├── lib/            # Core business logic (AI, RAG, tokens, auth)
├── types/          # TypeScript type definitions
supabase/
├── migrations/     # PostgreSQL migrations
data/
├── templates/      # Compliance document templates
scripts/
├── seed-database.ts        # Regulation data seeding
├── generate-embeddings.ts  # Vector embedding generation
```

## Token System

ClearBite uses a token-based credit system:

| Feature | Cost |
|---------|------|
| Chat Q&A | 3 tokens |
| Product Label Check | 15 tokens |
| Compliance Checklist | 5 tokens |
| Market Cross-check | 2 tokens |

New users receive 30 free tokens on signup. Referral bonuses: 60 tokens each.

## License

Private — Otherhand Ventures
