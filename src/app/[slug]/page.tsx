import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPortfolioBySlug } from "@/lib/db/portfolios";

import { Hero } from "@/components/portfolio/Hero";
import { SkillsGrid } from "@/components/portfolio/SkillsGrid";
import { ExperienceList } from "@/components/portfolio/ExperienceList";
import { ProjectCards } from "@/components/portfolio/ProjectCards";
import { EducationList } from "@/components/portfolio/EducationList";
import { ShareBar } from "@/components/portfolio/ShareBar";
import { Wordmark } from "@/components/ui/Wordmark";

export const dynamic = "force-dynamic";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const portfolio = await getPortfolioBySlug(slug);
	if (!portfolio) return { title: "Portfolio not found · pastecv" };
	const { name, data } = portfolio;
	return {
		title: `${name} · pastecv`,
		description: data.summary || `${name}'s portfolio on pastecv`,
		openGraph: {
			title: `${name} · pastecv`,
			description: data.summary || `${name}'s portfolio on pastecv`,
			url: `/${slug}`,
			type: "profile",
		},
		twitter: {
			card: "summary_large_image",
			title: `${name} · pastecv`,
			description: data.summary || `${name}'s portfolio on pastecv`,
		},
	};
}

export default async function PortfolioPage({ params }: PageProps) {
	const { slug } = await params;
	const portfolio = await getPortfolioBySlug(slug);
	if (!portfolio) notFound();

	const data = portfolio.data;

	return (
		<main className="relative min-h-screen pb-32 overflow-hidden">
			<div className="absolute inset-0 bg-line-grid opacity-40 pointer-events-none" />
			<div className="absolute top-[-220px] left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-[var(--color-accent)]/[0.06] blur-[140px] pointer-events-none" />

			<header className="relative z-10 max-w-3xl mx-auto px-6 pt-8 flex items-center justify-between">
				<Wordmark />
				<a
					href="/"
					className="font-mono text-[11px] text-white/40 hover:text-white transition-colors"
				>
					← build your own
				</a>
			</header>

			<div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 space-y-20">
				<Hero data={data} />
				<SkillsGrid skills={data.skills} />
				<ExperienceList experience={data.experience} />
				<ProjectCards projects={data.projects} />
				<EducationList education={data.education} />
			</div>

			<ShareBar slug={portfolio.slug} views={portfolio.views} />
		</main>
	);
}
