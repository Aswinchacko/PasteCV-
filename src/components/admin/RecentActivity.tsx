import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { PortfolioSummary } from "@/lib/db/portfolios";

interface Props {
	portfolios: PortfolioSummary[];
	limit?: number;
}

function formatRelative(iso: string): string {
	const diff = Math.max(0, Date.now() - new Date(iso).getTime());
	const m = Math.floor(diff / 60_000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	if (d < 30) return `${d}d ago`;
	const mo = Math.floor(d / 30);
	return `${mo}mo ago`;
}

export function RecentActivity({ portfolios, limit = 6 }: Props) {
	const recent = portfolios.slice(0, limit);

	return (
		<div className="glass rounded-2xl p-6">
			<div className="flex items-center justify-between mb-5">
				<div>
					<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
						Recent activity
					</div>
					<div className="mt-2 text-[15px] font-medium">Latest portfolios</div>
				</div>
				<Sparkles className="size-4 text-white/30" />
			</div>

			{recent.length === 0 ? (
				<div className="text-[13px] text-white/40 py-8 text-center">
					Nothing here yet.
				</div>
			) : (
				<ol className="relative space-y-4">
					<div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />
					{recent.map((p) => (
						<li key={p.id} className="relative pl-7">
							<div className="absolute left-0 top-1.5 size-[14px] rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/40 flex items-center justify-center">
								<span className="size-1.5 rounded-full bg-[var(--color-accent)]" />
							</div>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<div className="text-[13px] font-medium text-white/90 truncate">
										{p.name}
									</div>
									{p.title && (
										<div className="text-[12px] text-white/45 truncate">
											{p.title}
										</div>
									)}
								</div>
								<div className="text-[11px] font-mono text-white/35 shrink-0 whitespace-nowrap">
									{formatRelative(p.created_at)}
								</div>
							</div>
						</li>
					))}
				</ol>
			)}

			<Link
				href="/admin/portfolios"
				className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.1em] text-white/45 hover:text-[var(--color-accent)] transition-colors"
			>
				View all
				<ArrowRight className="size-3" />
			</Link>
		</div>
	);
}
