"use client";

import { Mail, Globe, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEditor } from "../editor/EditorProvider";
import { EditableText } from "../editor/EditableText";
import { AddButton, ItemControls, moveItem } from "../editor/ListControls";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-3 mb-6">
			<div className="h-px flex-1 bg-zinc-300" />
			<span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
				{children}
			</span>
			<div className="h-px flex-1 bg-zinc-300" />
		</div>
	);
}

export function PaperLightTemplate() {
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
		<main className="relative min-h-screen pb-32 bg-zinc-50 text-zinc-900 font-sans">
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.04]"
				style={{
					backgroundImage:
						"radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)",
					backgroundSize: "24px 24px",
				}}
			/>

			<header className="relative z-10 max-w-2xl mx-auto px-8 pt-10 flex items-center justify-between">
				<Link
					href="/"
					className="text-[13px] font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
				>
					← pastecv
				</Link>
				<span className="text-[11px] font-mono text-zinc-400 tracking-tight">
					/{data.name.toLowerCase().replace(/\s+/g, "-")}
				</span>
			</header>

			<article className="relative z-10 max-w-2xl mx-auto px-8 pt-20">
				{/* Hero */}
				<header className="rise-in text-center pb-12 border-b border-zinc-200">
					<EditableText
						as="h1"
						value={data.name}
						onChange={(v) => patchData({ name: v })}
						placeholder="Your name"
						className="block text-5xl sm:text-6xl font-serif font-medium tracking-[-0.02em] leading-[1.05] text-zinc-900"
						style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
					/>
					<EditableText
						as="p"
						value={data.title}
						onChange={(v) => patchData({ title: v })}
						placeholder="Title"
						className="block mt-3 text-base tracking-wide text-zinc-500 italic font-serif"
						style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
						allowEmpty
					/>
					<EditableText
						multiline
						value={data.summary}
						onChange={(v) => patchData({ summary: v })}
						placeholder="A paragraph about who you are and what you do."
						className="block mt-6 mx-auto max-w-xl text-[16px] leading-[1.7] text-zinc-700"
						allowEmpty
					/>

					{editing ? (
						<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-md mx-auto">
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
						<div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-zinc-600 font-mono">
							<ContactInline
								href={data.contact.email ?? ""}
								icon={<Mail className="size-3.5" />}
								label={data.contact.email ?? ""}
							/>
							<ContactInline
								href={data.contact.linkedin ?? ""}
								icon={<LinkedinIcon className="size-3.5" />}
								label="linkedin"
							/>
							<ContactInline
								href={data.contact.github ?? ""}
								icon={<GithubIcon className="size-3.5" />}
								label="github"
							/>
							<ContactInline
								href={data.contact.website ?? ""}
								icon={<Globe className="size-3.5" />}
								label="website"
							/>
						</div>
					)}
				</header>

				{/* Skills */}
				{(data.skills.length > 0 || editing) && (
					<section className="mt-16 rise-in-delay-1">
						<SectionLabel>Skills</SectionLabel>
						<div className="flex flex-wrap gap-x-2 gap-y-1.5 justify-center">
							{data.skills.map((skill, i) => (
								<span
									key={`${skill}-${i}`}
									className="group inline-flex items-center gap-1.5 text-[14px] text-zinc-700"
								>
									{editing ? (
										<>
											<input
												value={skill}
												onChange={(e) => {
													const next = [...data.skills];
													next[i] = e.target.value;
													setSkills(next);
												}}
												className="bg-transparent border-0 outline-none text-[14px] text-zinc-700 border-b border-dashed border-zinc-300 focus:border-zinc-900"
												style={
													{ width: `${Math.max(skill.length, 6)}ch` } as React.CSSProperties
												}
											/>
											<button
												type="button"
												onClick={() =>
													setSkills(data.skills.filter((_, idx) => idx !== i))
												}
												className="text-zinc-400 hover:text-red-500"
											>
												<X className="size-3" />
											</button>
										</>
									) : (
										<>
											<span>{skill}</span>
											{i < data.skills.length - 1 && (
												<span className="text-zinc-300">·</span>
											)}
										</>
									)}
								</span>
							))}
							{editing && (
								<AddPaperButton
									onClick={() => setSkills([...data.skills, "New skill"])}
								>
									+ skill
								</AddPaperButton>
							)}
						</div>
					</section>
				)}

				{/* Experience */}
				{(data.experience.length > 0 || editing) && (
					<section className="mt-16 rise-in-delay-2">
						<SectionLabel>Experience</SectionLabel>
						<ol className="space-y-10">
							{data.experience.map((job, i) => (
								<li key={i}>
									<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
										<EditableText
											as="h3"
											value={job.company}
											onChange={(v) => {
												const next = [...data.experience];
												next[i] = { ...next[i], company: v };
												setExperience(next);
											}}
											className="text-xl font-serif font-medium tracking-tight text-zinc-900"
											style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
											placeholder="Company"
										/>
										<EditableText
											value={job.duration}
											onChange={(v) => {
												const next = [...data.experience];
												next[i] = { ...next[i], duration: v };
												setExperience(next);
											}}
											className="font-mono text-[11px] text-zinc-500"
											placeholder="Duration"
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
										className="block mt-0.5 text-[14px] italic text-zinc-600"
										placeholder="Role"
									/>
									{(job.points.length > 0 || editing) && (
										<ul className="mt-4 space-y-2">
											{job.points.map((p, j) => (
												<li
													key={j}
													className="flex gap-3 text-[15px] leading-relaxed text-zinc-700"
												>
													<span className="mt-[10px] size-1 rounded-full bg-zinc-400 shrink-0" />
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
															className="text-zinc-400 hover:text-red-500 mt-1"
														>
															<X className="size-3.5" />
														</button>
													)}
												</li>
											))}
											{editing && (
												<li>
													<AddPaperButton
														onClick={() => {
															const next = [...data.experience];
															next[i] = {
																...next[i],
																points: [...next[i].points, ""],
															};
															setExperience(next);
														}}
													>
														+ bullet
													</AddPaperButton>
												</li>
											)}
										</ul>
									)}
									{editing && (
										<div className="mt-3">
											<PaperItemControls
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
							<div className="mt-6">
								<AddPaperButton
									onClick={() =>
										setExperience([
											...data.experience,
											{ company: "Company", role: "Role", duration: "", points: [] },
										])
									}
								>
									+ role
								</AddPaperButton>
							</div>
						)}
					</section>
				)}

				{/* Projects */}
				{(data.projects.length > 0 || editing) && (
					<section className="mt-16 rise-in-delay-3">
						<SectionLabel>Projects</SectionLabel>
						<div className="space-y-6">
							{data.projects.map((p, i) => {
								const url = p.url ? ensureUrl(p.url) : null;
								return (
									<div key={i} className="group">
										<div className="flex items-baseline justify-between gap-3">
											<EditableText
												as="h3"
												value={p.name}
												onChange={(v) => {
													const next = [...data.projects];
													next[i] = { ...next[i], name: v };
													setProjects(next);
												}}
												className="text-[17px] font-serif font-medium tracking-tight text-zinc-900"
												style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
												placeholder="Project name"
											/>
											{url && !editing && (
												<a
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-[12px] font-mono text-zinc-500 hover:text-zinc-900"
												>
													visit <ExternalLink className="size-3" />
												</a>
											)}
										</div>
										<EditableText
											multiline
											value={p.description}
											onChange={(v) => {
												const next = [...data.projects];
												next[i] = { ...next[i], description: v };
												setProjects(next);
											}}
											className="block mt-1 text-[15px] leading-relaxed text-zinc-700"
											placeholder="Description"
											allowEmpty
										/>
										{editing && (
											<>
												<EditableText
													value={p.url ?? ""}
													onChange={(v) => {
														const next = [...data.projects];
														next[i] = { ...next[i], url: v || undefined };
														setProjects(next);
													}}
													className="block mt-2 font-mono text-[12px] text-zinc-500"
													placeholder="https://project.url"
													allowEmpty
												/>
												<div className="mt-2">
													<PaperItemControls
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
											</>
										)}
									</div>
								);
							})}
							{editing && (
								<AddPaperButton
									onClick={() =>
										setProjects([
											...data.projects,
											{ name: "New project", description: "", url: undefined },
										])
									}
								>
									+ project
								</AddPaperButton>
							)}
						</div>
					</section>
				)}

				{/* Education */}
				{(data.education.length > 0 || editing) && (
					<section className="mt-16 rise-in-delay-2">
						<SectionLabel>Education</SectionLabel>
						<div className="space-y-4">
							{data.education.map((e, i) => (
								<div
									key={i}
									className="flex items-baseline justify-between gap-4"
								>
									<div className="flex-1 min-w-0">
										<EditableText
											value={e.institution}
											onChange={(v) => {
												const next = [...data.education];
												next[i] = { ...next[i], institution: v };
												setEducation(next);
											}}
											className="block text-[15px] font-medium text-zinc-900"
											placeholder="Institution"
										/>
										<EditableText
											value={e.degree}
											onChange={(v) => {
												const next = [...data.education];
												next[i] = { ...next[i], degree: v };
												setEducation(next);
											}}
											className="block text-[14px] italic text-zinc-600"
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
										className="font-mono text-[11px] text-zinc-500 shrink-0"
										placeholder="Year"
										allowEmpty
									/>
									{editing && (
										<button
											type="button"
											onClick={() =>
												setEducation(data.education.filter((_, idx) => idx !== i))
											}
											className="text-zinc-400 hover:text-red-500"
										>
											<X className="size-3.5" />
										</button>
									)}
								</div>
							))}
							{editing && (
								<AddPaperButton
									onClick={() =>
										setEducation([
											...data.education,
											{ institution: "Institution", degree: "Degree" },
										])
									}
								>
									+ education
								</AddPaperButton>
							)}
						</div>
					</section>
				)}

				<footer className="mt-20 pt-8 border-t border-zinc-200 text-center text-[11px] font-mono text-zinc-400">
					Made with pastecv · paste, parse, publish
				</footer>
			</article>
		</main>
	);
}

function ContactInline({
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
			className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors"
		>
			<span className="text-zinc-400">{icon}</span>
			<span>{label}</span>
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
		<div className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-white border border-zinc-200 text-sm text-zinc-700">
			<span className="text-zinc-400">{icon}</span>
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="flex-1 bg-transparent border-0 outline-none font-mono text-[12px] text-zinc-900 placeholder:text-zinc-400"
			/>
		</div>
	);
}

function AddPaperButton({
	onClick,
	children,
}: {
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center h-7 px-2.5 rounded text-[12px] font-mono text-zinc-500 border border-dashed border-zinc-300 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
		>
			{children}
		</button>
	);
}

function PaperItemControls({
	onDelete,
	onMoveUp,
	onMoveDown,
	canMoveUp,
	canMoveDown,
}: {
	onDelete: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
}) {
	return (
		<div className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500">
			<button
				type="button"
				onClick={onMoveUp}
				disabled={!canMoveUp}
				className="hover:text-zinc-900 disabled:opacity-30 px-1.5"
			>
				↑
			</button>
			<button
				type="button"
				onClick={onMoveDown}
				disabled={!canMoveDown}
				className="hover:text-zinc-900 disabled:opacity-30 px-1.5"
			>
				↓
			</button>
			<button
				type="button"
				onClick={onDelete}
				className="hover:text-red-500 px-1.5"
			>
				delete
			</button>
		</div>
	);
}
