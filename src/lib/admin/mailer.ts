import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function getTransporter(): Transporter | null {
	if (cached) return cached;
	const host = process.env.SMTP_HOST;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	if (!host || !user || !pass) return null;

	const port = Number.parseInt(process.env.SMTP_PORT ?? "465", 10);
	cached = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass },
	});
	return cached;
}

export function isMailerConfigured(): boolean {
	return !!(
		process.env.SMTP_HOST &&
		process.env.SMTP_USER &&
		process.env.SMTP_PASS &&
		process.env.MAIL_FROM
	);
}

export type MailPresetId =
	| "support_check"
	| "feedback"
	| "welcome"
	| "custom";

export interface MailPreset {
	id: MailPresetId;
	label: string;
	hint: string;
	subject: (vars: TemplateVars) => string;
	body: (vars: TemplateVars) => string;
}

interface TemplateVars {
	recipientName: string;
	siteUrl: string;
}

function firstName(name: string): string {
	if (!name) return "there";
	return name.trim().split(/\s+/)[0];
}

export const MAIL_PRESETS: MailPreset[] = [
	{
		id: "support_check",
		label: "Checking in",
		hint: "Reach out to a user who hasn't built a portfolio yet, or seems stuck.",
		subject: () => "Quick check-in from PasteCV",
		body: ({ recipientName, siteUrl }) => `Hey ${firstName(recipientName)},

I'm reaching out from PasteCV — just wanted to check in personally.

I noticed you signed up but haven't published a portfolio yet, and I wanted to ask: did something go wrong while generating it? Was the resume parser confusing, did it fail on your text, or did you hit an error somewhere?

If you've got 30 seconds to reply with what happened, I'd genuinely appreciate it — every bit of feedback helps me make this thing better.

If you just got busy, no worries at all. Whenever you're ready, your account is right here:
${siteUrl}

Thanks for trying it out.

— PasteCV
${siteUrl}`,
	},
	{
		id: "feedback",
		label: "Asking for feedback",
		hint: "Ask a user what they thought of the experience.",
		subject: () => "How was your PasteCV experience?",
		body: ({ recipientName, siteUrl }) => `Hi ${firstName(recipientName)},

Thanks for using PasteCV.

I'm building this on my own and would love to know what you thought — what worked, what felt awkward, what you wish it did. A one-line reply is more useful than you'd think.

Your portfolio lives here whenever you want to come back:
${siteUrl}

Cheers,
PasteCV
${siteUrl}`,
	},
	{
		id: "welcome",
		label: "Welcome",
		hint: "Friendly hello after signup.",
		subject: () => "Welcome to PasteCV",
		body: ({ recipientName, siteUrl }) => `Hi ${firstName(recipientName)},

Welcome to PasteCV — glad you're here.

If you haven't yet, head over and paste your resume — you'll have a shareable portfolio in about twelve seconds. You can switch between three templates and edit any field inline.

${siteUrl}

If anything breaks or feels off, just reply to this email. I read every reply.

— PasteCV
${siteUrl}`,
	},
	{
		id: "custom",
		label: "Custom",
		hint: "Start from a blank slate.",
		subject: () => "",
		body: ({ recipientName }) => `Hi ${firstName(recipientName)},

`,
	},
];

export function getPreset(id: MailPresetId): MailPreset {
	return MAIL_PRESETS.find((p) => p.id === id) ?? MAIL_PRESETS[0];
}

/**
 * Public site URL used inside outbound emails. Decoupled from
 * NEXT_PUBLIC_BASE_URL on purpose: emails sent from a developer's machine
 * should still link to production, not localhost.
 */
function publicSiteUrl(): string {
	return (
		process.env.MAIL_SITE_URL?.replace(/\/+$/, "") ??
		"https://paste-cv.vercel.app"
	);
}

export function renderPreset(
	id: MailPresetId,
	recipientName: string | null,
): { subject: string; body: string } {
	const preset = getPreset(id);
	const vars: TemplateVars = {
		recipientName: recipientName ?? "",
		siteUrl: publicSiteUrl(),
	};
	return {
		subject: preset.subject(vars),
		body: preset.body(vars),
	};
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function textToHtml(text: string): string {
	const blocks = text
		.split(/\n{2,}/)
		.map((b) => `<p style="margin:0 0 16px 0;line-height:1.55">${escapeHtml(b).replace(/\n/g, "<br/>")}</p>`)
		.join("");
	return `<!doctype html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f7f8;margin:0;padding:32px 16px;color:#0d0f12">
<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e6e8eb;border-radius:14px;padding:28px 28px 24px 28px">
<div style="font-size:13px;color:#6b7280;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:18px">PasteCV</div>
${blocks}
<hr style="border:0;border-top:1px solid #eef0f3;margin:24px 0 16px 0"/>
<div style="font-size:12px;color:#9aa3ad;line-height:1.55">
You're receiving this because you signed up for PasteCV. Reply directly to this email and a real person will read it.
</div>
</div>
</body>
</html>`;
}

export interface SendMailInput {
	to: string;
	subject: string;
	body: string;
	replyTo?: string;
}

export interface SendMailResult {
	ok: boolean;
	dryRun: boolean;
	id?: string;
	error?: string;
	html: string;
}

export async function sendAdminMail(
	input: SendMailInput,
): Promise<SendMailResult> {
	const html = textToHtml(input.body);

	if (!isMailerConfigured()) {
		return {
			ok: true,
			dryRun: true,
			html,
			error:
				"Mailer not configured. Set SMTP_HOST/PORT/USER/PASS and MAIL_FROM in .env to actually send.",
		};
	}

	const transporter = getTransporter();
	if (!transporter) {
		return {
			ok: false,
			dryRun: false,
			html,
			error: "SMTP transport not initialised",
		};
	}

	const from = process.env.MAIL_FROM as string;

	try {
		const result = await transporter.sendMail({
			from,
			to: input.to,
			subject: input.subject,
			text: input.body,
			html,
			replyTo: input.replyTo,
		});

		return {
			ok: true,
			dryRun: false,
			id: result.messageId,
			html,
		};
	} catch (err) {
		return {
			ok: false,
			dryRun: false,
			html,
			error: err instanceof Error ? err.message : "Send failed",
		};
	}
}
