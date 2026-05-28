"use client";

import { useEffect, useState } from "react";
import {
	Mail,
	X,
	Send,
	Eye,
	Pencil,
	Loader2,
	AlertCircle,
	Check,
	Sparkles,
} from "lucide-react";

const PRESETS: { id: PresetId; label: string; hint: string }[] = [
	{
		id: "support_check",
		label: "Checking in",
		hint: "Ask if they hit any issues building their portfolio.",
	},
	{
		id: "feedback",
		label: "Asking for feedback",
		hint: "Ask what they thought of the experience.",
	},
	{
		id: "welcome",
		label: "Welcome",
		hint: "Friendly hello after signup.",
	},
	{
		id: "custom",
		label: "Custom",
		hint: "Write the whole thing yourself.",
	},
];

type PresetId = "support_check" | "feedback" | "welcome" | "custom";

interface MailComposerProps {
	userId: string;
	recipientEmail: string;
	recipientName: string | null;
	onClose: () => void;
}

export function MailComposer({
	userId,
	recipientEmail,
	recipientName,
	onClose,
}: MailComposerProps) {
	const [preset, setPreset] = useState<PresetId>("support_check");
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [view, setView] = useState<"edit" | "preview">("edit");
	const [loadingPreset, setLoadingPreset] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<{
		dryRun: boolean;
		notice: string | null;
	} | null>(null);
	const [mailerConfigured, setMailerConfigured] = useState<boolean | null>(
		null,
	);

	useEffect(() => {
		async function fetchPreset() {
			setLoadingPreset(true);
			setError(null);
			try {
				const res = await fetch(`/api/admin/users/${userId}/email`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ mode: "preview", presetId: preset }),
				});
				const json = await res.json();
				if (!res.ok) throw new Error(json.error ?? "Preview failed");
				setSubject(json.subject);
				setBody(json.body);
				setMailerConfigured(!!json.mailerConfigured);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Preview failed");
			} finally {
				setLoadingPreset(false);
			}
		}
		void fetchPreset();
	}, [preset, userId]);

	async function handleSend() {
		setSending(true);
		setError(null);
		try {
			const res = await fetch(`/api/admin/users/${userId}/email`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					mode: "send",
					subject: subject.trim(),
					body: body.trim(),
				}),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error ?? "Send failed");
			setSuccess({ dryRun: !!json.dryRun, notice: json.notice ?? null });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Send failed");
		} finally {
			setSending(false);
		}
	}

	const previewHtml = bodyToPreviewHtml(body);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
			<div className="w-full max-w-2xl glass rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
				<div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/5">
					<div className="flex items-center gap-3 min-w-0">
						<div className="size-9 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] inline-flex items-center justify-center">
							<Mail className="size-4" />
						</div>
						<div className="min-w-0">
							<div className="text-[14px] font-medium tracking-tight truncate">
								Compose email
							</div>
							<div className="text-[12px] text-white/50 truncate">
								To {recipientName ? `${recipientName} ` : ""}
								<span className="font-mono">&lt;{recipientEmail}&gt;</span>
							</div>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="size-8 rounded-md text-white/40 hover:text-white hover:bg-white/[0.05] inline-flex items-center justify-center"
					>
						<X className="size-4" />
					</button>
				</div>

				{success ? (
					<div className="p-8 flex flex-col items-center text-center">
						<div className="size-12 rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] inline-flex items-center justify-center mb-4">
							<Check className="size-5" />
						</div>
						<h3 className="text-lg font-semibold tracking-tight">
							{success.dryRun ? "Preview generated" : "Email sent"}
						</h3>
						<p className="mt-1 text-[13px] text-white/55 max-w-md">
							{success.dryRun
								? success.notice ??
									"Mailer isn't configured, so nothing was actually delivered."
								: `Delivered to ${recipientEmail}. They can reply to it directly.`}
						</p>
						<button
							type="button"
							onClick={onClose}
							className="mt-6 h-9 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-[13px] transition-colors"
						>
							Close
						</button>
					</div>
				) : (
					<>
						<div className="px-5 py-3 border-b border-white/5">
							<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2">
								Template
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{PRESETS.map((p) => {
									const active = p.id === preset;
									return (
										<button
											key={p.id}
											type="button"
											onClick={() => setPreset(p.id)}
											className={`text-left rounded-lg px-3 py-2 border transition-all ${
												active
													? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/[0.05]"
													: "border-white/8 hover:border-white/20 bg-white/[0.02]"
											}`}
										>
											<div className="flex items-center justify-between gap-1.5">
												<span className="text-[13px] font-medium text-white">
													{p.label}
												</span>
												{active && (
													<Sparkles className="size-3 text-[var(--color-accent)]" />
												)}
											</div>
											<p className="mt-0.5 text-[11px] leading-tight text-white/45 line-clamp-2">
												{p.hint}
											</p>
										</button>
									);
								})}
							</div>
						</div>

						<div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
							<div className="inline-flex rounded-lg bg-black/40 border border-white/10 p-0.5 text-[12px]">
								<button
									type="button"
									onClick={() => setView("edit")}
									className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-md transition-colors ${
										view === "edit"
											? "bg-white/[0.08] text-white"
											: "text-white/55 hover:text-white"
									}`}
								>
									<Pencil className="size-3" />
									Edit
								</button>
								<button
									type="button"
									onClick={() => setView("preview")}
									className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-md transition-colors ${
										view === "preview"
											? "bg-white/[0.08] text-white"
											: "text-white/55 hover:text-white"
									}`}
								>
									<Eye className="size-3" />
									Preview
								</button>
							</div>
							{loadingPreset && (
								<span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/45">
									<Loader2 className="size-3 animate-spin" />
									Loading…
								</span>
							)}
						</div>

						<div className="flex-1 overflow-y-auto cv-scroll">
							{view === "edit" ? (
								<div className="px-5 py-4 space-y-3">
									<label className="block">
										<span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1">
											Subject
										</span>
										<input
											value={subject}
											onChange={(e) => setSubject(e.target.value)}
											placeholder="Quick check-in from PasteCV"
											className="w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-accent)]/40 text-[14px] text-white focus:outline-none"
										/>
									</label>
									<label className="block">
										<span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1">
											Message
										</span>
										<textarea
											value={body}
											onChange={(e) => setBody(e.target.value)}
											rows={12}
											placeholder="Write something human."
											className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-accent)]/40 text-[14px] text-white leading-relaxed focus:outline-none resize-y font-sans"
										/>
									</label>
									<p className="text-[11px] text-white/40">
										Reply-to is the user&apos;s own email. They reply
										straight to this thread.
									</p>
								</div>
							) : (
								<div className="px-5 py-4">
									<div className="rounded-xl bg-[#f6f7f8] p-1 max-h-[420px] overflow-y-auto cv-scroll">
										<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 px-3 pt-3 pb-2">
											Subject: <span className="text-zinc-800">{subject}</span>
										</div>
										<div
											className="bg-white rounded-lg"
											dangerouslySetInnerHTML={{ __html: previewHtml }}
										/>
									</div>
								</div>
							)}
						</div>

						<div className="px-5 py-3 border-t border-white/5 flex items-center justify-between gap-3">
							<div className="text-[11px] font-mono text-white/40">
								{mailerConfigured === false && (
									<span className="text-amber-300/80">
										Mailer not configured · send will preview only
									</span>
								)}
								{mailerConfigured === true && (
									<span className="text-[var(--color-accent-soft)]/80">
										Live · will deliver to inbox
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								{error && (
									<span className="inline-flex items-center gap-1.5 text-[12px] text-red-300">
										<AlertCircle className="size-3.5" />
										{error}
									</span>
								)}
								<button
									type="button"
									onClick={onClose}
									className="h-9 px-3 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.05]"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSend}
									disabled={
										sending ||
										loadingPreset ||
										!subject.trim() ||
										!body.trim()
									}
									className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-[var(--color-accent)] text-ink-950 text-[13px] font-medium hover:bg-[var(--color-accent-soft)] transition-colors disabled:opacity-60"
								>
									{sending ? (
										<>
											<Loader2 className="size-3.5 animate-spin" />
											Sending
										</>
									) : (
										<>
											<Send className="size-3.5" />
											Send email
										</>
									)}
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function bodyToPreviewHtml(text: string): string {
	const blocks = text
		.split(/\n{2,}/)
		.map(
			(b) =>
				`<p style="margin:0 0 16px 0;line-height:1.55;color:#0d0f12">${escapeHtml(
					b,
				).replace(/\n/g, "<br/>")}</p>`,
		)
		.join("");
	return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;color:#0d0f12">
<div style="font-size:11px;color:#6b7280;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px">PasteCV</div>
${blocks}
<hr style="border:0;border-top:1px solid #eef0f3;margin:18px 0 12px 0"/>
<div style="font-size:11px;color:#9aa3ad;line-height:1.5">
You're receiving this because you signed up for PasteCV. Reply directly to this email and a real person will read it.
</div>
</div>`;
}
