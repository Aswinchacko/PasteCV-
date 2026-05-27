import { redirect } from "next/navigation";
import { isAdminAuthedCached, isAdminConfigured } from "@/lib/admin/auth";
import { Wordmark } from "@/components/ui/Wordmark";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
	if (await isAdminAuthedCached()) redirect("/admin");

	const configured = await isAdminConfigured();

	return (
		<main className="relative min-h-screen overflow-hidden flex flex-col">
			<div className="absolute inset-0 bg-line-grid opacity-60 pointer-events-none" />
			<div className="absolute top-[-200px] left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[var(--color-accent)]/10 blur-[120px] pointer-events-none" />

			<header className="relative z-10 max-w-6xl w-full mx-auto px-6 pt-8">
				<Wordmark />
			</header>

			<section className="relative z-10 flex-1 flex items-center justify-center px-6">
				<div className="w-full max-w-sm">
					<div className="rise-in inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-white/70 font-mono">
						<span className="size-1.5 rounded-full bg-[var(--color-accent)]" />
						{configured ? "Admin · restricted" : "Admin · first-time setup"}
					</div>

					<h1 className="rise-in-delay-1 text-3xl font-semibold tracking-[-0.03em] mb-2">
						{configured ? "Sign in" : "Create admin password"}
					</h1>
					<p className="rise-in-delay-2 text-white/55 text-[14px] mb-8">
						{configured
							? "Username is admin. Enter your password to continue."
							: "Choose a strong password now — it's stored hashed and used for every future sign-in."}
					</p>

					<div className="rise-in-delay-3">
						<LoginForm configured={configured} />
					</div>
				</div>
			</section>

			<footer className="relative z-10 max-w-6xl w-full mx-auto px-6 pb-10 text-center text-[11px] font-mono text-white/30">
				pastecv · admin
			</footer>
		</main>
	);
}
