import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/auth/server";

export const runtime = "nodejs";

export async function POST() {
	const sb = await getSupabaseServer();
	await sb.auth.signOut();
	return NextResponse.json({ ok: true });
}
