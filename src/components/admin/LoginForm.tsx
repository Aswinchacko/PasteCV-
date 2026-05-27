"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
	configured: boolean;
}

export function LoginForm({ configured }: LoginFormProps) {
	const router = useRouter();
	const [username, setUsername] = useState(configured ? "" : "admin");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);

		if (!configured) {
			if (password.length < 8) {
				setError("Password must be at least 8 characters");
				return;
			}
			if (password !== confirmPassword) {
				setError("Passwords do not match");
				return;
			}
		}

		setLoading(true);

		try {
			const res = await fetch("/api/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username,
					password,
					...(configured ? {} : { confirmPassword }),
				}),
			});

			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as {
					error?: string;
				};
				setError(body.error ?? "Login failed");
				setLoading(false);
				return;
			}

			router.replace("/admin");
			router.refresh();
		} catch (err) {
			console.error(err);
			setError("Network error");
			setLoading(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-3">
			<Field icon={<User className="size-4 text-white/40" />}>
				<input
					type="text"
					autoComplete="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
					disabled={!configured}
					className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30 disabled:opacity-70"
				/>
				{!configured && (
					<span className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/30">
						locked
					</span>
				)}
			</Field>

			<Field
				icon={
					configured ? (
						<Lock className="size-4 text-white/40" />
					) : (
						<KeyRound className="size-4 text-white/40" />
					)
				}
			>
				<input
					type="password"
					autoComplete={configured ? "current-password" : "new-password"}
					autoFocus={configured}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder={configured ? "Password" : "New password (min 8 chars)"}
					className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
				/>
			</Field>

			{!configured && (
				<Field icon={<KeyRound className="size-4 text-white/40" />}>
					<input
						type="password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm password"
						className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
					/>
				</Field>
			)}

			{error && (
				<div className="text-[13px] text-red-400/90 font-mono">{error}</div>
			)}

			<Button
				type="submit"
				loading={loading}
				icon={<ArrowRight className="size-4" />}
				className="w-full"
			>
				{loading
					? configured
						? "Signing in"
						: "Saving"
					: configured
						? "Sign in"
						: "Create & sign in"}
			</Button>

			{!configured && (
				<p className="text-[11px] text-white/35 font-mono leading-relaxed pt-2">
					This is a one-time setup. Whoever submits this form first becomes the
					admin — do it now.
				</p>
			)}
		</form>
	);
}

function Field({
	icon,
	children,
}: {
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="glass rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-[var(--color-accent)]/40 transition-colors">
			{icon}
			{children}
		</div>
	);
}
