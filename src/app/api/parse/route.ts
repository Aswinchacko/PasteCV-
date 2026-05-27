import { type NextRequest, NextResponse } from "next/server";
import { extractResume } from "@/lib/ai/extractor";
import { savePortfolio } from "@/lib/db/portfolios";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
		return NextResponse.json(
			{ error: "Request body must be valid JSON" },
			{ status: 400 },
		);
	}

	const resumeText =
		typeof (body as { resumeText?: unknown })?.resumeText === "string"
			? ((body as { resumeText: string }).resumeText as string)
			: "";

	if (!resumeText || resumeText.trim().length < 50) {
		return NextResponse.json(
			{ error: "Resume text is too short (min 50 characters)" },
			{ status: 400 },
		);
	}

	try {
		const resumeData = await extractResume(resumeText);
		const slug = await savePortfolio(resumeData, user.id);
		const base =
			process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
			"http://localhost:3000";
		const url = `${base}/${slug}`;

		return NextResponse.json({ slug, url, data: resumeData });
	} catch (err) {
		console.error("/api/parse error:", err);
		return NextResponse.json(
			{ error: "Failed to parse resume" },
			{ status: 500 },
		);
	}
}
