import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/ai/schema";
import { SectionHeading } from "./SectionHeading";

function ensureUrl(href: string): string {
	if (!href) return "";
	if (/^https?:\/\//i.test(href)) return href;
	return `https://${href}`;
}

export function ProjectCards({ projects }: { projects: Project[] }) {
	if (!projects || projects.length === 0) return null;

	return (
		<section className="rise-in-delay-3">
			<SectionHeading
				index="03"
				title="Projects"
				hint={`${projects.length} shipped`}
			/>
			<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
				{projects.map((p, i) => {
					const url = p.url ? ensureUrl(p.url) : null;
					const Wrapper: React.ElementType = url ? "a" : "div";
					const wrapperProps = url
						? {
								href: url,
								target: "_blank",
								rel: "noopener noreferrer",
							}
						: {};
					return (
						<Wrapper
							key={`${p.name}-${i}`}
							{...wrapperProps}
							className={`group relative block glass rounded-2xl p-5 transition-all ${
								url ? "hover:border-[var(--color-accent)]/30 hover:-translate-y-0.5" : ""
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<h3 className="text-[16px] font-semibold tracking-tight">
									{p.name}
								</h3>
								{url && (
									<ArrowUpRight className="size-4 text-white/30 group-hover:text-[var(--color-accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
								)}
							</div>
							{p.description && (
								<p className="mt-2 text-sm leading-relaxed text-white/60">
									{p.description}
								</p>
							)}
							{url && (
								<p className="mt-4 font-mono text-[11px] text-white/35 truncate">
									{url.replace(/^https?:\/\//, "")}
								</p>
							)}
						</Wrapper>
					);
				})}
			</div>
		</section>
	);
}
