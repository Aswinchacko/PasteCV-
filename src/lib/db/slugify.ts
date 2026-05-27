import { getSupabase } from "./client";

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);
}

export async function generateUniqueSlug(name: string): Promise<string> {
	const base = toSlug(name) || "portfolio";

	const { data, error } = await getSupabase()
		.from("portfolios")
		.select("slug")
		.like("slug", `${base}%`);

	if (error) throw new Error(`Slug lookup failed: ${error.message}`);

	const existing = new Set((data ?? []).map((r) => r.slug as string));
	if (!existing.has(base)) return base;

	let i = 2;
	while (existing.has(`${base}-${i}`)) i++;
	return `${base}-${i}`;
}
