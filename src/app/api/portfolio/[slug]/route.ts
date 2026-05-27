import { type NextRequest, NextResponse } from "next/server";
import { getPortfolioBySlug } from "@/lib/db/portfolios";

export const runtime = "nodejs";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	try {
		const portfolio = await getPortfolioBySlug(slug);

		if (!portfolio) {
			return NextResponse.json(
				{ error: "Portfolio not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(portfolio);
	} catch (err) {
		console.error(`/api/portfolio/${slug} error:`, err);
		return NextResponse.json(
			{ error: "Failed to load portfolio" },
			{ status: 500 },
		);
	}
}
