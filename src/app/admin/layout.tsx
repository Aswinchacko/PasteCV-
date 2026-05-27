import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdminAuthedCached } from "@/lib/admin/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
	children,
}: {
	children: ReactNode;
}) {
	const authed = await isAdminAuthedCached();

	if (!authed) {
		return <>{children}</>;
	}

	return (
		<div className="relative min-h-screen">
			<div className="absolute inset-0 bg-line-grid opacity-30 pointer-events-none" />
			<div className="absolute top-[-200px] right-[-100px] size-[500px] rounded-full bg-[var(--color-accent)]/[0.05] blur-[120px] pointer-events-none" />

			<div className="relative z-10 flex min-h-screen">
				<Sidebar />
				<div className="flex-1 min-w-0 flex flex-col">
					<TopBar />
					<main className="flex-1 min-w-0">{children}</main>
				</div>
			</div>
		</div>
	);
}
