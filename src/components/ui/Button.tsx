"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	loading?: boolean;
	icon?: ReactNode;
	children: ReactNode;
}

const base =
	"group relative inline-flex items-center justify-center gap-2 font-medium tracking-tight rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
	primary:
		"bg-[var(--color-accent)] text-ink-950 hover:bg-[var(--color-accent-soft)] shadow-[0_0_0_1px_rgba(205,255,91,0.4),0_8px_32px_-12px_rgba(205,255,91,0.7)] hover:shadow-[0_0_0_1px_rgba(205,255,91,0.6),0_10px_40px_-10px_rgba(205,255,91,0.9)]",
	ghost: "text-white/70 hover:text-white hover:bg-white/5",
	outline:
		"text-white border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20",
};

export function Button({
	variant = "primary",
	loading,
	icon,
	children,
	className = "",
	disabled,
	...rest
}: ButtonProps) {
	return (
		<button
			{...rest}
			disabled={disabled || loading}
			className={`${base} ${variants[variant]} px-5 h-12 text-[15px] ${className}`}
		>
			{loading ? (
				<>
					<span className="size-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
					<span>{children}</span>
				</>
			) : (
				<>
					{icon}
					<span>{children}</span>
				</>
			)}
		</button>
	);
}
