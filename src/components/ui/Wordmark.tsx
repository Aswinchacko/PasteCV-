import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
	return (
		<Link
			href="/"
			className={`inline-flex items-center gap-2 font-semibold tracking-tight text-white ${className}`}
		>
			<span className="relative inline-flex items-center justify-center size-7 rounded-lg bg-[var(--color-accent)] text-ink-950">
				<span className="font-mono text-[13px] leading-none">P</span>
			</span>
			<span className="text-[15px]">
				paste<span className="text-white/40">cv</span>
			</span>
		</Link>
	);
}
