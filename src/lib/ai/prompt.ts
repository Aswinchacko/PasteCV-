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
