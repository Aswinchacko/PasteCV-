import type { PortfolioRow } from "@/lib/db/portfolios";
import { Tags } from "lucide-react";

interface Props {
	portfolios: PortfolioRow[];
	limit?: number;
}

export function SkillsCloud({ portfolios, limit = 24 }: Props) {
	const counts = new Map<string, number>();
	for (const p of portfolios) {
		const seen = new Set<string>();
		for (const raw of p.data?.skills ?? []) {
			const k = raw.trim();
			if (!k) continue;
			const norm = k.toLowerCase();
			if (seen.has(norm)) continue;
			seen.add(norm);
			counts.set(k, (counts.get(k) ?? 0) + 1);
		}
	}

	const sorted = [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit);

	const max = sorted[0]?.[1] ?? 1;

	return (
		<div className="glass rounded-2xl p-6">
			<div className="flex items-center justify-between mb-5">
				<div>
					<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
						Skills cloud
					</div>
					<div className="mt-2 text-[15px] font-medium">
						Most common across all portfolios
					</div>
				</div>
				<Tags className="size-4 text-white/30" />
			</div>

			{sorted.length === 0 ? (
				<div className="text-[13px] text-white/40 py-8 text-center">
					No skills detected yet.
				</div>
			) : (
				<div className="flex flex-wrap gap-2">
					{sorted.map(([skill, count]) => {
						const weight = count / max;
						return (
							<span
								key={skill}
								className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border text-[12px] transition-colors"
								style={{
									background: `rgba(205, 255, 91, ${0.04 + weight * 0.1})`,
									borderColor: `rgba(205, 255, 91, ${0.08 + weight * 0.25})`,
									color: `rgba(255, 255, 255, ${0.55 + weight * 0.35})`,
								}}
							>
								<span>{skill}</span>
								<span className="font-mono text-[10px] text-white/40">
									{count}
								</span>
							</span>
						);
					})}
				</div>
			)}
		</div>
	);
}
