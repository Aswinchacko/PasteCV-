# CLAUDE.md — Phase 1: AI Extraction & Groq API

## What this phase does
Build and test the core AI brain of PasteCV. By the end of this phase, you can
paste a resume string into a test script and get back a clean, validated JSON
object. Nothing else. No UI, no DB, no routes.

---

## Project context
**App:** PasteCV — converts pasted resume text (or PDF) into a shareable
portfolio page at `/[slug]`.
**Stack:** Next.js 14 (app router), TypeScript, Tailwind, Supabase, Vercel.
**AI provider:** Groq (`llama-3.3-70b-versatile` by default) via the OpenAI-compatible REST API.
**This phase owns:** `/src/lib/ai/`

---

## Folder structure for this phase

```
src/
  lib/
    ai/
      client.ts       ← Groq API caller (fetch wrapper)
      prompt.ts       ← System prompt + user prompt builder
      schema.ts       ← Zod schema for the extracted resume JSON
      extractor.ts    ← Main function: string → ResumeData
      test.ts         ← Quick local test script (ts-node / tsx)
.env (or .env.local)
  GROQ_API_KEY=your_key_here
  # Optional override; defaults to llama-3.3-70b-versatile
  # GROQ_MODEL=llama-3.1-8b-instant
```

Get a free key at https://console.groq.com/keys.

---

## The ResumeData schema (Zod — define in schema.ts)

```ts
import { z } from "zod";

export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  points: z.array(z.string()),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().optional(),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string().optional(),
});

export const ContactSchema = z.object({
  email: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
});

export const ResumeDataSchema = z.object({
  name: z.string(),
  title: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  projects: z.array(ProjectSchema),
  contact: ContactSchema,
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;
```

---

## The Groq prompt (define in prompt.ts)

```ts
export const SYSTEM_PROMPT = `
You are a resume parser. Your only job is to extract structured data from
resume text and return it as valid JSON.

Rules:
- Return ONLY a raw JSON object. No markdown. No backticks. No explanation.
- If a field is missing from the resume, use an empty string or empty array.
- Do not invent data. Only extract what is present.
- Keep bullet points concise — max 12 words each.
- The "title" field is the person's current or most recent job title.
- The "summary" is 2–3 sentences max.
`.trim();

export function buildUserPrompt(resumeText: string): string {
  return `
Extract data from this resume and return JSON matching this exact shape:
{
  "name": string,
  "title": string,
  "summary": string,
  "skills": string[],
  "experience": [{ "company": string, "role": string, "duration": string, "points": string[] }],
  "education": [{ "institution": string, "degree": string, "year": string }],
  "projects": [{ "name": string, "description": string, "url": string }],
  "contact": { "email": string, "linkedin": string, "github": string, "website": string }
}

Resume:
${resumeText}
`.trim();
}
```

---

## The Groq API caller (define in client.ts)

Groq exposes an OpenAI-compatible chat completions endpoint. We enable
`response_format: { type: "json_object" }` so the model is forced to emit valid
JSON (no markdown fences to strip).

```ts
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? "";
}
```

---

## The main extractor function (define in extractor.ts)

```ts
import { callGroq } from "./client";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { ResumeDataSchema, type ResumeData } from "./schema";

export async function extractResume(resumeText: string): Promise<ResumeData> {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty");
  }

  const raw = await callGroq(SYSTEM_PROMPT, buildUserPrompt(resumeText));

  if (!raw.trim()) {
    throw new Error("Groq returned an empty response");
  }

  // Defensive: strip markdown fences if the model ever ignores response_format
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Groq returned invalid JSON:\n${clean}`);
  }

  const result = ResumeDataSchema.safeParse(parsed);
  if (!result.success) {
    console.error("Schema validation failed:", result.error.format());
    throw new Error("Extracted data did not match expected schema");
  }

  return result.data;
}
```

---

## Test script (test.ts — run with: npx tsx src/lib/ai/test.ts)

`test.ts` auto-loads `.env` and `.env.local` from the project root (in that
order; `.env.local` wins), so you don't need an extra dotenv dependency.

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractResume } from "./extractor";

function loadEnvFile(fileName: string): void {
  try {
    const envPath = resolve(process.cwd(), fileName);
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // Env files are optional; rely on the shell env if they're missing.
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const SAMPLE_RESUME = `
John Doe
Software Engineer | john@example.com | github.com/johndoe

Summary:
Full-stack developer with 4 years of experience building web apps with React and Node.

Experience:
Acme Corp — Senior Frontend Engineer (2022–Present)
- Built reusable component library used by 5 teams
- Reduced bundle size by 40% through code splitting

StartupXYZ — Full Stack Developer (2020–2022)
- Developed REST APIs with Node.js and PostgreSQL
- Shipped mobile-responsive React app from scratch

Education:
B.Tech Computer Science — NIT Calicut, 2020

Skills: React, Node.js, TypeScript, PostgreSQL, Docker, AWS

Projects:
DevBoard — developer portfolio generator
https://devboard.app
Lets developers paste their resume and get a live portfolio page.
`.trim();

const SPARSE_RESUME = `
Jane Smith
jane@example.com

Worked at Foo Inc 2023-present as a designer.
`.trim();

async function runCase(label: string, text: string): Promise<void> {
  console.log(`\n=== ${label} ===`);
  try {
    const result = await extractResume(text);
    console.log("✓ Extraction successful:\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("✗ Extraction failed:", err);
  }
}

async function main(): Promise<void> {
  console.log("Testing Groq extraction...");
  await runCase("Dense resume (John Doe)", SAMPLE_RESUME);
  await runCase("Sparse resume (Jane Smith)", SPARSE_RESUME);

  console.log("\n=== Empty input (should throw cleanly) ===");
  try {
    await extractResume("");
    console.error("✗ Expected an error for empty input but got none");
  } catch (err) {
    console.log("✓ Threw as expected:", (err as Error).message);
  }
}

main();
```

---

## Dependencies to install

```bash
npm install zod
npm install -D tsx typescript @types/node
```

---

## Definition of done for Phase 1

- [x] `npx tsx src/lib/ai/test.ts` runs without errors
- [x] Output JSON passes Zod validation with no warnings
- [x] All 8 top-level keys are present in the output
- [x] Tested with at least 2 different resume formats (one dense, one sparse)
- [x] Handles a bad/empty resume input without crashing (throws a clean error)

---

## Why Groq instead of Gemini

- Free tier is generous (~30 req/min on `llama-3.3-70b-versatile`).
- LPU-backed inference is typically 5–10× faster than Gemini Flash.
- Native `response_format: { type: "json_object" }` enforces valid JSON
  server-side, eliminating the "model wrapped output in ```json fences" failure
  mode entirely.
- OpenAI-compatible API surface, so swapping to OpenAI / Together / any
  OpenAI-compatible provider later is a one-line change.

If you ever need to swap models, set `GROQ_MODEL` in `.env`. Smaller/faster
alternative: `llama-3.1-8b-instant`. See the current list at
https://console.groq.com/docs/models.

---

## What NOT to build in this phase

- No API routes yet
- No Next.js pages
- No Supabase connection
- No PDF parsing (just plain text for now)

Keep it isolated. Test it. Only then move to Phase 2.
