import { type NextRequest, NextResponse } from "next/server";
import {
	ADMIN_COOKIE,
	deriveSessionToken,
	getStoredHash,
	hashPassword,
	isAdminAuthed,
	setStoredHash,
	verifyHashed,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

interface Body {
	current?: string;
	next?: string;
}

export async function POST(req: NextRequest) {
	if (!(await isAdminAuthed())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: Body;
	try {
		body = (await req.json()) as Body;
	} catch {
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}

	const current = (body.current ?? "").trim();
	const next = (body.next ?? "").trim();

	if (!current || !next) {
		return NextResponse.json(
			{ error: "Current and new password are required" },
			{ status: 400 },
		);
	}

	if (next.length < 8) {
		return NextResponse.json(
			{ error: "New password must be at least 8 characters" },
			{ status: 400 },
		);
	}

	try {
		const existing = await getStoredHash();
		if (!existing) {
			return NextResponse.json(
				{ error: "Admin is not configured" },
				{ status: 500 },
			);
		}

		const ok = await verifyHashed(current, existing);
		if (!ok) {
			return NextResponse.json(
				{ error: "Current password is incorrect" },
				{ status: 401 },
			);
		}

		const newHash = await hashPassword(next);
		await setStoredHash(newHash);

		const res = NextResponse.json({ ok: true });
		res.cookies.set(ADMIN_COOKIE, deriveSessionToken(newHash), {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});
		return res;
	} catch (err) {
		console.error("admin change password error:", err);
		return NextResponse.json(
			{ error: "Failed to update password" },
			{ status: 500 },
		);
	}
}
