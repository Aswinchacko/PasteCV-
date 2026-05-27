"use client";

import { Mail, Globe, X } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { useEditor } from "../editor/EditorProvider";
import { EditableText } from "../editor/EditableText";
import {
	AddButton,
	ItemControls,
	moveItem,
} from "../editor/ListControls";

function GithubIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
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

function ensureUrl(href: string): string {
	if (!href) return "";
	if (/^https?:\/\//i.test(href)) return href;
	if (href.includes("@")) return `mailto:${href}`;
	return `https://${href}`;
}

function SectionHeading({
	index,
	title,
	hint,
}: {
	index: string;
	title: string;
	hint?: string;
}) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
			<div className="flex items-baseline gap-3">
				<span className="font-mono text-[11px] text-white/35 tracking-tight">
					{index}
				</span>
				<h2 className="text-[15px] font-medium tracking-tight text-white/90">
					{title}
				</h2>
			</div>
			{hint && (
				<span className="font-mono text-[11px] text-white/30">{hint}</span>
			)}
		</div>
	);
}

export function LinearDarkTemplate() {
	const {
		data,
		patchData,
		setSkills,
		setExperience,
		setEducation,
		setProjects,
		setContact,
		isOwner,
		editMode,
	} = useEditor();

	const editing = isOwner && editMode;

	return (
		<main className="relative min-h-screen pb-32 overflow-hidden bg-ink-950 text-white">
			<div className="absolute inset-0 bg-line-grid opacity-40 pointer-events-none" />
			<div className="absolute top-[-220px] left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-[var(--color-accent)]/[0.06] blur-[140px] pointer-events-none" />

			<header className="relative z-10 max-w-3xl mx-auto px-6 pt-8 flex items-center justify-between">
				<Wordmark />
				<Link
					href="/"
					className="font-mono text-[11px] text-white/40 hover:text-white transition-colors"
				>
					← build your own
				</Link>
			</header>

			<div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 space-y-20">
				{/* Hero */}
				<section className="rise-in">
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
						Portfolio · /paste
					</div>
					<EditableText
						as="h1"
						value={data.name}
						onChange={(v) => patchData({ name: v })}
						placeholder="Your name"
						className="block mt-4 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.02]"
					/>
					<EditableText
						as="p"
						value={data.title}
						onChange={(v) => patchData({ title: v })}
						placeholder="Headline (e.g. Senior Product Designer)"
						className="block mt-3 text-xl text-white/55 tracking-tight"
						allowEmpty
					/>
					<EditableText
						multiline
						value={data.summary}
						onChange={(v) => patchData({ summary: v })}
						placeholder="One paragraph summary of who you are."
						className="block mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75"
						allowEmpty
					/>

					{editing ? (
						<div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
							<ContactInput
								icon={<Mail className="size-3.5" />}
								value={data.contact.email ?? ""}
								onChange={(v) =>
									setContact({ ...data.contact, email: v || undefined })
								}
								placeholder="email"
							/>
							<ContactInput
								icon={<LinkedinIcon className="size-3.5" />}
								value={data.contact.linkedin ?? ""}
								onChange={(v) =>
									setContact({ ...data.contact, linkedin: v || undefined })
								}
								placeholder="linkedin url"
							/>
							<ContactInput
								icon={<GithubIcon className="size-3.5" />}
								value={data.contact.github ?? ""}
								onChange={(v) =>
									setContact({ ...data.contact, github: v || undefined })
								}
								placeholder="github url"
							/>
							<ContactInput
								icon={<Globe className="size-3.5" />}
								value={data.contact.website ?? ""}
								onChange={(v) =>
									setContact({ ...data.contact, website: v || undefined })
								}
								placeholder="website"
							/>
						</div>
					) : (
						<div className="mt-7 flex flex-wrap gap-2">
							<ContactPill
								href={data.contact.email ?? ""}
								icon={<Mail className="size-3.5" />}
								label={data.contact.email ?? ""}
							/>
							<ContactPill
								href={data.contact.linkedin ?? ""}
								icon={<LinkedinIcon className="size-3.5" />}
								label="linkedin"
							/>
							<ContactPill
								href={data.contact.github ?? ""}
								icon={<GithubIcon className="size-3.5" />}
								label="github"
							/>
							<ContactPill
								href={data.contact.website ?? ""}
								icon={<Globe className="size-3.5" />}
								label="website"
							/>
						</div>
					)}
				</section>

				{/* Skills */}
				{(data.skills.length > 0 || editing) && (
					<section className="rise-in-delay-1">
						<SectionHeading index="01" title="Skills" />
						<div className="mt-6 flex flex-wrap gap-2">
							{data.skills.map((skill, i) => (
								<span
									key={`${skill}-${i}`}
									className="group inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/[0.04] border border-white/10 text-[12.5px] text-white/80 font-mono"
								>
									{editing ? (
										<input
											value={skill}
											onChange={(e) => {
												const next = [...data.skills];
												next[i] = e.target.value;
												setSkills(next);
											}}
											className="bg-transparent border-0 outline-none text-[12.5px] font-mono text-white/80 w-[var(--w)] max-w-[200px]"
											style={
												{
													"--w": `${Math.max(skill.length, 6)}ch`,
												} as React.CSSProperties
											}
										/>
									) : (
										<span>{skill}</span>
									)}
									{editing && (
										<button
											type="button"
											onClick={() =>
												setSkills(data.skills.filter((_, idx) => idx !== i))
											}
											className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-300"
										>
											<X className="size-3" />
										</button>
									)}
								</span>
							))}
							<AddButton onClick={() => setSkills([...data.skills, "New skill"])}>
								Add skill
							</AddButton>
						</div>
					</section>
				)}

				{/* Experience */}
				{(data.experience.length > 0 || editing) && (
					<section className="rise-in-delay-2">
						<SectionHeading
							index="02"
							title="Experience"
							hint={
								data.experience.length > 0
									? `${data.experience.length} role${data.experience.length === 1 ? "" : "s"}`
									: undefined
							}
						/>
						<div className="mt-8 relative">
							<div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent" />
							<ol className="space-y-10">
								{data.experience.map((job, i) => (
									<li key={i} className="relative pl-7 group">
										<span className="absolute left-0 top-2 size-2.5 rounded-full bg-ink-950 border-2 border-white/30 group-hover:border-[var(--color-accent)] transition-colors" />
										<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
											<EditableText
												as="h3"
												value={job.company}
												onChange={(v) => {
													const next = [...data.experience];
													next[i] = { ...next[i], company: v };
													setExperience(next);
												}}
												className="text-lg font-semibold tracking-tight"
												placeholder="Company"
											/>
											<EditableText
												value={job.duration}
												onChange={(v) => {
													const next = [...data.experience];
													next[i] = { ...next[i], duration: v };
													setExperience(next);
												}}
												className="font-mono text-[11px] text-white/40"
												placeholder="2023 – Present"
											/>
										</div>
										<EditableText
											as="p"
											value={job.role}
											onChange={(v) => {
												const next = [...data.experience];
												next[i] = { ...next[i], role: v };
												setExperience(next);
											}}
											className="block mt-0.5 text-sm text-white/55"
											placeholder="Role"
										/>
										{(job.points.length > 0 || editing) && (
											<ul className="mt-4 space-y-2">
												{job.points.map((p, j) => (
													<li key={j} className="flex gap-3 text-[15px] leading-relaxed text-white/75">
														<span className="mt-2 size-1 rounded-full bg-white/30 shrink-0" />
														<EditableText
															multiline
															value={p}
															onChange={(v) => {
																const next = [...data.experience];
																const newPoints = [...next[i].points];
																newPoints[j] = v;
																next[i] = { ...next[i], points: newPoints };
																setExperience(next);
															}}
															className="flex-1"
															placeholder="Accomplishment"
														/>
														{editing && (
															<button
																type="button"
																onClick={() => {
																	const next = [...data.experience];
																	next[i] = {
																		...next[i],
																		points: next[i].points.filter((_, idx) => idx !== j),
																	};
																	setExperience(next);
																}}
																className="text-white/30 hover:text-red-300 mt-1"
															>
																<X className="size-3.5" />
															</button>
														)}
													</li>
												))}
												{editing && (
													<li>
														<AddButton
															onClick={() => {
																const next = [...data.experience];
																next[i] = {
																	...next[i],
																	points: [...next[i].points, ""],
																};
																setExperience(next);
															}}
														>
															Add bullet
														</AddButton>
													</li>
												)}
											</ul>
										)}
										{editing && (
											<div className="mt-3">
												<ItemControls
													label={`Role ${i + 1}`}
													canMoveUp={i > 0}
													canMoveDown={i < data.experience.length - 1}
													onMoveUp={() =>
														setExperience(moveItem(data.experience, i, i - 1))
													}
													onMoveDown={() =>
														setExperience(moveItem(data.experience, i, i + 1))
													}
													onDelete={() =>
														setExperience(data.experience.filter((_, idx) => idx !== i))
													}
												/>
											</div>
										)}
									</li>
								))}
							</ol>
							{editing && (
								<div className="mt-6 pl-7">
									<AddButton
										onClick={() =>
											setExperience([
												...data.experience,
												{
													company: "Company",
													role: "Role",
													duration: "2024 – Present",
													points: [],
												},
											])
										}
									>
										Add role
									</AddButton>
								</div>
							)}
						</div>
					</section>
				)}

				{/* Projects */}
				{(data.projects.length > 0 || editing) && (
					<section className="rise-in-delay-3">
						<SectionHeading
							index="03"
							title="Projects"
							hint={
								data.projects.length > 0
									? `${data.projects.length} shipped`
									: undefined
							}
						/>
						<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
							{data.projects.map((p, i) => {
								const url = p.url ? ensureUrl(p.url) : null;
								const asLink = !!(url && !editing);
								const Wrapper: React.ElementType = asLink ? "a" : "div";
								const wrapperProps: React.HTMLAttributes<HTMLElement> &
									Record<string, string | undefined> = asLink
									? {
											href: url ?? undefined,
											target: "_blank",
											rel: "noopener noreferrer",
										}
									: {};
								return (
									<Wrapper
										key={i}
										{...wrapperProps}
										className={`group relative block glass rounded-2xl p-5 transition-all ${
											asLink ? "hover:border-[var(--color-accent)]/30 hover:-translate-y-0.5" : ""
										}`}
									>
										<EditableText
											as="h3"
											value={p.name}
											onChange={(v) => {
												const next = [...data.projects];
												next[i] = { ...next[i], name: v };
												setProjects(next);
											}}
											className="text-[16px] font-semibold tracking-tight"
											placeholder="Project name"
										/>
										<EditableText
											multiline
											value={p.description}
											onChange={(v) => {
												const next = [...data.projects];
												next[i] = { ...next[i], description: v };
												setProjects(next);
											}}
											className="block mt-2 text-sm leading-relaxed text-white/60"
											placeholder="One-line description"
											allowEmpty
										/>
										{editing ? (
											<EditableText
												value={p.url ?? ""}
												onChange={(v) => {
													const next = [...data.projects];
													next[i] = { ...next[i], url: v || undefined };
													setProjects(next);
												}}
												className="block mt-4 font-mono text-[11px] text-white/35 truncate"
												placeholder="https://project.url"
												allowEmpty
											/>
										) : (
											url && (
												<p className="mt-4 font-mono text-[11px] text-white/35 truncate">
													{url.replace(/^https?:\/\//, "")}
												</p>
											)
										)}
										{editing && (
											<div className="mt-3">
												<ItemControls
													label={`Project ${i + 1}`}
													canMoveUp={i > 0}
													canMoveDown={i < data.projects.length - 1}
													onMoveUp={() =>
														setProjects(moveItem(data.projects, i, i - 1))
													}
													onMoveDown={() =>
														setProjects(moveItem(data.projects, i, i + 1))
													}
													onDelete={() =>
														setProjects(data.projects.filter((_, idx) => idx !== i))
													}
												/>
											</div>
										)}
									</Wrapper>
								);
							})}
							{editing && (
								<AddButton
									onClick={() =>
										setProjects([
											...data.projects,
											{ name: "New project", description: "", url: undefined },
										])
									}
								>
									Add project
								</AddButton>
							)}
						</div>
					</section>
				)}

				{/* Education */}
				{(data.education.length > 0 || editing) && (
					<section className="rise-in-delay-2">
						<SectionHeading index="04" title="Education" />
						<div className="mt-6 space-y-4">
							{data.education.map((e, i) => (
								<div
									key={i}
									className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-4 last:border-b-0"
								>
									<div className="flex-1 min-w-0">
										<EditableText
											value={e.institution}
											onChange={(v) => {
												const next = [...data.education];
												next[i] = { ...next[i], institution: v };
												setEducation(next);
											}}
											className="block text-[15px] font-medium tracking-tight"
											placeholder="Institution"
										/>
										<EditableText
											value={e.degree}
											onChange={(v) => {
												const next = [...data.education];
												next[i] = { ...next[i], degree: v };
												setEducation(next);
											}}
											className="block text-sm text-white/55"
											placeholder="Degree"
										/>
									</div>
									<EditableText
										value={e.year ?? ""}
										onChange={(v) => {
											const next = [...data.education];
											next[i] = { ...next[i], year: v || undefined };
											setEducation(next);
										}}
										className="font-mono text-[11px] text-white/40 shrink-0"
										placeholder="Year"
										allowEmpty
									/>
									{editing && (
										<button
											type="button"
											onClick={() =>
												setEducation(data.education.filter((_, idx) => idx !== i))
											}
											className="text-white/30 hover:text-red-300"
										>
											<X className="size-3.5" />
										</button>
									)}
								</div>
							))}
							{editing && (
								<AddButton
									onClick={() =>
										setEducation([
											...data.education,
											{ institution: "Institution", degree: "Degree", year: undefined },
										])
									}
								>
									Add education
								</AddButton>
							)}
						</div>
					</section>
				)}
			</div>
		</main>
	);
}

function ContactPill({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) {
	if (!href) return null;
	return (
		<a
			href={ensureUrl(href)}
			target="_blank"
			rel="noopener noreferrer"
			className="group inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/[0.04] text-sm text-white/70 hover:text-white transition-all"
		>
			<span className="text-white/40 group-hover:text-[var(--color-accent)] transition-colors">
				{icon}
			</span>
			<span className="font-mono text-[12px]">{label}</span>
		</a>
	);
}

function ContactInput({
	icon,
	value,
	onChange,
	placeholder,
}: {
	icon: React.ReactNode;
	value: string;
	onChange: (v: string) => void;
	placeholder: string;
}) {
	return (
		<div className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-black/30 border border-white/10 text-sm text-white/70">
			<span className="text-white/40">{icon}</span>
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="flex-1 bg-transparent border-0 outline-none font-mono text-[12px] text-white placeholder:text-white/25"
			/>
		</div>
	);
}
