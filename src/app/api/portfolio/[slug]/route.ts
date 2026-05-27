import { type NextRequest, NextResponse } from "next/server";
import { ResumeDataSchema } from "@/lib/ai/schema";
import {
	getPortfolioBySlug,
	isTemplateId,
	updatePortfolioByOwner,
} from "@/lib/db/portfolios";
import { getCurrentUser } from "@/lib/auth/session";
import { getSupabase } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
	params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
	const { slug } = await ctx.params;
	const portfolio = await getPortfolioBySlug(slug);
	if (!portfolio) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	return NextResponse.json(portfolio);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
	const { slug } = await ctx.params;

	const user = await getCurrentUser();
	if (!user) {
		return NextResponse.json(
			{ error: "Authentication required", code: "auth_required" },
			{ status: 401 },
		);
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const patch = body as {
		data?: unknown;
		template?: unknown;
	};

	const update: Parameters<typeof updatePortfolioByOwner>[2] = {};

	if (patch.data !== undefined) {
		const parsed = ResumeDataSchema.safeParse(patch.data);
		if (!parsed.success) {
			return NextResponse.json(
				{
					error: "Invalid resume data",
					issues: parsed.error.issues.slice(0, 5),
				},
				{ status: 400 },
			);
		}
		update.data = parsed.data;
	}

	if (patch.template !== undefined) {
		if (!isTemplateId(patch.template)) {
			return NextResponse.json(
				{ error: "Invalid template id" },
				{ status: 400 },
			);
		}
		update.template = patch.template;
	}

	if (Object.keys(update).length === 0) {
		return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
	}

	try {
		const row = await updatePortfolioByOwner(slug, user.id, update);
		if (!row) {
			return NextResponse.json(
				{ error: "Portfolio not found or you don't own it" },
				{ status: 404 },
			);
		}
		return NextResponse.json({ ok: true, portfolio: row });
	} catch (err) {
		console.error("PATCH /api/portfolio/[slug] error:", err);
		return NextResponse.json({ error: "Update failed" }, { status: 500 });
	}
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
	const { slug } = await ctx.params;
	const user = await getCurrentUser();
	if (!user) {
		return NextResponse.json({ error: "Auth required" }, { status: 401 });
	}

	const { error, count } = await getSupabase()
		.from("portfolios")
		.delete({ count: "exact" })
		.eq("slug", slug)
		.eq("owner_id", user.id);

	if (error) {
		console.error("DELETE portfolio error:", error.message);
		return NextResponse.json({ error: "Delete failed" }, { status: 500 });
	}
	if ((count ?? 0) === 0) {
		return NextResponse.json(
			{ error: "Not found or not yours" },
			{ status: 404 },
		);
	}

	return NextResponse.json({ ok: true });
}
