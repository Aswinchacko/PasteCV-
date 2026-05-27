import Link from "next/link";
import { ArrowUpRight, Eye, Plus, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listPortfoliosByOwner } from "@/lib/db/portfolios";
import { Wordmark } from "@/components/ui/Wordmark";
import { AuthNav } from "@/components/auth/AuthNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "My portfolios · pastecv" };

export default async function DashboardPage() {
	const user = await requireUser("/login?next=/dashboard");
	const portfolios = await listPortfoliosByOwner(user.id);

	return (
		<main className="relative min-h-screen overflow-hidden">
			<div className="absolute inset-0 bg-line-grid opacity-30 pointer-events-none" />
			<div className="absolute top-[-200px] left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[var(--color-accent)]/[0.06] blur-[120px] pointer-events-none" />

			<header className="relative z-30 max-w-5xl mx-auto px-6 pt-8 flex items-center justify-between">
				<Wordmark />
				<AuthNav />
			</header>

			<section className="relative z-10 max-w-5xl mx-auto px-6 pt-16">
				<div className="flex items-end justify-between gap-4 mb-8">
					<div>
						<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
							Dashboard
						</div>
						<h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
							Your portfolios
						</h1>
						<p className="mt-2 text-white/55">
							{portfolios.length === 0
								? "Nothing here yet. Paste a resume to create your first portfolio."
								: `${portfolios.length} portfolio${portfolios.length === 1 ? "" : "s"} · ${portfolios.reduce((s, p) => s + p.views, 0).toLocaleString()} total views`}
						</p>
					</div>
					<Link
						href="/"
						className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-[var(--color-accent)] text-ink-950 font-medium hover:bg-[var(--color-accent-soft)] transition-colors"
					>
						<Plus className="size-4" />
						New portfolio
					</Link>
				</div>

				{portfolios.length === 0 ? (
					<Link
						href="/"
						className="glass rounded-2xl px-8 py-16 flex flex-col items-center text-center hover:border-[var(--color-accent)]/30 transition-colors"
					>
						<div className="size-12 inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] mb-4">
							<Sparkles className="size-5" />
						</div>
						<div className="text-lg font-medium">Paste your first resume</div>
						<p className="mt-1 text-sm text-white/50 max-w-sm">
							Drop the text in. We&apos;ll turn it into a clean portfolio in
							about twelve seconds.
						</p>
					</Link>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{portfolios.map((p) => (
							<Link
								key={p.id}
								href={`/${p.slug}`}
								className="group glass rounded-2xl p-5 flex flex-col gap-3 hover:border-[var(--color-accent)]/30 hover:-translate-y-0.5 transition-all"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<h2 className="text-lg font-semibold tracking-tight truncate">
											{p.name}
										</h2>
										{p.title && (
											<p className="text-sm text-white/55 truncate">
												{p.title}
											</p>
										)}
									</div>
									<ArrowUpRight className="size-4 text-white/30 group-hover:text-[var(--color-accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
								</div>
								<div className="flex items-center justify-between text-[11px] font-mono text-white/40">
									<span className="truncate">/{p.slug}</span>
									<span className="inline-flex items-center gap-3">
										<span className="inline-flex items-center gap-1">
											<Eye className="size-3" />
											{p.views.toLocaleString()}
										</span>
										<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/8 text-white/60">
											{p.template}
										</span>
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
