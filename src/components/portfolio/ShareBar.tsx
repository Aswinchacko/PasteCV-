"use client";

import { Check, Copy, Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface ShareBarProps {
	slug: string;
	views: number;
}

export function ShareBar({ slug, views }: ShareBarProps) {
	const [copied, setCopied] = useState(false);
	const [url, setUrl] = useState("");

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

	const displayUrl = url.replace(/^https?:\/\//, "");

	return (
		<div className="fixed inset-x-0 bottom-4 z-30 px-4">
			<div className="mx-auto max-w-2xl glass rounded-2xl px-3 py-2.5 flex items-center gap-2 shadow-[0_12px_60px_-15px_rgba(0,0,0,0.5)]">
				<div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white/[0.02] border border-white/5 flex-1 min-w-0">
					<span className="size-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
					<span className="font-mono text-[12px] text-white/70 truncate">
						{displayUrl || `pastecv/${slug}`}
					</span>
				</div>
				<button
					type="button"
					onClick={copy}
					className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-[var(--color-accent)] text-ink-950 text-[13px] font-medium hover:bg-[var(--color-accent-soft)] transition-colors"
				>
					{copied ? (
						<>
							<Check className="size-3.5" />
							Copied
						</>
					) : (
						<>
							<Copy className="size-3.5" />
							Copy link
						</>
					)}
				</button>
				<div className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-xl border border-white/5 text-[12px] text-white/50 font-mono">
					<Eye className="size-3.5" />
					{views.toLocaleString()}
				</div>
			</div>
		</div>
	);
}
