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
