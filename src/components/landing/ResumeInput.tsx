"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PLACEHOLDER = `Jane Cooper
Senior Product Designer · jane@cooper.dev · linkedin.com/in/janecooper

Summary
Product designer with 6+ years shipping consumer and B2B SaaS interfaces.
Led design at Linear's growth team. Previously at Stripe, Atlassian.

Experience
Linear — Senior Designer (2023–Present)
- Owned the Inbox redesign, lifted DAU/MAU 12%
- Built the public icon library used by 14k+ devs

Stripe — Product Designer (2020–2023)
- Shipped Checkout v3 across 35 markets

Education
B.Des, NID Ahmedabad, 2018

Skills
Figma, Prototyping, Motion, Design Systems, TypeScript, SwiftUI

Projects
Type Specimen — interactive showcase of variable fonts
https://type-specimen.app
`;

const SAMPLE = PLACEHOLDER;

const MIN_CHARS = 50;

interface ResumeInputProps {
	isAuthed: boolean;
}

export function ResumeInput({ isAuthed }: ResumeInputProps) {
	const router = useRouter();
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const charCount = text.trim().length;
	const isTooShort = charCount > 0 && charCount < MIN_CHARS;
	const canSubmit = charCount >= MIN_CHARS && !loading && isAuthed;

	async function handleSubmit() {
		if (charCount < MIN_CHARS || loading) return;
		if (!isAuthed) {
			try {
				sessionStorage.setItem("pastecv:pending-resume", text);
			} catch {
				// no-op (private mode etc.)
			}
			router.push("/login?next=" + encodeURIComponent("/"));
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/parse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ resumeText: text }),
			});
			const json = await res.json();
			if (res.status === 401) {
				try {
					sessionStorage.setItem("pastecv:pending-resume", text);
				} catch {
					// no-op
				}
				router.push("/login?next=" + encodeURIComponent("/"));
				return;
			}
			if (!res.ok) {
				setError(json.error ?? "Something went wrong");
				setLoading(false);
				return;
			}
			router.push(`/${json.slug}`);
		} catch (err) {
			console.error(err);
			setError("Network error. Check your connection and try again.");
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!isAuthed) return;
		try {
			const pending = sessionStorage.getItem("pastecv:pending-resume");
			if (pending) {
				setText(pending);
				sessionStorage.removeItem("pastecv:pending-resume");
			}
		} catch {
			// no-op
		}
	}, [isAuthed]);

	function loadSample() {
		setText(SAMPLE);
		setError(null);
	}

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			const inTextarea = target?.tagName === "TEXTAREA";
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && inTextarea) {
				e.preventDefault();
				if (canSubmit) void handleSubmit();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canSubmit, text]);

	return (
		<div className="w-full">
			<div className="glass rounded-2xl overflow-hidden">
				<div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
					<div className="flex items-center gap-2">
						<span className="size-2.5 rounded-full bg-red-400/70" />
						<span className="size-2.5 rounded-full bg-yellow-400/70" />
						<span className="size-2.5 rounded-full bg-green-400/70" />
					</div>
					<div className="font-mono text-[11px] text-white/40 tracking-tight">
						resume.txt
					</div>
					<button
						type="button"
						onClick={loadSample}
						className="font-mono text-[11px] text-white/40 hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5"
					>
						<Sparkles className="size-3" />
						load sample
					</button>
				</div>

				<textarea
					value={text}
					onChange={(e) => {
						setText(e.target.value);
						if (error) setError(null);
					}}
					placeholder={PLACEHOLDER}
					spellCheck={false}
					className="cv-scroll w-full h-[420px] resize-none px-6 py-5 bg-transparent text-[14px] leading-relaxed font-mono text-white/90 placeholder:text-white/20 focus:outline-none"
				/>

				<div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.015]">
					<div className="font-mono text-[11px] text-white/40 flex items-center gap-3">
						<span>
							{charCount.toLocaleString()} <span className="text-white/25">chars</span>
						</span>
						{isTooShort && (
							<span className="text-amber-300/80">
								need {MIN_CHARS - charCount} more
							</span>
						)}
					</div>
					<div className="font-mono text-[11px] text-white/30 hidden sm:block">
						⌘ ↵ to submit
					</div>
				</div>
			</div>

			{error && (
				<div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/[0.04] text-red-200">
					<AlertCircle className="size-4 mt-0.5 shrink-0" />
					<p className="text-sm">{error}</p>
				</div>
			)}

			<div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
				{isAuthed ? (
					<>
						<Button
							onClick={handleSubmit}
							loading={loading}
							disabled={!canSubmit}
							icon={<ArrowRight className="size-4" />}
							className="w-full sm:w-auto sm:min-w-[260px]"
						>
							{loading ? "Generating portfolio…" : "Generate my portfolio"}
						</Button>
						<p className="text-xs text-white/40 sm:ml-2">
							Free · ~12s to build · Edit anytime
						</p>
					</>
				) : (
					<>
						<Button
							onClick={handleSubmit}
							disabled={charCount < MIN_CHARS}
							icon={<Lock className="size-4" />}
							className="w-full sm:w-auto sm:min-w-[260px]"
						>
							Sign in with Google to generate
						</Button>
						<p className="text-xs text-white/40 sm:ml-2">
							One-click sign-in with Google. We&apos;ll bring you right back
							here with your resume still pasted.
						</p>
					</>
				)}
			</div>

		</div>
	);
}
