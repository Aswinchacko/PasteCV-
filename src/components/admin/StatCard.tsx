import type { ReactNode } from "react";

interface StatCardProps {
	label: string;
	value: string;
	hint?: ReactNode;
	icon?: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
	return (
		<div className="glass rounded-2xl px-5 py-5 hover:border-white/15 transition-colors relative overflow-hidden">
			<div className="flex items-start justify-between">
				<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
					{label}
				</div>
				{icon && (
					<div className="size-7 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40">
						{icon}
					</div>
				)}
			</div>
			<div className="mt-4 text-3xl font-semibold tracking-[-0.02em]">
				{value}
			</div>
			{hint && (
				<div className="mt-1.5 text-[11px] font-mono text-white/40">{hint}</div>
			)}
		</div>
	);
}
