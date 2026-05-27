"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	Users,
	Settings,
	ExternalLink,
} from "lucide-react";
import { Wordmark } from "@/components/ui/Wordmark";

const nav = [
	{ href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
	{ href: "/admin/portfolios", label: "Portfolios", icon: Users, exact: false },
	{ href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

export function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/[0.06] bg-white/[0.01]">
			<div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
				<Wordmark />
			</div>

			<div className="px-3 py-5 flex-1">
				<div className="px-2 mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/30">
					Workspace
				</div>
				<nav className="space-y-1">
					{nav.map((item) => {
						const active = item.exact
							? pathname === item.href
							: pathname.startsWith(item.href);
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								href={item.href}
								prefetch
								onMouseEnter={() => router.prefetch(item.href)}
								onFocus={() => router.prefetch(item.href)}
								className={`group flex items-center gap-3 px-3 h-10 rounded-lg text-[14px] transition-all ${
									active
										? "bg-white/[0.05] text-white border border-white/[0.08]"
										: "text-white/55 hover:text-white hover:bg-white/[0.025] border border-transparent"
								}`}
							>
								<Icon
									className={`size-4 ${active ? "text-[var(--color-accent)]" : "text-white/40 group-hover:text-white/70"}`}
								/>
								<span>{item.label}</span>
								{active && (
									<span className="ml-auto size-1.5 rounded-full bg-[var(--color-accent)]" />
								)}
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="p-3 border-t border-white/[0.06]">
				<Link
					href="/"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-between px-3 h-10 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.025] transition-all"
				>
					<span>View site</span>
					<ExternalLink className="size-3.5" />
				</Link>
			</div>
		</aside>
	);
}
