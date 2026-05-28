import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin/auth";
import {
	getPreset,
	isMailerConfigured,
	renderPreset,
	sendAdminMail,
	type MailPresetId,
} from "@/lib/admin/mailer";
import { getSupabase } from "@/lib/db/client";

export const runtime = "nodejs";

interface RouteContext {
	params: Promise<{ id: string }>;
}

interface PreviewPayload {
	mode: "preview";
	presetId: MailPresetId;
}

interface SendPayload {
	mode: "send";
	subject: string;
	body: string;
	replyTo?: string;
}

type Payload = PreviewPayload | SendPayload;

async function loadUser(id: string) {
	const sb = getSupabase();
	const { data, error } = await sb.auth.admin.getUserById(id);
	if (error) throw new Error(error.message);
	return data.user;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
	if (!(await isAdminAuthed())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await ctx.params;
	let body: Payload;
	try {
		body = (await req.json()) as Payload;
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	let user;
	try {
		user = await loadUser(id);
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "User load failed" },
			{ status: 404 },
		);
	}

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}
	if (!user.email) {
		return NextResponse.json(
			{ error: "User has no email address" },
			{ status: 400 },
		);
	}

	const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
	const recipientName =
		(meta.full_name as string | undefined) ??
		(meta.name as string | undefined) ??
		(user.email ? user.email.split("@")[0] : "there");

	if (body.mode === "preview") {
		const preset = getPreset(body.presetId);
		const rendered = renderPreset(preset.id, recipientName);
		return NextResponse.json({
			subject: rendered.subject,
			body: rendered.body,
			recipient: {
				email: user.email,
				name: recipientName,
			},
			mailerConfigured: isMailerConfigured(),
		});
	}

	if (body.mode === "send") {
		if (!body.subject?.trim() || !body.body?.trim()) {
			return NextResponse.json(
				{ error: "Subject and body are required" },
				{ status: 400 },
			);
		}
		const result = await sendAdminMail({
			to: user.email,
			subject: body.subject,
			body: body.body,
			replyTo: body.replyTo,
		});

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error ?? "Send failed", html: result.html },
				{ status: 502 },
			);
		}

		return NextResponse.json({
			ok: true,
			dryRun: result.dryRun,
			id: result.id,
			notice: result.error ?? null,
			html: result.html,
		});
	}

	return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
}
