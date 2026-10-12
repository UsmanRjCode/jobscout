# JobScout

JobScout is a Next.js job discovery and matching application. Users enter a
role, location, experience level, visa preference, and optional keywords. The
app searches live career pages and job portals with TinyFish, filters and
deduplicates the results, ranks them by relevance, and provides links to apply.

## Features

- Live job discovery through TinyFish Search
- Support for role, country/city, remote location, seniority, visa preference,
  and keyword filters
- Location-aware filtering so unrelated countries are removed from results
- URL canonicalization and duplicate removal
- Relevance scoring with human-readable match reasons
- TinyFish Fetch enrichment for the highest-ranked listings
- TinyFish Agent summaries for requirements, salary, and remote-work details
- Refresh action for repeating a saved search with current listings
- Local SQLite persistence through Prisma
- Responsive Next.js interface with accessible loading and error states

## How TinyFish is used

1. **TinyFish Search** discovers current openings across company career pages
   and job portals using the user's search criteria.
2. **TinyFish Fetch** reads the live content of the highest-ranked listing
   pages.
3. **TinyFish Agent** analyzes fetched content and produces a short summary of
   important requirements, salary details, and work-location policies.

Each search can make multiple TinyFish requests. The current implementation
uses three Search queries and may Fetch and analyze up to five top results, so
usage should be considered when testing or refreshing searches.

## Tech stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS
- TinyFish Search, Fetch, and Agent APIs
- Prisma ORM
- SQLite for local development
- Lucide React icons

## Requirements

- Node.js 18.18 or newer
- npm
- A TinyFish API key

## Local setup

From the project directory:

```bash
npm install
```

Create a local environment file named `.env.local`:

```env
TINYFISH_API_KEY=your_tinyfish_api_key
DATABASE_URL="file:./dev.db"
```

Never commit `.env.local` or expose the TinyFish API key in browser code.

Initialize the local database and Prisma client:

```bash
npx prisma db push
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run the TypeScript checker |
| `npx prisma studio` | Inspect the local SQLite database |

## Search API

### `POST /api/jobs/search`

Searches TinyFish and returns ranked jobs.

Example request:

```json
{
  "role": "Frontend Engineer",
  "location": "Canada",
  "seniority": "Entry level",
  "visaPreference": "Any",
  "keywords": "React, TypeScript"
}
```

The response contains `success`, an optional `searchId`, and a `jobs` array.
Each job includes a title, URL, source, snippet, score, match reasons, and an
optional Agent summary.

### `POST /api/jobs/refresh`

Repeats a previously saved search using its `searchId`:

```json
{
  "searchId": "search_id_here"
}
```

## Current repository structure

```text
my_app/
├── app/
│   ├── api/jobs/
│   │   ├── search/route.ts       # Live search endpoint
│   │   └── refresh/route.ts      # Re-run saved searches
│   ├── components/               # UI components
│   ├── globals.css               # Tailwind styles and shared components
│   ├── layout.tsx                # Root layout and metadata
│   └── page.tsx                  # Main JobScout page
├── lib/
│   ├── database.ts               # Prisma persistence helpers
│   ├── jobSearch.ts               # Search orchestration and deduplication
│   ├── matching.ts                # Location filtering and relevance scoring
│   ├── tinyfish.ts                 # TinyFish API client
│   └── types.ts                   # Shared TypeScript types
├── prisma/
│   ├── dev.db                     # Local SQLite database
│   └── schema.prisma              # Search and Job models
├── public/                        # Static assets
├── .env.local                     # Local secrets; do not commit
├── package.json
└── README.md
```

## Suggested structure as the project grows

The current structure is appropriate for a small MVP. If the application
grows, use the following organization to keep provider code, domain logic,
validation, and tests easier to maintain:

```text
my_app/
├── app/
│   ├── (marketing)/               # Public landing-page sections
│   ├── dashboard/                 # Search and saved-results UI
│   ├── api/
│   │   └── jobs/
│   │       ├── search/route.ts
│   │       └── refresh/route.ts
│   └── components/                # Shared presentation components
├── components/
│   ├── jobs/                      # JobCard, JobList, filters
│   └── ui/                       # Reusable buttons, badges, fields
├── lib/
│   ├── providers/
│   │   └── tinyfish/              # Search, Fetch, and Agent adapters
│   ├── jobs/
│   │   ├── normalize.ts           # Input and result normalization
│   │   ├── filter.ts              # Location and eligibility filters
│   │   ├── rank.ts                # Matching and ranking
│   │   └── service.ts             # Search orchestration
│   ├── db/                        # Prisma client and repositories
│   ├── validation/                # Zod or equivalent request schemas
│   └── types/                     # Shared domain types
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
├── .env.example
└── README.md
```

Recommended next additions:

1. Add request validation with a schema library before calling the search
   service.
2. Add a provider interface so TinyFish can be mocked in tests or replaced
   later.
3. Add caching and rate limiting to control TinyFish usage.
4. Add unit tests for location matching, URL canonicalization, and ranking.
5. Add integration tests for both API routes with mocked TinyFish responses.
6. Add database migrations for production instead of relying on `db push`.
7. Add an `.env.example` file containing variable names but no secrets.

## Troubleshooting

- If the API reports that `TINYFISH_API_KEY` is missing, check `.env.local`
  and restart the development server.
- If Prisma reports a locked Windows query-engine file, stop other Next.js or
  Node processes using the project and rerun the command.
- If a search returns no results, try a broader role, location, or keyword
  query. Live portals may not expose every listing in their search snippets.
