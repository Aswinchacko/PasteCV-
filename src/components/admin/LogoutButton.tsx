"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
	const router = useRouter();

	async function onLogout() {
		await fetch("/api/admin/logout", { method: "POST" });
		router.replace("/admin/login");
		router.refresh();
	}

	return (
		<button
			onClick={onLogout}
			className="inline-flex items-center gap-2 px-3 h-9 rounded-lg text-[13px] text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
		>
			<LogOut className="size-3.5" />
			<span>Sign out</span>
		</button>
	);
}
