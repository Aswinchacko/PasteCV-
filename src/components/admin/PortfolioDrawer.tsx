"use client";

import { useEffect } from "react";
import {
	X,
	ExternalLink,
	Mail,
	Globe,
	Trash2,
	Eye,
	Calendar,
	Briefcase,
	GraduationCap,
	FolderGit2,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
			/>
		</svg>
	);
}

function LinkedinIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.356V9h3.414v1.561h.048c.476-.9 1.637-1.852 3.37-1.852 3.602 0 4.268 2.37 4.268 5.455v6.288ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
		</svg>
	);
}
import type { PortfolioRow } from "@/lib/db/portfolios";

interface Props {
	row: PortfolioRow;
	onClose: () => void;
	onDelete: () => void;
}

export function PortfolioDrawer({ row, onClose, onDelete }: Props) {
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [onClose]);

	const data = row.data;

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm fade-in-fast"
				onClick={onClose}
			/>

			<div className="relative w-full max-w-xl h-full bg-[var(--color-ink-950)] border-l border-white/[0.08] overflow-y-auto slide-in-right">
				<div className="sticky top-0 z-10 px-6 h-16 flex items-center justify-between bg-[var(--color-ink-950)]/95 backdrop-blur-md border-b border-white/[0.06]">
					<div className="flex items-center gap-2">
						<span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
							Portfolio detail
						</span>
					</div>
					<div className="flex items-center gap-1">
						<a
							href={`/${row.slug}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center size-9 rounded-lg text-white/55 hover:text-white border border-white/10 hover:border-white/20 transition-all"
							title="Open public page"
						>
							<ExternalLink className="size-4" />
						</a>
						<button
							onClick={onDelete}
							className="inline-flex items-center justify-center size-9 rounded-lg text-white/40 hover:text-red-400 border border-white/10 hover:border-red-400/30 hover:bg-red-500/[0.05] transition-all"
							title="Delete"
						>
							<Trash2 className="size-4" />
						</button>
						<button
							onClick={onClose}
							className="inline-flex items-center justify-center size-9 rounded-lg text-white/55 hover:text-white border border-white/10 hover:border-white/20 transition-all"
						>
							<X className="size-4" />
						</button>
					</div>
				</div>

				<div className="px-6 py-6">
					<div className="flex items-start gap-4 mb-6">
						<div className="size-14 rounded-xl bg-gradient-to-br from-white/[0.1] to-white/[0.02] border border-white/[0.08] flex items-center justify-center text-lg font-semibold text-white/85">
							{initials(row.name)}
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-2xl font-semibold tracking-[-0.02em] truncate">
								{row.name}
							</h2>
							{data?.title && (
								<p className="text-[14px] text-white/55 mt-1">{data.title}</p>
							)}
							<div className="mt-2 font-mono text-[11px] text-white/35">
								/{row.slug}
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2 mb-6">
						<MetaCard
							icon={<Eye className="size-3.5" />}
							label="Views"
							value={(row.views ?? 0).toLocaleString()}
						/>
						<MetaCard
							icon={<Calendar className="size-3.5" />}
							label="Created"
							value={new Date(row.created_at).toLocaleDateString(undefined, {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						/>
					</div>

					{data?.summary && (
						<Section title="Summary">
							<p className="text-[13.5px] leading-relaxed text-white/70">
								{data.summary}
							</p>
						</Section>
					)}

					{data?.contact && hasContact(data.contact) && (
						<Section title="Contact">
							<div className="space-y-2">
								<ContactRow
									icon={<Mail className="size-3.5" />}
									value={data.contact.email}
								/>
								<ContactRow
									icon={<LinkedinIcon className="size-3.5" />}
									value={data.contact.linkedin}
								/>
								<ContactRow
									icon={<GithubIcon className="size-3.5" />}
									value={data.contact.github}
								/>
								<ContactRow
									icon={<Globe className="size-3.5" />}
									value={data.contact.website}
								/>
							</div>
						</Section>
					)}

					{(data?.skills ?? []).length > 0 && (
						<Section title={`Skills (${data!.skills.length})`}>
							<div className="flex flex-wrap gap-1.5">
								{data!.skills.map((s) => (
									<span
										key={s}
										className="inline-flex items-center px-2 h-6 rounded-md text-[11px] font-mono bg-white/[0.04] border border-white/[0.06] text-white/70"
									>
										{s}
									</span>
								))}
							</div>
						</Section>
					)}

					{(data?.experience ?? []).length > 0 && (
						<Section
							title="Experience"
							icon={<Briefcase className="size-3.5" />}
						>
							<div className="space-y-3">
								{data!.experience.map((exp, i) => (
									<div
										key={i}
										className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
									>
										<div className="flex items-baseline justify-between gap-2">
											<div className="text-[13.5px] font-medium text-white/90">
												{exp.role}
											</div>
											<div className="text-[11px] font-mono text-white/35">
												{exp.duration}
											</div>
										</div>
										<div className="text-[12.5px] text-white/55 mb-2">
											{exp.company}
										</div>
										{exp.points.length > 0 && (
											<ul className="space-y-1">
												{exp.points.map((pt, j) => (
													<li
														key={j}
														className="text-[12px] text-white/60 leading-snug pl-3 relative before:absolute before:left-0 before:top-[7px] before:size-1 before:rounded-full before:bg-white/30"
													>
														{pt}
													</li>
												))}
											</ul>
										)}
									</div>
								))}
							</div>
						</Section>
					)}

					{(data?.projects ?? []).length > 0 && (
						<Section
							title="Projects"
							icon={<FolderGit2 className="size-3.5" />}
						>
							<div className="space-y-2">
								{data!.projects.map((p, i) => (
									<div
										key={i}
										className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
									>
										<div className="flex items-baseline justify-between gap-2">
											<div className="text-[13px] font-medium text-white/90">
												{p.name}
											</div>
											{p.url && (
												<a
													href={p.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-white/40 hover:text-[var(--color-accent)]"
												>
													<ExternalLink className="size-3.5" />
												</a>
											)}
										</div>
										<div className="text-[12px] text-white/55 mt-1">
											{p.description}
										</div>
									</div>
								))}
							</div>
						</Section>
					)}

					{(data?.education ?? []).length > 0 && (
						<Section
							title="Education"
							icon={<GraduationCap className="size-3.5" />}
						>
							<div className="space-y-2">
								{data!.education.map((e, i) => (
									<div
										key={i}
										className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
									>
										<div className="text-[13px] font-medium text-white/90">
											{e.degree}
										</div>
										<div className="text-[12px] text-white/55 flex items-center gap-2">
											<span>{e.institution}</span>
											{e.year && (
												<>
													<span className="text-white/20">·</span>
													<span className="font-mono text-[11px] text-white/40">
														{e.year}
													</span>
												</>
											)}
										</div>
									</div>
								))}
							</div>
						</Section>
					)}

					<div className="mt-8 text-[10px] font-mono uppercase tracking-[0.18em] text-white/25">
						ID · {row.id}
					</div>
				</div>
			</div>
		</div>
	);
}

function Section({
	title,
	icon,
	children,
}: {
	title: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="mb-6">
			<div className="flex items-center gap-2 mb-3">
				{icon && <span className="text-white/40">{icon}</span>}
				<h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
					{title}
				</h3>
			</div>
			{children}
		</div>
	);
}

function MetaCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
			<div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white/40">
				{icon}
				{label}
			</div>
			<div className="mt-1 text-[15px] font-semibold tracking-tight">
				{value}
			</div>
		</div>
	);
}

function ContactRow({
	icon,
	value,
}: {
	icon: React.ReactNode;
	value?: string;
}) {
	if (!value) return null;
	const href = /^https?:\/\//i.test(value)
		? value
		: value.includes("@")
			? `mailto:${value}`
			: `https://${value}`;
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center gap-2 text-[12.5px] text-white/65 hover:text-white transition-colors"
		>
			<span className="text-white/35">{icon}</span>
			<span className="font-mono truncate">{value}</span>
		</a>
	);
}

function hasContact(c: {
	email?: string;
	linkedin?: string;
	github?: string;
	website?: string;
}) {
	return Boolean(c.email || c.linkedin || c.github || c.website);
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
