"use client";

import { useMemo, useState } from "react";

interface TimelineChartProps {
	createdAt: string[];
	days?: number;
	renderedAt: number;
}

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function formatInt(n: number): string {
	return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dayLabel(d: Date): string {
	return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function TimelineChart({
	createdAt,
	days = 30,
	renderedAt,
}: TimelineChartProps) {
	const buckets = useMemo(() => {
		const now = new Date(renderedAt);
		const start = new Date(now);
		start.setUTCHours(0, 0, 0, 0);
		start.setUTCDate(start.getUTCDate() - (days - 1));

		const series: { label: string; date: Date; count: number }[] = [];
		for (let i = 0; i < days; i++) {
			const d = new Date(start);
			d.setUTCDate(start.getUTCDate() + i);
			series.push({
				label: dayLabel(d),
				date: d,
				count: 0,
			});
		}

		for (const iso of createdAt) {
			const t = new Date(iso);
			t.setUTCHours(0, 0, 0, 0);
			const idx = Math.floor(
				(t.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
			);
			if (idx >= 0 && idx < days) series[idx].count += 1;
		}

		return series;
	}, [createdAt, days, renderedAt]);

	const max = Math.max(1, ...buckets.map((b) => b.count));
	const total = buckets.reduce((s, b) => s + b.count, 0);
	const [hover, setHover] = useState<number | null>(null);

	return (
		<div className="glass rounded-2xl p-6">
			<div className="flex items-start justify-between mb-6 flex-wrap gap-3">
				<div>
					<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
						New portfolios
					</div>
					<div className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
						{formatInt(total)}
						<span className="ml-2 text-[13px] font-mono text-white/40">
							last {days}d
						</span>
					</div>
				</div>

				{hover !== null && buckets[hover] && (
					<div className="text-right">
						<div className="text-[13px] font-mono text-white/40">
							{buckets[hover].label}
						</div>
						<div className="text-[15px] font-medium">
							{buckets[hover].count}{" "}
							{buckets[hover].count === 1 ? "portfolio" : "portfolios"}
						</div>
					</div>
				)}
			</div>

			<div
				className="flex items-end gap-[3px] h-32"
				onMouseLeave={() => setHover(null)}
			>
				{buckets.map((b, i) => {
					const h = (b.count / max) * 100;
					return (
						<div
							key={i}
							onMouseEnter={() => setHover(i)}
							className="flex-1 flex flex-col justify-end group cursor-default"
						>
							<div
								className={`w-full rounded-sm transition-all duration-150 ${
									b.count === 0
										? "bg-white/[0.04]"
										: hover === i
											? "bg-[var(--color-accent)]"
											: "bg-[var(--color-accent)]/40 group-hover:bg-[var(--color-accent)]/70"
								}`}
								style={{ height: `${Math.max(b.count > 0 ? 4 : 2, h)}%` }}
							/>
						</div>
					);
				})}
			</div>

			<div className="mt-3 flex items-center justify-between text-[10px] font-mono text-white/30">
				<span>{buckets[0]?.label}</span>
				<span>today</span>
			</div>
		</div>
	);
}
