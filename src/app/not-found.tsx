import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/ui/Wordmark";

export default function NotFound() {
	return (
		<main className="relative min-h-screen flex flex-col overflow-hidden">
			<div className="absolute inset-0 bg-line-grid opacity-40 pointer-events-none" />
			<div className="absolute top-[-200px] left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-[var(--color-accent)]/[0.05] blur-[120px] pointer-events-none" />

			<header className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-8">
				<Wordmark />
			</header>

			<section className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center -mt-12">
				<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
					Error · 404
				</div>
				<h1 className="mt-5 text-6xl sm:text-7xl font-semibold tracking-[-0.04em] leading-[0.98]">
					Not here.
					<br />
					<span className="italic font-serif text-white/55">
						Maybe never was.
					</span>
				</h1>
				<p className="mt-6 max-w-md text-white/55">
					The portfolio you’re looking for either expired, never existed, or
					was typed slightly wrong.
				</p>
				<Link
					href="/"
					className="mt-10 inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-[var(--color-accent)] text-ink-950 font-medium hover:bg-[var(--color-accent-soft)] transition-colors"
				>
					<ArrowLeft className="size-4" />
					Build your own
				</Link>
			</section>
		</main>
	);
}
