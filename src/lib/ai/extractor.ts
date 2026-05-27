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
