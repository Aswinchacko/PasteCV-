import { ResumeInput } from "@/components/landing/ResumeInput";
import { Wordmark } from "@/components/ui/Wordmark";
import { AuthNav } from "@/components/auth/AuthNav";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
	const user = await getCurrentUser();

	return (
		<main className="relative min-h-screen overflow-hidden">
			<div className="absolute inset-0 bg-line-grid opacity-60 pointer-events-none" />
			<div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-[var(--color-accent)]/[0.06] via-transparent to-transparent pointer-events-none" />
			<div className="absolute top-[-200px] left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[var(--color-accent)]/10 blur-[120px] pointer-events-none" />

			<header className="relative z-10 max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
				<Wordmark />
				<AuthNav />
			</header>

			<section className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
				<div className="rise-in inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-white/70 font-mono tracking-tight">
					<span className="size-1.5 rounded-full bg-[var(--color-accent)]" />
					For people who hate building portfolios
				</div>

				<h1 className="rise-in-delay-1 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] leading-[0.98]">
					Your resume.
					<br />
					<span className="italic font-serif text-white/55">Now a link.</span>
				</h1>

				<p className="rise-in-delay-2 mt-7 max-w-xl mx-auto text-[17px] leading-relaxed text-white/60">
					Paste any resume. We turn it into a clean, shareable portfolio page
					you can send to anyone — in about twelve seconds.
				</p>
			</section>

			<section className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
				<div className="rise-in-delay-3">
					<ResumeInput isAuthed={!!user} />
				</div>
			</section>

			<section className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
				<div className="rise-in-delay-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
					<Stat label="Time to portfolio" value="~12s" />
					<Stat label="Powered by" value="Groq LPU" />
					<Stat label="Cost" value="Free" />
				</div>
			</section>

			<footer className="relative z-10 max-w-6xl mx-auto px-6 pb-10 text-center text-[11px] font-mono text-white/30">
				pastecv · paste, parse, publish
			</footer>
		</main>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="glass rounded-xl px-5 py-4">
			<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
				{label}
			</div>
			<div className="mt-2 text-xl font-semibold tracking-tight">{value}</div>
		</div>
	);
}
