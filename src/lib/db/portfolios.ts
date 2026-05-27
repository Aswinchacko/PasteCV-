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

export interface PortfolioSummary {
	id: string;
	slug: string;
	name: string;
	views: number;
	created_at: string;
	title: string | null;
	email: string | null;
}

export async function listPortfolios(): Promise<PortfolioSummary[]> {
	const { data, error } = await getSupabase()
		.from("portfolios")
		.select("id, slug, name, views, created_at, data")
		.order("created_at", { ascending: false });

	if (error) throw new Error(`DB list failed: ${error.message}`);

	return (data ?? []).map((row) => {
		const r = row as PortfolioRow;
		return {
			id: r.id,
			slug: r.slug,
			name: r.name,
			views: r.views ?? 0,
			created_at: r.created_at,
			title: r.data?.title ?? null,
			email: r.data?.contact?.email ?? null,
		};
	});
}

export async function listPortfoliosFull(): Promise<PortfolioRow[]> {
	const { data, error } = await getSupabase()
		.from("portfolios")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw new Error(`DB list failed: ${error.message}`);
	return (data ?? []) as PortfolioRow[];
}

export async function deletePortfolio(id: string): Promise<void> {
	const { error } = await getSupabase().from("portfolios").delete().eq("id", id);
	if (error) throw new Error(`DB delete failed: ${error.message}`);
}

export async function deletePortfolios(ids: string[]): Promise<void> {
	if (ids.length === 0) return;
	const { error } = await getSupabase()
		.from("portfolios")
		.delete()
		.in("id", ids);
	if (error) throw new Error(`DB bulk delete failed: ${error.message}`);
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
