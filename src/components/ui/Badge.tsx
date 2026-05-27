import type { ReactNode } from "react";

interface BadgeProps {
	children: ReactNode;
	variant?: "default" | "accent" | "mono";
	className?: string;
}

const variants = {
	default:
		"bg-white/[0.04] text-white/85 border border-white/10 hover:bg-white/[0.07] hover:border-white/20",
	accent:
		"bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/25",
	mono: "bg-white/[0.03] text-white/70 border border-white/10 font-mono",
} as const;

export function Badge({
	children,
	variant = "default",
	className = "",
}: BadgeProps) {
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs tracking-tight transition-colors ${variants[variant]} ${className}`}
		>
			{children}
		</span>
	);
}
