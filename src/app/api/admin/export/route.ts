import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin/auth";
import { listPortfoliosFull } from "@/lib/db/portfolios";

export const runtime = "nodejs";

const RANGE_MS: Record<string, number> = {
	"24h": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
	"30d": 30 * 24 * 60 * 60 * 1000,
};

function csvEscape(value: unknown): string {
	if (value === null || value === undefined) return "";
	const s = String(value);
	if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
	return s;
}

export async function GET(req: NextRequest) {
	if (!(await isAdminAuthed())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const range = searchParams.get("range") ?? "all";
	const q = (searchParams.get("q") ?? "").toLowerCase().trim();

	try {
		const rows = await listPortfoliosFull();

		const cutoff = RANGE_MS[range] ? Date.now() - RANGE_MS[range] : 0;

		const filtered = rows.filter((r) => {
			if (cutoff && new Date(r.created_at).getTime() < cutoff) return false;
			if (!q) return true;
			const hay = [
				r.name,
				r.slug,
				r.data?.title ?? "",
				r.data?.contact?.email ?? "",
				...(r.data?.skills ?? []),
			]
				.join(" ")
				.toLowerCase();
			return hay.includes(q);
		});

		const header = [
			"id",
			"slug",
			"name",
			"title",
			"email",
			"linkedin",
			"github",
			"website",
			"views",
			"skills",
			"created_at",
			"public_url",
		];

		const origin = req.nextUrl.origin;

		const lines = [header.join(",")];
		for (const r of filtered) {
			lines.push(
				[
					r.id,
					r.slug,
					r.name,
					r.data?.title ?? "",
					r.data?.contact?.email ?? "",
					r.data?.contact?.linkedin ?? "",
					r.data?.contact?.github ?? "",
					r.data?.contact?.website ?? "",
					r.views ?? 0,
					(r.data?.skills ?? []).join("; "),
					r.created_at,
					`${origin}/${r.slug}`,
				]
					.map(csvEscape)
					.join(","),
			);
		}

		const csv = lines.join("\n");
		const ts = new Date().toISOString().replace(/[:.]/g, "-");

		return new NextResponse(csv, {
			status: 200,
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="pastecv-portfolios-${ts}.csv"`,
			},
		});
	} catch (err) {
		console.error("admin export error:", err);
		return NextResponse.json({ error: "Export failed" }, { status: 500 });
	}
}
