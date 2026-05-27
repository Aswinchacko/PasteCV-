# PasteCV

Paste a resume. Get a clean, shareable portfolio link. No accounts, no fluff.

PasteCV converts arbitrary resume text into structured JSON via an LLM, persists
it to Postgres, and serves a server-rendered portfolio at `/[slug]`. Built as a
proof of how far you can go with a single textarea and no auth.

---

## Stack

| Layer       | Tech                                                       |
| ----------- | ---------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, RSC, Turbopack)                    |
| Language    | TypeScript 6, strict                                       |
| UI          | React 19 + Tailwind CSS v4 (`@theme` tokens, glass utils)  |
| Validation  | Zod                                                        |
| LLM         | Groq (`llama-3.3-70b-versatile`, JSON-mode)                |
| Database    | Supabase (Postgres + Storage)                              |
| Icons       | lucide-react + handcrafted SVG brand marks                 |
| Fonts       | Inter + JetBrains Mono via `next/font`                     |
| Tooling     | tsx (local extractor smoke tests), PostCSS                 |

---

## Architecture

```
┌──────────────┐    POST /api/parse     ┌────────────────┐
│  Landing UI  │ ─────────────────────▶ │  Next.js Route │
│   /textarea  │                        │   (Node.js)    │
└──────────────┘                        └───────┬────────┘
                                                │ 1. validate body
                                                │ 2. extractResume()
                                                ▼
                                        ┌────────────────┐
                                        │   Groq LPU     │
                                        │ Llama 3.3 70B  │
                                        │  json_object   │
                                        └───────┬────────┘
                                                │
                                                ▼
                                        ┌────────────────┐
                                        │     Zod        │
                                        │  safeParse     │
                                        └───────┬────────┘
                                                │
                                                ▼
                                        ┌────────────────┐
                                        │   Supabase     │
                                        │  portfolios    │
                                        │   + slug gen   │
                                        └───────┬────────┘
                                                │
                                                ▼
                                          { slug, url, data }
                                                │
                                                ▼
┌──────────────┐    GET /[slug]         ┌────────────────┐
│  RSC page    │ ◀───────────────────── │ getPortfolio   │
│  SSR + OG    │                        │   BySlug()     │
└──────────────┘                        └────────────────┘
```

Key invariants:

- All LLM output is forced through `ResumeDataSchema` (`src/lib/ai/schema.ts`)
  before it touches the DB. Bad JSON or schema drift fails fast with a clean
  error.
- `response_format: { type: "json_object" }` on the Groq call eliminates
  markdown-fence parsing failures.
- Supabase service role key is only ever used in server contexts (`runtime =
  "nodejs"` is pinned on every route).
- `getSupabase()` is lazy so `next build` doesn't crash without env.

---

## Quick start

```bash
git clone <your-fork>
cd PasteCV
npm install
cp .env.local.example .env
# Fill in the values below, then:
npm run dev
```

Visit http://localhost:3000.

### Environment variables

```env
GROQ_API_KEY=gsk_...                       # https://console.groq.com/keys
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...    # service_role, NOT anon
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # set to your Vercel URL in prod
```

Optional:

```env
GROQ_MODEL=llama-3.1-8b-instant            # override default Llama 3.3 70B
```

### Database

Run once in the Supabase SQL Editor:

```sql
create table portfolios (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  data        jsonb not null,
  views       integer default 0,
  created_at  timestamptz default now()
);

create index on portfolios(slug);
```

---

## Scripts

| Script              | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Next.js dev server with Turbopack on `:3000`          |
| `npm run build`     | Production build                                      |
| `npm run start`     | Serve the production build                            |
| `npm run typecheck` | `tsc --noEmit`                                        |
| `npm run test:ai`   | Run the AI extractor smoke tests against a few resumes |

`npm run test:ai` hits Groq directly with `tsx` — useful for iterating on
prompts without spinning up the whole app.

---

## Project structure

```
src/
  app/
    api/
      parse/route.ts            POST  → extract + persist + return { slug, url, data }
      portfolio/[slug]/route.ts GET   → fetch row, increment views
      export/route.ts           POST  → stubbed (501) for v2 PDF export
    [slug]/page.tsx             RSC portfolio page with generateMetadata()
    page.tsx                    Landing
    not-found.tsx
    layout.tsx                  Fonts + global metadata
    globals.css                 Tailwind v4 + tokens + utilities
  components/
    landing/ResumeInput.tsx     Terminal-style textarea card, ⌘↵ submit
    portfolio/
      Hero.tsx                  Name, title, summary, contact pills
      SectionHeading.tsx        Numbered "01 · Skills" headings
      SkillsGrid.tsx
      ExperienceList.tsx        Timeline with hover-glow markers
      ProjectCards.tsx          2-col glass cards
      EducationList.tsx
      ShareBar.tsx              Sticky bottom: copy link + view counter
    ui/
      Button.tsx
      Badge.tsx
      Wordmark.tsx
  lib/
    ai/
      schema.ts                 Zod ResumeData
      prompt.ts                 System prompt + buildUserPrompt()
      client.ts                 callGroq() — OpenAI-compatible fetch wrapper
      extractor.ts              extractResume(): string → ResumeData
      test.ts                   tsx smoke runner with .env auto-load
    db/
      client.ts                 Lazy Supabase singleton (service role)
      slugify.ts                generateUniqueSlug(name) — DB-aware dedup
      portfolios.ts             savePortfolio / getPortfolioBySlug
```

---

## API contract

### `POST /api/parse`

```jsonc
// Request
{ "resumeText": "<plain text resume, >= 50 chars>" }
```

```jsonc
// 200 OK
{
  "slug": "jane-cooper",
  "url":  "http://localhost:3000/jane-cooper",
  "data": { /* ResumeData */ }
}
```

| Status | Reason                                       |
| -----: | -------------------------------------------- |
|    400 | Body not JSON, or `resumeText` < 50 chars    |
|    500 | LLM failure, DB failure, or schema mismatch  |

### `GET /api/portfolio/[slug]`

Returns the row or 404. Increments `views` fire-and-forget.

```jsonc
{
  "id": "uuid",
  "slug": "jane-cooper",
  "name": "Jane Cooper",
  "data": { /* ResumeData */ },
  "views": 12,
  "created_at": "2026-05-27T09:52:02.500Z"
}
```

### `POST /api/export`

`501` — placeholder for v2 PDF export.

---

## ResumeData shape

```ts
type ResumeData = {
  name: string;
  title: string;
  summary: string;
  skills: string[];
  experience: { company; role; duration; points: string[] }[];
  education:  { institution; degree; year? }[];
  projects:   { name; description; url? }[];
  contact:    { email?; linkedin?; github?; website? };
};
```

Source of truth: `src/lib/ai/schema.ts`.

---

## Deployment

Vercel is the path of least resistance — Next.js 16 RSC + Node runtime works
out of the box.

```bash
# Push to GitHub first
gh repo create pastecv --public --source=. --remote=origin --push

# Then in Vercel dashboard:
# 1. Import the repo
# 2. Add the four env vars above
# 3. Deploy
# 4. After first deploy, update NEXT_PUBLIC_BASE_URL to the *.vercel.app URL
#    and redeploy
```

Self-hosting works too — it's a stock Node Next.js app:

```bash
npm ci
npm run build
npm run start
```

---

## Design notes

The portfolio aesthetic deliberately rejects the "white background, gray text"
default that the phase 3 spec called for. Goal was Linear/Vercel/Raycast
territory: pure black canvas, one accent color (lime `#cdff5b`), glass surfaces,
line-grid background, restrained typography. Inter for UI, JetBrains Mono for
identifiers, IBM Plex Serif italic only for headline highlights.

Animation budget: `rise` keyframes with `cubic-bezier(0.16, 1, 0.3, 1)`,
staggered 80 ms per section. No scroll-jacking, no parallax, no autoplay.

---

## Why Groq, not OpenAI/Gemini

- ~5–10× lower latency than Gemini Flash on equivalent JSON-extraction prompts
- Native `response_format: { type: "json_object" }` — no markdown-fence cleanup
- Generous free tier (~14k req/day on Llama 3.3 70B)
- OpenAI-compatible chat surface — provider swap is a one-line change

Trade-off: Groq's free tier rate-limits at ~30 req/min. For anything beyond
personal traffic, add a queue or move to a paid tier.

---

## Roadmap

Not in v1:

- PDF / DOCX upload (route, `pdf-parse` + `mammoth` on the server)
- Auth via Supabase (Google + magic link)
- Per-user dashboard with edit / delete / regenerate
- PDF export (`/api/export` currently 501)
- Multiple themes
- Rate limiting / abuse controls
- OG image generation per portfolio

---

## License

MIT. See [LICENSE](LICENSE) if/when added.
