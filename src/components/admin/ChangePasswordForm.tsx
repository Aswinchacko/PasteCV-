"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ChangePasswordForm() {
	const router = useRouter();
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		if (next.length < 8) {
			setError("New password must be at least 8 characters");
			return;
		}
		if (next !== confirm) {
			setError("New passwords do not match");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/admin/password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ current, next }),
			});

			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				setError(body.error ?? "Failed to update password");
				setLoading(false);
				return;
			}

			setSuccess(true);
			setCurrent("");
			setNext("");
			setConfirm("");
			setLoading(false);

			setTimeout(() => router.refresh(), 600);
		} catch (err) {
			console.error(err);
			setError("Network error");
			setLoading(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-3">
			<Field icon={<Lock className="size-4 text-white/40" />}>
				<input
					type="password"
					autoComplete="current-password"
					value={current}
					onChange={(e) => setCurrent(e.target.value)}
					placeholder="Current password"
					className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
				/>
			</Field>

			<Field icon={<KeyRound className="size-4 text-white/40" />}>
				<input
					type="password"
					autoComplete="new-password"
					value={next}
					onChange={(e) => setNext(e.target.value)}
					placeholder="New password (min 8 chars)"
					className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
				/>
			</Field>

			<Field icon={<KeyRound className="size-4 text-white/40" />}>
				<input
					type="password"
					autoComplete="new-password"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					placeholder="Confirm new password"
					className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
				/>
			</Field>

			{error && (
				<div className="text-[13px] text-red-400/90 font-mono">{error}</div>
			)}
			{success && (
				<div className="inline-flex items-center gap-2 text-[13px] text-[var(--color-accent)] font-mono">
					<Check className="size-3.5" />
					Password updated. Other sessions are now invalid.
				</div>
			)}

			<div className="pt-1">
				<Button type="submit" loading={loading}>
					{loading ? "Saving" : "Update password"}
				</Button>
			</div>
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
		<div className="rounded-lg bg-white/[0.02] border border-white/[0.08] px-3 h-12 flex items-center gap-3 focus-within:border-[var(--color-accent)]/40 transition-colors">
			{icon}
			{children}
		</div>
	);
}
