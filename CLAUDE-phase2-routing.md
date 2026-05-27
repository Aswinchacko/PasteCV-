# CLAUDE.md — Phase 2: API Routes & Database

## What this phase does
Wire up the Next.js API routes and Supabase database. By the end of this phase,
you can POST a resume string to `/api/parse`, get back a slug, and fetch the
saved portfolio data from Supabase at `/api/portfolio/[slug]`.
No UI yet — test everything with curl or a REST client (Postman, Thunder Client).

---

## Pre-condition
Phase 1 must be complete. `extractResume()` must work and pass Zod validation.
This phase imports from `src/lib/ai/extractor.ts`.

---

## Project context
**App:** PasteCV — resume text → shareable portfolio page at `/[slug]`.
**Stack:** Next.js 14 (app router), TypeScript, Supabase (Postgres + Storage).
**This phase owns:** `/src/app/api/` and `/src/lib/db/`

---

## Folder structure for this phase

```
src/
  app/
    api/
      parse/
        route.ts        ← POST: accepts resume text, returns slug + data
      portfolio/
        [slug]/
          route.ts      ← GET: fetches portfolio by slug from Supabase
      export/
        route.ts        ← POST: PDF export (stub only — implement in v2)
  lib/
    db/
      client.ts         ← Supabase client singleton
      portfolios.ts     ← DB helpers: save, getBySlug, incrementViews
      slugify.ts        ← Generate a clean URL slug from person's name
```

---

## Environment variables (add to .env.local)

```
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Do NOT use the anon key for server-side writes. Use the service role key in API
routes only — never expose it to the client.

---

## Supabase table — run this SQL in your Supabase dashboard

```sql
create table portfolios (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  data        jsonb not null,
  views       integer default 0,
  created_at  timestamptz default now()
);

-- Allow public read
create policy "Public read"
  on portfolios for select
  using (true);

-- Index for fast slug lookup
create index on portfolios(slug);
```

---

## Supabase client singleton (lib/db/client.ts)

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## Slug generator (lib/db/slugify.ts)

```ts
import { supabase } from "./client";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

// If "john-doe" exists, try "john-doe-2", "john-doe-3", etc.
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = toSlug(name) || "portfolio";

  const { data } = await supabase
    .from("portfolios")
    .select("slug")
    .like("slug", `${base}%`);

  const existing = (data ?? []).map((r) => r.slug);
  if (!existing.includes(base)) return base;

  let i = 2;
  while (existing.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
```

---

## DB helpers (lib/db/portfolios.ts)

```ts
import { supabase } from "./client";
import { generateUniqueSlug } from "./slugify";
import type { ResumeData } from "../ai/schema";

export async function savePortfolio(data: ResumeData): Promise<string> {
  const slug = await generateUniqueSlug(data.name);

  const { error } = await supabase.from("portfolios").insert({
    slug,
    name: data.name,
    data,
  });

  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return slug;
}

export async function getPortfolioBySlug(slug: string) {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  // Fire-and-forget view count increment
  supabase
    .from("portfolios")
    .update({ views: data.views + 1 })
    .eq("slug", slug);

  return data;
}
```

---

## API route: POST /api/parse (app/api/parse/route.ts)

```ts
import { NextRequest, NextResponse } from "next/server";
import { extractResume } from "@/lib/ai/extractor";
import { savePortfolio } from "@/lib/db/portfolios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resumeText: string = body.resumeText ?? "";

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume text is too short" },
        { status: 400 }
      );
    }

    const resumeData = await extractResume(resumeText);
    const slug = await savePortfolio(resumeData);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`;

    return NextResponse.json({ slug, url, data: resumeData });
  } catch (err: unknown) {
    console.error("/api/parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}
```

---

## API route: GET /api/portfolio/[slug] (app/api/portfolio/[slug]/route.ts)

```ts
import { NextRequest, NextResponse } from "next/server";
import { getPortfolioBySlug } from "@/lib/db/portfolios";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const portfolio = await getPortfolioBySlug(params.slug);

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  return NextResponse.json(portfolio);
}
```

---

## API route: POST /api/export (stub — app/api/export/route.ts)

```ts
import { NextResponse } from "next/server";

// v2 — PDF export via Puppeteer or html2pdf
export async function POST() {
  return NextResponse.json(
    { error: "PDF export coming soon" },
    { status: 501 }
  );
}
```

---

## Dependencies to install

```bash
npm install @supabase/supabase-js
```

---

## How to test this phase (curl examples)

```bash
# Test parse endpoint
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "John Doe\nSoftware Engineer at Acme Corp\njohn@example.com\nSkills: React, Node.js"}'

# Expected response:
# { "slug": "john-doe", "url": "http://localhost:3000/john-doe", "data": { ... } }

# Test get endpoint
curl http://localhost:3000/api/portfolio/john-doe

# Expected response:
# { "id": "...", "slug": "john-doe", "name": "John Doe", "data": { ... } }
```

---

## Definition of done for Phase 2

- [ ] `POST /api/parse` returns `{ slug, url, data }` with a real Supabase row
- [ ] `GET /api/portfolio/[slug]` returns saved portfolio data
- [ ] Duplicate names get suffixed slugs (`john-doe`, `john-doe-2`)
- [ ] Short/empty resume text returns a 400 error cleanly
- [ ] Check Supabase dashboard — rows appear in the `portfolios` table
- [ ] Views counter increments on each GET

---

## What NOT to build in this phase

- No React pages or components
- No PDF parsing
- No auth or payments
- No PDF export (stub is enough)

Routes work, DB works, move to Phase 3.
