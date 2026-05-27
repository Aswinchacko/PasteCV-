interface SectionHeadingProps {
	index: string;
	title: string;
	hint?: string;
}

export function SectionHeading({ index, title, hint }: SectionHeadingProps) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
			<div className="flex items-baseline gap-3">
				<span className="font-mono text-[11px] text-white/35 tracking-tight">
					{index}
				</span>
				<h2 className="text-[15px] font-medium tracking-tight text-white/90">
					{title}
				</h2>
			</div>
			{hint && (
				<span className="font-mono text-[11px] text-white/30">{hint}</span>
			)}
		</div>
	);
}
