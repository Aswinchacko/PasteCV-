import type { ResumeData } from "@/lib/ai/schema";
import { getSupabase } from "./client";
import { generateUniqueSlug } from "./slugify";

export interface PortfolioRow {
	id: string;
	slug: string;
	name: string;
	data: ResumeData;
	views: number;
	created_at: string;
}

export async function savePortfolio(data: ResumeData): Promise<string> {
	const slug = await generateUniqueSlug(data.name);

	const { error } = await getSupabase().from("portfolios").insert({
		slug,
		name: data.name,
		data,
	});

	if (error) throw new Error(`DB insert failed: ${error.message}`);
	return slug;
}

export async function getPortfolioBySlug(
	slug: string,
): Promise<PortfolioRow | null> {
	const sb = getSupabase();

	const { data, error } = await sb
		.from("portfolios")
		.select("*")
		.eq("slug", slug)
		.maybeSingle();

	if (error || !data) return null;

	const row = data as PortfolioRow;

	// Fire-and-forget view increment; don't block the response on it.
	void sb
		.from("portfolios")
		.update({ views: (row.views ?? 0) + 1 })
		.eq("slug", slug)
		.then(({ error: updateError }) => {
			if (updateError) {
				console.error(
					`Failed to increment views for ${slug}:`,
					updateError.message,
				);
			}
		});

	return row;
}
