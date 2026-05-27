# PasteCV

Paste a resume. Get a clean, shareable portfolio link. Edit it inline. Pick a
template. Done.

PasteCV converts arbitrary resume text into structured JSON via an LLM, persists
it to Postgres scoped to your account, and serves a server-rendered portfolio at
`/[slug]`. You can switch between three visual templates and click-to-edit any
field if you own the portfolio.

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... # anon/public key (used by auth)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...    # service_role, NOT anon
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # set to your deployed URL in prod
```

Optional:

```env
GROQ_MODEL=llama-3.1-8b-instant            # override default Llama 3.3 70B
```

### Database

Run [`supabase/migrations/001_owner_template_rls.sql`](./supabase/migrations/001_owner_template_rls.sql)
once in the Supabase SQL Editor. It will:

- drop the legacy `portfolios` table (phase 4 wipes pre-auth data — there's no
  ownership info to back-fill)
- recreate it with `owner_id`, `template`, `updated_at` and an `updated_at`
  trigger
- enable Row Level Security with policies: public `select`, owner-only
  `insert/update/delete`
- ensure the `admin_config` singleton table from phase 3 still exists

### Auth setup

PasteCV uses Supabase Auth. After applying the migration:

1. In the Supabase dashboard → **Authentication → Providers**:
   - **Email**: enable email/password sign-in. (Optional: turn off "Confirm
     email" while developing locally so signups don't require an inbox round-trip.)
   - **Google**: enable, paste your Google OAuth client ID + secret, and add
     `https://<your-project>.supabase.co/auth/v1/callback` as an Authorized
     redirect URI in the Google Cloud Console.
2. In **Authentication → URL Configuration**, set the **Site URL** to your
   `NEXT_PUBLIC_BASE_URL`. Add `http://localhost:3000` to the additional
   redirect URLs while developing.

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
    (auth)/
      layout.tsx                Auth chrome (redirects authed users home)
      login/page.tsx
      signup/page.tsx
    api/
      parse/route.ts            POST  → extract + persist + return { slug, url, data } (auth-gated)
      portfolio/[slug]/route.ts GET/PATCH/DELETE row, increment views
      auth/signout/route.ts     POST  → clear Supabase session cookie
      admin/*                   Super-admin dashboard (legacy phase 3)
    auth/callback/route.ts      OAuth + magic-link landing
    [slug]/page.tsx             RSC portfolio (delegates to PortfolioRenderer)
    dashboard/page.tsx          Per-user portfolio dashboard
    page.tsx                    Landing
    layout.tsx
    globals.css
  components/
    auth/
      AuthForm.tsx              Shared login/signup form (Google + email)
      AuthNav.tsx                "Sign in / up" CTA or <UserMenu/> if authed
      UserMenu.tsx
    landing/ResumeInput.tsx
    portfolio/
      PortfolioRenderer.tsx     Picks template, mounts <EditorProvider/>
      editor/
        EditorProvider.tsx      Context: data, template, autosave, dirty
        EditableText.tsx        Click-to-edit text primitive
        EditToolbar.tsx         Floating dock: edit, template, copy link
        ListControls.tsx        Reusable add / move / delete buttons
      templates/
        LinearDark.tsx          Dark + lime, the original aesthetic
        PaperLight.tsx          White, serif, print-clean
        TerminalMono.tsx        green-on-black, mono, ASCII dividers
      Hero.tsx, SkillsGrid.tsx, ExperienceList.tsx,
      ProjectCards.tsx, EducationList.tsx, SectionHeading.tsx,
      ShareBar.tsx              ← static phase-1 versions, kept for reference
    ui/
      Button.tsx, Badge.tsx, Wordmark.tsx
  lib/
    ai/
      schema.ts, prompt.ts, client.ts, extractor.ts, test.ts
    auth/
      client.ts                 Browser Supabase client (anon key)
      server.ts                 SSR Supabase client (cookies)
      session.ts                getCurrentUser() / requireUser()
    db/
      client.ts                 Service-role Supabase (RLS bypass)
      slugify.ts
      portfolios.ts             save / list / update / delete (owner-scoped)
    admin/auth.ts               Legacy phase 3 super-admin password
supabase/migrations/001_owner_template_rls.sql
```

---

## API contract

### `POST /api/parse` *(auth required)*

```jsonc
// Request — must be made by a signed-in user (cookie-based session)
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
|    401 | No active Supabase session                   |
|    500 | LLM failure, DB failure, or schema mismatch  |

### `PATCH /api/portfolio/[slug]` *(owner required)*

```jsonc
// Request — any subset
{
  "data": { /* full ResumeData; validated via Zod */ },
  "template": "linear-dark" | "paper-light" | "terminal-mono"
}
```

Returns the updated row on success. `401` if unauthenticated, `404` if the slug
doesn't exist or you aren't the owner.

### `DELETE /api/portfolio/[slug]` *(owner required)*

Removes the portfolio. `404` if not yours.

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

Shipped in phase 4:

- Supabase Auth (email/password + Google OAuth)
- Per-user `/dashboard`
- Inline edit-in-place on the portfolio page (owner-only)
- Three templates: `linear-dark`, `paper-light`, `terminal-mono`
- Owner-only template switcher

Not yet:

- PDF / DOCX upload (route, `pdf-parse` + `mammoth` on the server)
- PDF export (`/api/export` currently 501)
- AI-assisted "rewrite this bullet" inline action
- Rate limiting / abuse controls
- OG image generation per portfolio

---

## License

MIT. See [LICENSE](LICENSE) if/when added.
