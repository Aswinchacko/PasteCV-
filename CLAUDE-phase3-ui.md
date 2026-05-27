# CLAUDE.md — Phase 3: UI & Frontend

## What this phase does
Build the two screens of PasteCV:
1. **Landing page** — user pastes resume, clicks submit, gets redirected to their portfolio
2. **Portfolio page** — the live, shareable page at `/[slug]`

By the end of this phase, the full user flow works end to end and can be
deployed to Vercel.

---

## Pre-conditions
- Phase 1 done: `extractResume()` works
- Phase 2 done: `POST /api/parse` and `GET /api/portfolio/[slug]` work
- Supabase table has real rows in it

---

## Project context
**App:** PasteCV — resume text → shareable portfolio page at `/[slug]`.
**Stack:** Next.js 14 (app router), TypeScript, Tailwind CSS.
**This phase owns:** `/src/app/page.tsx`, `/src/app/[slug]/page.tsx`,
`/src/components/`

---

## Folder structure for this phase

```
src/
  app/
    page.tsx                    ← Landing page (input form)
    [slug]/
      page.tsx                  ← Portfolio page (SSR from Supabase)
    layout.tsx                  ← Root layout (fonts, metadata)
    globals.css                 ← Tailwind base styles
  components/
    landing/
      ResumeInput.tsx           ← Textarea + submit button + loading state
      DropZone.tsx              ← PDF drag-and-drop (optional, add last)
    portfolio/
      Hero.tsx                  ← Name, title, summary, contact links
      SkillsGrid.tsx            ← Pill list of skills
      ExperienceList.tsx        ← Timeline of jobs
      ProjectCards.tsx          ← Cards for projects
      ShareBar.tsx              ← Copy link button + view count
    ui/
      Button.tsx                ← Reusable button with loading spinner
      Badge.tsx                 ← Skill pill / tag
```

---

## Landing page (app/page.tsx)

### What it contains
- App name + tagline: "Paste your resume. Get a portfolio page."
- A large `<textarea>` for resume text
- A submit button that says "Generate my portfolio →"
- Loading state: spinner + "Parsing your resume..."
- On success: redirect to `/{slug}`
- On error: show inline error message

### Key behaviour
```ts
async function handleSubmit() {
  setLoading(true);
  const res = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText }),
  });
  const json = await res.json();
  if (!res.ok) { setError(json.error); setLoading(false); return; }
  router.push(`/${json.slug}`);
}
```

### Design rules for landing page
- White or very light gray background
- Centered layout, max-width 720px
- Textarea: minimum 280px tall, monospace font, large enough to paste a full resume
- Button: full width below the textarea
- No navbar, no footer — just the core input
- Keep it dead simple. This is not the showcase; the portfolio page is.

---

## Portfolio page (app/[slug]/page.tsx)

### This is a Server Component (SSR)

```ts
import { getPortfolioBySlug } from "@/lib/db/portfolios";
import { notFound } from "next/navigation";

export default async function PortfolioPage({
  params,
}: {
  params: { slug: string };
}) {
  const portfolio = await getPortfolioBySlug(params.slug);
  if (!portfolio) notFound();

  const data = portfolio.data; // ResumeData JSON from Supabase

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      <Hero data={data} />
      <SkillsGrid skills={data.skills} />
      <ExperienceList experience={data.experience} />
      <ProjectCards projects={data.projects} />
      <ShareBar slug={params.slug} views={portfolio.views} />
    </main>
  );
}
```

### OG meta tags — add for social sharing
```ts
export async function generateMetadata({ params }) {
  const portfolio = await getPortfolioBySlug(params.slug);
  if (!portfolio) return {};
  return {
    title: `${portfolio.name} — Portfolio`,
    description: portfolio.data.summary,
    openGraph: {
      title: `${portfolio.name} — Portfolio`,
      description: portfolio.data.summary,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${params.slug}`,
    },
  };
}
```

---

## Component specs

### Hero.tsx
Props: `{ data: ResumeData }`
Renders:
- Name (h1, large, bold)
- Title (h2, muted)
- Summary paragraph
- Contact row: email, LinkedIn, GitHub, website as icon links
- Keep it to 3 lines max vertically

### SkillsGrid.tsx
Props: `{ skills: string[] }`
Renders:
- Section heading "Skills"
- Each skill as a rounded pill/badge (Tailwind: `bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm`)
- Wrap them in a flex-wrap row

### ExperienceList.tsx
Props: `{ experience: ExperienceData[] }`
Renders:
- Section heading "Experience"
- For each job: company name (bold), role + duration (muted), bullet points as a `<ul>`
- Simple left-border timeline style (Tailwind: `border-l-2 border-gray-200 pl-4`)

### ProjectCards.tsx
Props: `{ projects: ProjectData[] }`
Renders:
- Section heading "Projects"
- Each project as a card: name (bold), description, optional URL as "View →" link
- Tailwind card: `border rounded-lg p-4 hover:shadow-md transition`

### ShareBar.tsx
Props: `{ slug: string, views: number }`
Renders:
- Full share URL in a read-only input field
- "Copy link" button — uses `navigator.clipboard.writeText()`
- View count: "Viewed X times"
- Sticky at the bottom or placed at the end of the page

---

## Root layout (app/layout.tsx)

```ts
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PasteCV — Instant Portfolio from Your Resume",
  description: "Paste your resume, get a shareable portfolio page in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## PDF upload (DropZone.tsx — add AFTER core flow works)

Only build this after the text paste flow works end to end.

```ts
// When a PDF is dropped, send it to /api/parse as FormData
// Server side: use pdf-parse to extract text, then pass to extractResume()
// Install: npm install pdf-parse
```

Keep this as a stretch goal. The paste flow ships first.

---

## Tailwind design tokens to stay consistent

```
Text sizes:    text-4xl (name), text-xl (title), text-base (body), text-sm (meta)
Colors:        text-gray-900, text-gray-500, text-gray-400, bg-gray-50
Spacing:       py-16 page top/bottom, space-y-12 between sections
Max width:     max-w-3xl mx-auto
Borders:       border-gray-200
```

Stick to these. Don't introduce any color palette — just gray scale for v1.

---

## Vercel deployment checklist

```
1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Add all env vars in Vercel → Settings → Environment Variables:
   - GEMINI_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_BASE_URL   ← set to your Vercel URL
4. Deploy
5. Test the full flow on the live URL
6. Share the link
```

---

## Definition of done for Phase 3

- [ ] Landing page loads at `/`
- [ ] Pasting a resume and clicking submit calls `/api/parse`
- [ ] Loading spinner shows while parsing
- [ ] On success, user is redirected to `/{slug}`
- [ ] Portfolio page renders all sections: Hero, Skills, Experience, Projects
- [ ] "Copy link" button works
- [ ] Page has correct OG title and description (check with https://opengraph.xyz)
- [ ] Deployed to Vercel and working on the live domain

---

## What NOT to build in this phase (save for v2)

- No auth or user accounts
- No editing the portfolio after creation
- No multiple themes
- No PDF export
- No payments
- No dashboard

Ship the core loop. One input, one output, one shareable URL.
