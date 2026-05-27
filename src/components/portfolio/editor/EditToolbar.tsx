"use client";

import { useEffect, useState } from "react";
import {
	Check,
	Copy,
	Eye,
	Pencil,
	Save,
	Layout,
	ChevronUp,
	Loader2,
	AlertCircle,
} from "lucide-react";
import { useEditor } from "./EditorProvider";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/db/portfolios";

const TEMPLATE_META: Record<
	TemplateId,
	{ label: string; description: string; preview: string }
> = {
	"linear-dark": {
		label: "Linear",
		description: "Dark canvas, lime accent. The default.",
		preview: "bg-gradient-to-br from-[#0a0c10] via-[#11141a] to-[#1a1f27]",
	},
	"paper-light": {
		label: "Paper",
		description: "White background, serif headlines, print-clean.",
		preview: "bg-gradient-to-br from-white via-zinc-100 to-zinc-200",
	},
	"terminal-mono": {
		label: "Terminal",
		description: "All mono, green-on-black, ASCII dividers.",
		preview: "bg-gradient-to-br from-black via-[#0a0f08] to-[#102810]",
	},
};

interface EditToolbarProps {
	views: number;
}

export function EditToolbar({ views }: EditToolbarProps) {
	const {
		slug,
		isOwner,
		editMode,
		setEditMode,
		saving,
		isDirty,
		lastSavedAt,
		error,
		template,
		setTemplate,
		save,
	} = useEditor();

	const [copied, setCopied] = useState(false);
	const [picker, setPicker] = useState(false);
	const [url, setUrl] = useState(`/${slug}`);

	const displayUrl = url.replace(/^https?:\/\//, "");

	useEffect(() => {
		setUrl(`${window.location.origin}/${slug}`);
	}, [slug]);

	async function copy() {
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {
			// no-op
		}
	}

	const savedAgo =
		lastSavedAt && Date.now() - lastSavedAt < 8000 && !isDirty && !saving;

	return (
		<div className="fixed inset-x-0 bottom-4 z-40 px-4">
			<div className="mx-auto max-w-2xl">
				{isOwner && picker && (
					<div className="mb-2 rounded-2xl bg-ink-900/95 border border-white/10 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl p-2 grid grid-cols-3 gap-2">
						{TEMPLATE_IDS.map((id) => {
							const meta = TEMPLATE_META[id];
							const active = id === template;
							return (
								<button
									key={id}
									type="button"
									onClick={() => {
										setTemplate(id);
										setPicker(false);
									}}
									className={`group text-left rounded-xl p-2 border transition-all ${
										active
											? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/[0.05]"
											: "border-white/8 hover:border-white/20 bg-white/[0.02]"
									}`}
								>
									<div
										className={`h-14 rounded-lg ${meta.preview} relative overflow-hidden`}
									>
										<div className="absolute inset-1 rounded-md bg-black/0">
											<div className="h-1 w-6 rounded-full bg-white/40 mt-1 ml-1.5" />
											<div className="h-0.5 w-10 rounded-full bg-white/20 mt-1 ml-1.5" />
											<div className="h-0.5 w-8 rounded-full bg-white/20 mt-0.5 ml-1.5" />
										</div>
									</div>
									<div className="mt-1.5 flex items-center gap-1.5 justify-between">
										<span className="text-[12px] font-medium text-white">
											{meta.label}
										</span>
										{active && (
											<Check className="size-3 text-[var(--color-accent)]" />
										)}
									</div>
									<p className="mt-0.5 text-[10px] leading-tight text-white/45 line-clamp-2">
										{meta.description}
									</p>
								</button>
							);
						})}
					</div>
				)}

				<div className="rounded-2xl px-2.5 py-2 flex items-center gap-2 bg-ink-900/95 border border-white/10 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl">
					<div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-black/40 border border-white/8 flex-1 min-w-0">
						<span className="size-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
						<span className="font-mono text-[12px] text-white/70 truncate">
							{displayUrl || `pastecv/${slug}`}
						</span>
					</div>

					{isOwner ? (
						<>
							<button
								type="button"
								onClick={() => setPicker((p) => !p)}
								className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-medium transition-colors ${
									picker
										? "bg-white/10 border-white/20 text-white"
										: "bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07] hover:text-white"
								}`}
							>
								<Layout className="size-3.5" />
								<span className="hidden sm:inline">Template</span>
								<ChevronUp
									className={`size-3 transition-transform ${picker ? "" : "rotate-180"}`}
								/>
							</button>

							{editMode ? (
								<button
									type="button"
									onClick={async () => {
										await save();
										if (!error) setEditMode(false);
									}}
									className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[var(--color-accent)] text-ink-950 text-[12px] font-medium hover:bg-[var(--color-accent-soft)] transition-colors"
								>
									{saving ? (
										<Loader2 className="size-3.5 animate-spin" />
									) : (
										<Check className="size-3.5" />
									)}
									<span>{saving ? "Saving" : "Done"}</span>
								</button>
							) : (
								<button
									type="button"
									onClick={() => setEditMode(true)}
									className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/10 border border-white/15 text-white text-[12px] font-medium hover:bg-white/15 transition-colors"
								>
									<Pencil className="size-3.5" />
									<span>Edit</span>
								</button>
							)}

							<button
								type="button"
								onClick={copy}
								className="inline-flex items-center justify-center size-9 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors"
								title="Copy link"
							>
								{copied ? (
									<Check className="size-3.5" />
								) : (
									<Copy className="size-3.5" />
								)}
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={copy}
							className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-[var(--color-accent)] text-ink-950 text-[13px] font-medium hover:bg-[var(--color-accent-soft)] transition-colors"
						>
							{copied ? (
								<>
									<Check className="size-3.5" /> Copied
								</>
							) : (
								<>
									<Copy className="size-3.5" /> Copy link
								</>
							)}
						</button>
					)}

					<div className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-xl border border-white/5 text-[12px] text-white/50 font-mono">
						<Eye className="size-3.5" />
						{views.toLocaleString()}
					</div>
				</div>

				{(isDirty || saving || savedAgo || error) && isOwner && (
					<div className="mt-2 flex justify-center">
						<div
							className={`inline-flex items-center gap-2 px-3 h-7 rounded-full text-[11px] font-mono backdrop-blur-xl border ${
								error
									? "border-red-500/30 bg-red-500/[0.06] text-red-200"
									: saving
										? "border-white/10 bg-ink-900/80 text-white/60"
										: savedAgo
											? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/[0.06] text-[var(--color-accent-soft)]"
											: "border-white/10 bg-ink-900/80 text-white/50"
							}`}
						>
							{error ? (
								<>
									<AlertCircle className="size-3" />
									<span>{error}</span>
									<button
										type="button"
										onClick={() => save()}
										className="ml-1 underline hover:text-white"
									>
										retry
									</button>
								</>
							) : saving ? (
								<>
									<Loader2 className="size-3 animate-spin" />
									<span>Saving…</span>
								</>
							) : savedAgo ? (
								<>
									<Check className="size-3" />
									<span>Saved</span>
								</>
							) : (
								<>
									<Save className="size-3" />
									<span>Unsaved changes — autosaves in a moment</span>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export { TEMPLATE_META };
