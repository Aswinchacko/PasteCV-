import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth + magic-link landing.
 * Supabase appends `?code=...` after the provider redirect; we exchange it for
 * a session cookie and then bounce to `?next=...` (defaults to `/`).
 */
export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	const next = url.searchParams.get("next") ?? "/";
	const base = `${url.protocol}//${url.host}`;
	const safeNext = next.startsWith("/") ? next : "/";

	if (!code) {
		return NextResponse.redirect(`${base}/login?error=missing_code`);
	}

	const sb = await getSupabaseServer();
	const { error } = await sb.auth.exchangeCodeForSession(code);
	if (error) {
		console.error("auth callback exchange failed:", error.message);
		return NextResponse.redirect(
			`${base}/login?error=${encodeURIComponent(error.message)}`,
		);
	}

	return NextResponse.redirect(`${base}${safeNext}`);
}
