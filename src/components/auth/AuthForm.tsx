"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
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
	const params = useSearchParams();
	const nextParam = params.get("next") ?? "/";
	const siteUrl =
		process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
		(typeof window !== "undefined" ? window.location.origin : "");

	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const isLogin = mode === "login";

	async function handleGoogle() {
		setError(null);
		setBusy(true);
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
			setBusy(false);
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
						? "Sign in with Google to edit and manage your portfolios."
						: "Sign in with Google to save and edit portfolios. Takes about five seconds."}
				</p>
			</div>

			<div className="rise-in-delay-1 glass rounded-2xl p-6 space-y-4">
				<button
					type="button"
					onClick={handleGoogle}
					disabled={busy}
					className="w-full inline-flex items-center justify-center gap-3 h-12 rounded-xl bg-white text-ink-950 font-medium text-[15px] hover:bg-white/90 transition-colors disabled:opacity-60"
				>
					<GoogleIcon className="size-4" />
					<span>
						{busy
							? "Redirecting…"
							: `Continue with Google`}
					</span>
				</button>

				{error && (
					<div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-red-500/20 bg-red-500/[0.04] text-red-200 text-[13px]">
						<AlertCircle className="size-4 mt-0.5 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				<p className="text-center text-[12px] text-white/40 leading-relaxed pt-1">
					By continuing, you agree to use your Google account to sign in to
					pastecv. We only read your name, email and avatar.
				</p>
			</div>
		</div>
	);
}
