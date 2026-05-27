import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPortfolioBySlug, DEFAULT_TEMPLATE } from "@/lib/db/portfolios";
import { getCurrentUser } from "@/lib/auth/session";
import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";

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
	const [portfolio, user] = await Promise.all([
		getPortfolioBySlug(slug),
		getCurrentUser(),
	]);
	if (!portfolio) notFound();

	const isOwner = !!user && user.id === portfolio.owner_id;

	return (
		<PortfolioRenderer
			slug={portfolio.slug}
			data={portfolio.data}
			template={portfolio.template ?? DEFAULT_TEMPLATE}
			isOwner={isOwner}
			views={portfolio.views}
		/>
	);
}
