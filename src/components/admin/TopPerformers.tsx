import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
import type { PortfolioSummary } from "@/lib/db/portfolios";

interface Props {
	portfolios: PortfolioSummary[];
	limit?: number;
}

export function TopPerformers({ portfolios, limit = 5 }: Props) {
	const top = [...portfolios]
		.sort((a, b) => b.views - a.views)
		.slice(0, limit);

	const max = Math.max(1, ...top.map((p) => p.views));

	return (
		<div className="glass rounded-2xl p-6">
			<div className="flex items-center justify-between mb-5">
				<div>
					<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
						Top performers
					</div>
					<div className="mt-2 text-[15px] font-medium">By total views</div>
				</div>
				<Eye className="size-4 text-white/30" />
			</div>

			{top.length === 0 ? (
				<div className="text-[13px] text-white/40 py-8 text-center">
					No portfolios yet.
				</div>
			) : (
				<ul className="space-y-3">
					{top.map((p, i) => {
						const pct = (p.views / max) * 100;
						return (
							<li key={p.id} className="group">
								<div className="flex items-center gap-3 mb-1.5">
									<span className="font-mono text-[11px] text-white/30 w-4">
										{String(i + 1).padStart(2, "0")}
									</span>
									<div className="flex-1 min-w-0 flex items-center justify-between gap-3">
										<div className="min-w-0">
											<div className="text-[13px] font-medium text-white/85 truncate">
												{p.name}
											</div>
											<div className="text-[11px] font-mono text-white/35 truncate">
												/{p.slug}
											</div>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<span className="font-mono text-[13px] text-white/80">
												{p.views.toLocaleString()}
											</span>
											<Link
												href={`/${p.slug}`}
												target="_blank"
												rel="noopener noreferrer"
												className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all"
											>
												<ExternalLink className="size-3.5" />
											</Link>
										</div>
									</div>
								</div>
								<div className="ml-7 h-1 rounded-full bg-white/[0.04] overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-[var(--color-accent)]/40 to-[var(--color-accent)] transition-all duration-500"
										style={{ width: `${Math.max(2, pct)}%` }}
									/>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
