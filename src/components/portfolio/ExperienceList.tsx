import type { Experience } from "@/lib/ai/schema";
import { SectionHeading } from "./SectionHeading";

export function ExperienceList({ experience }: { experience: Experience[] }) {
	if (!experience || experience.length === 0) return null;

	return (
		<section className="rise-in-delay-2">
			<SectionHeading
				index="02"
				title="Experience"
				hint={`${experience.length} role${experience.length === 1 ? "" : "s"}`}
			/>
			<div className="mt-8 relative">
				<div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent" />
				<ol className="space-y-10">
					{experience.map((job, i) => (
						<li
							key={`${job.company}-${i}`}
							className="relative pl-7 group"
						>
							<span className="absolute left-0 top-2 size-2.5 rounded-full bg-ink-950 border-2 border-white/30 group-hover:border-[var(--color-accent)] transition-colors" />
							<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
								<h3 className="text-lg font-semibold tracking-tight">
									{job.company}
								</h3>
								<span className="font-mono text-[11px] text-white/40">
									{job.duration}
								</span>
							</div>
							<p className="mt-0.5 text-sm text-white/55">{job.role}</p>
							{job.points && job.points.length > 0 && (
								<ul className="mt-4 space-y-2">
									{job.points.map((p, j) => (
										<li
											key={j}
											className="flex gap-3 text-[15px] leading-relaxed text-white/75"
										>
											<span className="mt-2 size-1 rounded-full bg-white/30 shrink-0" />
											<span>{p}</span>
										</li>
									))}
								</ul>
							)}
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
