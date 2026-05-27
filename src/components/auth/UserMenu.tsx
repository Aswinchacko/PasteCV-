"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/auth/client";

interface UserMenuProps {
	email: string | null;
	displayName: string | null;
	avatarUrl: string | null;
}

export function UserMenu({ email, displayName, avatarUrl }: UserMenuProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [signingOut, setSigningOut] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!ref.current?.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);

	async function signOut() {
		setSigningOut(true);
		try {
			const sb = getSupabaseBrowser();
			await sb.auth.signOut();
			await fetch("/api/auth/signout", { method: "POST" });
			router.replace("/");
			router.refresh();
		} finally {
			setSigningOut(false);
			setOpen(false);
		}
	}

	const initial = (displayName || email || "U").slice(0, 1).toUpperCase();
	const label = displayName ?? email ?? "Account";

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-colors"
			>
				{avatarUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={avatarUrl}
						alt=""
						className="size-7 rounded-full object-cover"
					/>
				) : (
					<span className="size-7 inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] text-ink-950 text-[12px] font-semibold">
						{initial}
					</span>
				)}
				<span className="hidden sm:inline text-[13px] text-white/80 max-w-[140px] truncate">
					{label}
				</span>
				<ChevronDown className="size-3.5 text-white/40" />
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-64 rounded-xl bg-ink-900/95 border border-white/10 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden z-50">
					<div className="px-3 py-3 border-b border-white/5">
						<div className="text-[13px] font-medium text-white truncate">
							{displayName ?? "Account"}
						</div>
						{email && (
							<div className="text-[11px] font-mono text-white/40 truncate">
								{email}
							</div>
						)}
					</div>
					<div className="p-1">
						<Link
							href="/dashboard"
							onClick={() => setOpen(false)}
							className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-white/80 hover:bg-white/[0.05] hover:text-white transition-colors"
						>
							<UserIcon className="size-3.5" />
							My portfolios
						</Link>
						<button
							type="button"
							onClick={signOut}
							disabled={signingOut}
							className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-white/80 hover:bg-white/[0.05] hover:text-white transition-colors disabled:opacity-60"
						>
							<LogOut className="size-3.5" />
							{signingOut ? "Signing out…" : "Sign out"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
