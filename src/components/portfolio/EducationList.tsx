import type { Education } from "@/lib/ai/schema";
import { SectionHeading } from "./SectionHeading";

export function EducationList({ education }: { education: Education[] }) {
	if (!education || education.length === 0) return null;
	return (
		<section className="rise-in-delay-2">
			<SectionHeading index="04" title="Education" />
			<div className="mt-6 space-y-4">
				{education.map((e, i) => (
					<div
						key={`${e.institution}-${i}`}
						className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-4 last:border-b-0"
					>
						<div>
							<div className="text-[15px] font-medium tracking-tight">
								{e.institution}
							</div>
							<div className="text-sm text-white/55">{e.degree}</div>
						</div>
						{e.year && (
							<span className="font-mono text-[11px] text-white/40">
								{e.year}
							</span>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
