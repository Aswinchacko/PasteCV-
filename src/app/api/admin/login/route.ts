import { type NextRequest, NextResponse } from "next/server";
import {
	ADMIN_COOKIE,
	deriveSessionToken,
	getStoredHash,
	hashPassword,
	setStoredHash,
	verifyHashed,
	verifyUsername,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

interface LoginBody {
	username?: string;
	password?: string;
	confirmPassword?: string;
}

function setSessionCookie(res: NextResponse, hash: string) {
	res.cookies.set(ADMIN_COOKIE, deriveSessionToken(hash), {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});
}

export async function POST(req: NextRequest) {
	let body: LoginBody;
	try {
		body = (await req.json()) as LoginBody;
	} catch {
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}

	const password = (body.password ?? "").trim();
	const username = (body.username ?? "").trim();
	const confirmPassword = (body.confirmPassword ?? "").trim();

	try {
		const existingHash = await getStoredHash();

		// --- First-time setup ---------------------------------------------------
		if (!existingHash) {
			if (password.length < 8) {
				return NextResponse.json(
					{ error: "Password must be at least 8 characters" },
					{ status: 400 },
				);
			}
			if (password !== confirmPassword) {
				return NextResponse.json(
					{ error: "Passwords do not match" },
					{ status: 400 },
				);
			}

			const hash = await hashPassword(password);
			await setStoredHash(hash);

			const res = NextResponse.json({ ok: true, mode: "setup" });
			setSessionCookie(res, hash);
			return res;
		}

		// --- Normal login -------------------------------------------------------
		if (!username || !password) {
			return NextResponse.json(
				{ error: "Username and password are required" },
				{ status: 400 },
			);
		}

		const userOk = verifyUsername(username);
		const passOk = await verifyHashed(password, existingHash);

		if (!userOk || !passOk) {
			return NextResponse.json(
				{ error: "Invalid username or password" },
				{ status: 401 },
			);
		}

		const res = NextResponse.json({ ok: true, mode: "login" });
		setSessionCookie(res, existingHash);
		return res;
	} catch (err) {
		console.error("admin login error:", err);
		return NextResponse.json(
			{ error: (err as Error).message ?? "Login failed" },
			{ status: 500 },
		);
	}
}
