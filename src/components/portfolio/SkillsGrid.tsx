import { SectionHeading } from "./SectionHeading";
import { Badge } from "@/components/ui/Badge";

export function SkillsGrid({ skills }: { skills: string[] }) {
	if (!skills || skills.length === 0) return null;
	return (
		<section className="rise-in-delay-1">
			<SectionHeading index="01" title="Skills" />
			<div className="mt-6 flex flex-wrap gap-2">
				{skills.map((skill) => (
					<Badge key={skill} variant="mono">
						{skill}
					</Badge>
				))}
			</div>
		</section>
	);
}
