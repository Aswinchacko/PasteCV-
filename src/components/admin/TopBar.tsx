"use client";

import { usePathname, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { LogoutButton } from "./LogoutButton";

const titles: Record<string, string> = {
	"/admin": "Overview",
	"/admin/portfolios": "Portfolios",
	"/admin/settings": "Settings",
};

export function TopBar() {
	const pathname = usePathname();
	const router = useRouter();
	const [, startTransition] = useTransition();
	const [refreshing, setRefreshing] = useState(false);

	const title = titles[pathname] ?? "Admin";

	function refresh() {
		setRefreshing(true);
		startTransition(() => {
			router.refresh();
			setTimeout(() => setRefreshing(false), 600);
		});
	}

	return (
		<header className="h-16 border-b border-white/[0.06] bg-white/[0.005] backdrop-blur-sm">
			<div className="h-full px-6 flex items-center justify-between gap-4">
				<div className="flex items-center gap-3 min-w-0">
					<span className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/30">
						pastecv / admin /
					</span>
					<h2 className="text-[15px] font-medium text-white/90 truncate">
						{title}
					</h2>
				</div>

				<div className="flex items-center gap-2">
					<div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[11px] text-white/60 font-mono">
						<span className="status-dot" />
						<span>Supabase · live</span>
					</div>
					<button
						onClick={refresh}
						className="inline-flex items-center justify-center size-9 rounded-lg text-white/55 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
						title="Refresh data"
					>
						<RefreshCw
							className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
						/>
					</button>
					<LogoutButton />
				</div>
			</div>
		</header>
	);
}
