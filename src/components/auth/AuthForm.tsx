"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/auth/client";

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill="#EA4335"
				d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1S8.7 6 12 6c1.88 0 3.13.8 3.85 1.5l2.62-2.52C16.85 3.5 14.65 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12s4.26 9.5 9.5 9.5c5.48 0 9.1-3.85 9.1-9.27 0-.62-.07-1.1-.16-1.53H12Z"
			/>
		</svg>
	);
}

type Mode = "login" | "signup";

interface AuthFormProps {
	mode: Mode;
}

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();
	const params = useSearchParams();
	const nextParam = params.get("next") ?? "/";
	const siteUrl =
		process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
		(typeof window !== "undefined" ? window.location.origin : "");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState<"google" | "email" | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);

	const isLogin = mode === "login";

	async function handleEmail(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setInfo(null);
		setBusy("email");
		const sb = getSupabaseBrowser();

		try {
			if (isLogin) {
				const { error } = await sb.auth.signInWithPassword({ email, password });
				if (error) throw error;
				router.replace(nextParam);
				router.refresh();
				return;
			}

			const { data, error } = await sb.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextParam)}`,
				},
			});
			if (error) throw error;
			if (data.session) {
				router.replace(nextParam);
				router.refresh();
			} else {
				setInfo(
					"Check your inbox for a confirmation link. Once verified, sign in below.",
				);
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Something went wrong";
			setError(msg);
		} finally {
			setBusy(null);
		}
	}

	async function handleGoogle() {
		setError(null);
		setBusy("google");
		try {
			const sb = getSupabaseBrowser();
			const { error } = await sb.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextParam)}`,
				},
			});
			if (error) throw error;
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Google sign-in failed";
			setError(msg);
			setBusy(null);
		}
	}

	return (
		<div className="w-full max-w-md">
			<div className="rise-in text-center mb-10">
				<h1 className="text-4xl font-semibold tracking-[-0.03em]">
					{isLogin ? "Welcome back." : "Create your account."}
				</h1>
				<p className="mt-3 text-[15px] text-white/55">
					{isLogin
						? "Sign in to edit and manage your portfolios."
						: "You'll need an account to save and edit portfolios."}
				</p>
			</div>

			<div className="rise-in-delay-1 glass rounded-2xl p-6 space-y-4">
				<button
					type="button"
					onClick={handleGoogle}
					disabled={busy !== null}
					className="w-full inline-flex items-center justify-center gap-3 h-12 rounded-xl bg-white text-ink-950 font-medium text-[15px] hover:bg-white/90 transition-colors disabled:opacity-60"
				>
					<GoogleIcon className="size-4" />
					<span>
						{busy === "google"
							? "Redirecting…"
							: `${isLogin ? "Sign in" : "Sign up"} with Google`}
					</span>
				</button>

				<div className="flex items-center gap-3 text-[11px] font-mono text-white/30">
					<div className="flex-1 h-px bg-white/10" />
					<span>or with email</span>
					<div className="flex-1 h-px bg-white/10" />
				</div>

				<form onSubmit={handleEmail} className="space-y-3">
					<label className="block">
						<span className="block font-mono text-[11px] uppercase tracking-[0.15em] text-white/40 mb-1.5">
							Email
						</span>
						<div className="flex items-center gap-2 px-3 h-11 rounded-xl bg-black/30 border border-white/10 focus-within:border-[var(--color-accent)]/40 transition-colors">
							<Mail className="size-4 text-white/30" />
							<input
								type="email"
								required
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@domain.com"
								className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/25 focus:outline-none"
							/>
						</div>
					</label>

					<label className="block">
						<span className="block font-mono text-[11px] uppercase tracking-[0.15em] text-white/40 mb-1.5">
							Password
						</span>
						<div className="flex items-center gap-2 px-3 h-11 rounded-xl bg-black/30 border border-white/10 focus-within:border-[var(--color-accent)]/40 transition-colors">
							<Lock className="size-4 text-white/30" />
							<input
								type="password"
								required
								minLength={6}
								autoComplete={isLogin ? "current-password" : "new-password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={isLogin ? "your password" : "at least 6 chars"}
								className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/25 focus:outline-none"
							/>
						</div>
					</label>

					{error && (
						<div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-red-500/20 bg-red-500/[0.04] text-red-200 text-[13px]">
							<AlertCircle className="size-4 mt-0.5 shrink-0" />
							<span>{error}</span>
						</div>
					)}

					{info && (
						<div className="px-3 py-2.5 rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] text-[var(--color-accent-soft)] text-[13px]">
							{info}
						</div>
					)}

					<Button
						type="submit"
						loading={busy === "email"}
						disabled={busy !== null}
						icon={<ArrowRight className="size-4" />}
						className="w-full"
					>
						{busy === "email"
							? isLogin
								? "Signing in…"
								: "Creating account…"
							: isLogin
								? "Sign in"
								: "Create account"}
					</Button>
				</form>
			</div>

			<p className="rise-in-delay-2 mt-6 text-center text-sm text-white/50">
				{isLogin ? (
					<>
						Don&apos;t have an account?{" "}
						<Link
							href={`/signup${nextParam !== "/" ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
							className="text-[var(--color-accent)] hover:text-[var(--color-accent-soft)] font-medium"
						>
							Sign up
						</Link>
					</>
				) : (
					<>
						Already have an account?{" "}
						<Link
							href={`/login${nextParam !== "/" ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
							className="text-[var(--color-accent)] hover:text-[var(--color-accent-soft)] font-medium"
						>
							Sign in
						</Link>
					</>
				)}
			</p>
		</div>
	);
}
