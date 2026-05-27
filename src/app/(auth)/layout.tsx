import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AuthGroupLayout({
	children,
}: {
	children: ReactNode;
}) {
	const user = await getCurrentUser();
	if (user) redirect("/");

	return (
		<main className="relative min-h-screen overflow-hidden flex flex-col">
			<div className="absolute inset-0 bg-line-grid opacity-40 pointer-events-none" />
			<div className="absolute top-[-220px] left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-[var(--color-accent)]/[0.07] blur-[140px] pointer-events-none" />

			<header className="relative z-10 max-w-6xl w-full mx-auto px-6 pt-8">
				<Wordmark />
			</header>

			<div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
				{children}
			</div>
		</main>
	);
}
