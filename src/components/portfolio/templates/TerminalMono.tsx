"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEditor } from "../editor/EditorProvider";
import { EditableText } from "../editor/EditableText";
import { AddButton, moveItem } from "../editor/ListControls";

const PROMPT = "user@pastecv:~$";

function HR({ label }: { label?: string }) {
	return (
		<div className="my-8 flex items-center gap-2 text-emerald-400/60 font-mono text-[11px]">
			<span>┌</span>
			<span className="flex-1 border-t border-emerald-500/30" />
			{label && (
				<>
					<span className="px-2 text-emerald-300/80">[ {label} ]</span>
					<span className="flex-1 border-t border-emerald-500/30" />
				</>
			)}
			<span>┐</span>
		</div>
	);
}

export function TerminalMonoTemplate() {
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
		<main className="relative min-h-screen pb-32 bg-black text-emerald-100 font-mono">
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.06]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(0deg, rgba(110,255,140,0.4) 0 1px, transparent 1px 3px)",
				}}
			/>

			<header className="relative z-10 max-w-3xl mx-auto px-6 pt-8 flex items-center justify-between text-[12px]">
				<Link
					href="/"
					className="text-emerald-400 hover:text-emerald-200 transition-colors"
				>
					~/pastecv
				</Link>
				<span className="text-emerald-500/60">
					~ tty/{data.name.toLowerCase().replace(/\s+/g, "_")}
				</span>
			</header>

			<article className="relative z-10 max-w-3xl mx-auto px-6 pt-12">
				{/* Hero — fake terminal */}
				<section className="rise-in">
					<div className="text-[12px] text-emerald-400/70">
						<span>{PROMPT}</span> <span className="text-emerald-200">cat resume.md</span>
					</div>
					<div className="mt-4 text-[12px] text-emerald-500/60">
						# {data.name.toUpperCase()}
					</div>
					<EditableText
						as="h1"
						value={data.name}
						onChange={(v) => patchData({ name: v })}
						placeholder="Your name"
						className="block mt-1 text-4xl sm:text-5xl font-bold text-emerald-50 tracking-tight"
					/>
					<div className="mt-2 flex flex-wrap items-baseline gap-2 text-[13px]">
						<span className="text-emerald-500/70">$ role:</span>
						<EditableText
							value={data.title}
							onChange={(v) => patchData({ title: v })}
							placeholder="title"
							className="text-emerald-200"
							allowEmpty
						/>
					</div>
					<div className="mt-4">
						<div className="text-[12px] text-emerald-500/60 mb-1">{`/* about */`}</div>
						<EditableText
							multiline
							value={data.summary}
							onChange={(v) => patchData({ summary: v })}
							placeholder="// a paragraph about yourself"
							className="block text-[14px] leading-relaxed text-emerald-100/85"
							allowEmpty
						/>
					</div>

					<div className="mt-6">
						<div className="text-[12px] text-emerald-500/60 mb-2">{`/* contact */`}</div>
						{editing ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{(
									[
										["email", data.contact.email],
										["linkedin", data.contact.linkedin],
										["github", data.contact.github],
										["website", data.contact.website],
									] as const
								).map(([key, val]) => (
									<div
										key={key}
										className="flex items-center gap-2 px-2 h-8 rounded bg-emerald-950/40 border border-emerald-700/30 text-[12px]"
									>
										<span className="text-emerald-500/70 w-16">{key}:</span>
										<input
											value={val ?? ""}
											onChange={(e) =>
												setContact({
													...data.contact,
													[key]: e.target.value || undefined,
												})
											}
											className="flex-1 bg-transparent border-0 outline-none text-emerald-100"
										/>
									</div>
								))}
							</div>
						) : (
							<ul className="space-y-0.5 text-[13px]">
								{data.contact.email && (
									<li>
										<span className="text-emerald-500/70 mr-2">email:</span>
										<a
											href={`mailto:${data.contact.email}`}
											className="text-emerald-200 hover:text-emerald-100 underline underline-offset-4 decoration-emerald-700/50"
										>
											{data.contact.email}
										</a>
									</li>
								)}
								{data.contact.linkedin && (
									<li>
										<span className="text-emerald-500/70 mr-2">linkedin:</span>
										<a
											href={ensureUrl(data.contact.linkedin)}
											target="_blank"
											rel="noopener noreferrer"
											className="text-emerald-200 hover:text-emerald-100 underline underline-offset-4 decoration-emerald-700/50"
										>
											{data.contact.linkedin}
										</a>
									</li>
								)}
								{data.contact.github && (
									<li>
										<span className="text-emerald-500/70 mr-2">github:</span>
										<a
											href={ensureUrl(data.contact.github)}
											target="_blank"
											rel="noopener noreferrer"
											className="text-emerald-200 hover:text-emerald-100 underline underline-offset-4 decoration-emerald-700/50"
										>
											{data.contact.github}
										</a>
									</li>
								)}
								{data.contact.website && (
									<li>
										<span className="text-emerald-500/70 mr-2">web:</span>
										<a
											href={ensureUrl(data.contact.website)}
											target="_blank"
											rel="noopener noreferrer"
											className="text-emerald-200 hover:text-emerald-100 underline underline-offset-4 decoration-emerald-700/50"
										>
											{data.contact.website}
										</a>
									</li>
								)}
							</ul>
						)}
					</div>
				</section>

				{/* Skills */}
				{(data.skills.length > 0 || editing) && (
					<section className="rise-in-delay-1">
						<HR label="skills" />
						<div className="text-[12px] text-emerald-500/60 mb-2">
							{`> ls -la /skills`}
						</div>
						<div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px]">
							{data.skills.map((skill, i) => (
								<span
									key={`${skill}-${i}`}
									className="inline-flex items-center gap-1 text-emerald-100"
								>
									<span className="text-emerald-500/60">·</span>
									{editing ? (
										<>
											<input
												value={skill}
												onChange={(e) => {
													const next = [...data.skills];
													next[i] = e.target.value;
													setSkills(next);
												}}
												className="bg-transparent border-0 outline-none border-b border-dashed border-emerald-700 focus:border-emerald-300 text-emerald-100"
												style={
													{ width: `${Math.max(skill.length, 6)}ch` } as React.CSSProperties
												}
											/>
											<button
												type="button"
												onClick={() =>
													setSkills(data.skills.filter((_, idx) => idx !== i))
												}
												className="text-emerald-700 hover:text-red-400"
											>
												<X className="size-3" />
											</button>
										</>
									) : (
										<span>{skill}</span>
									)}
								</span>
							))}
							{editing && (
								<AddTermButton
									onClick={() => setSkills([...data.skills, "new_skill"])}
								>
									+ skill
								</AddTermButton>
							)}
						</div>
					</section>
				)}

				{/* Experience */}
				{(data.experience.length > 0 || editing) && (
					<section className="rise-in-delay-2">
						<HR label="experience" />
						<div className="text-[12px] text-emerald-500/60 mb-2">
							{`> git log --pretty=oneline /experience`}
						</div>
						<ol className="space-y-6 text-[13px]">
							{data.experience.map((job, i) => (
								<li key={i}>
									<div className="flex flex-wrap items-baseline justify-between gap-2">
										<div className="flex items-baseline gap-2">
											<span className="text-emerald-500/60">
												{String(i + 1).padStart(2, "0")}.
											</span>
											<EditableText
												value={job.company}
												onChange={(v) => {
													const next = [...data.experience];
													next[i] = { ...next[i], company: v };
													setExperience(next);
												}}
												className="font-bold text-emerald-50"
												placeholder="company"
											/>
											<span className="text-emerald-500/60">/</span>
											<EditableText
												value={job.role}
												onChange={(v) => {
													const next = [...data.experience];
													next[i] = { ...next[i], role: v };
													setExperience(next);
												}}
												className="text-emerald-200"
												placeholder="role"
											/>
										</div>
										<EditableText
											value={job.duration}
											onChange={(v) => {
												const next = [...data.experience];
												next[i] = { ...next[i], duration: v };
												setExperience(next);
											}}
											className="text-[11px] text-emerald-500/70"
											placeholder="duration"
										/>
									</div>
									{(job.points.length > 0 || editing) && (
										<ul className="mt-2 pl-7 space-y-1 text-emerald-100/85">
											{job.points.map((p, j) => (
												<li key={j} className="flex gap-2">
													<span className="text-emerald-500/60">→</span>
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
														placeholder="accomplishment"
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
															className="text-emerald-700 hover:text-red-400"
														>
															<X className="size-3" />
														</button>
													)}
												</li>
											))}
											{editing && (
												<li>
													<AddTermButton
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
													</AddTermButton>
												</li>
											)}
										</ul>
									)}
									{editing && (
										<div className="mt-2 pl-7">
											<TermItemControls
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
							<div className="mt-4">
								<AddTermButton
									onClick={() =>
										setExperience([
											...data.experience,
											{ company: "company", role: "role", duration: "", points: [] },
										])
									}
								>
									+ role
								</AddTermButton>
							</div>
						)}
					</section>
				)}

				{/* Projects */}
				{(data.projects.length > 0 || editing) && (
					<section className="rise-in-delay-3">
						<HR label="projects" />
						<div className="text-[12px] text-emerald-500/60 mb-2">
							{`> find /projects -name "*.shipped"`}
						</div>
						<div className="space-y-4 text-[13px]">
							{data.projects.map((p, i) => {
								const url = p.url ? ensureUrl(p.url) : null;
								return (
									<div key={i} className="border border-emerald-700/20 rounded-md p-3">
										<div className="flex items-baseline justify-between gap-2">
											<EditableText
												value={p.name}
												onChange={(v) => {
													const next = [...data.projects];
													next[i] = { ...next[i], name: v };
													setProjects(next);
												}}
												className="font-bold text-emerald-50"
												placeholder="project_name"
											/>
											{url && !editing && (
												<a
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-[11px] text-emerald-400 hover:text-emerald-200"
												>
													{`>> open`}
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
											className="block mt-1 text-emerald-100/85"
											placeholder="description"
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
													className="block mt-2 text-[11px] text-emerald-500/70"
													placeholder="https://"
													allowEmpty
												/>
												<div className="mt-2">
													<TermItemControls
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
										{!editing && url && (
											<div className="mt-1 text-[11px] text-emerald-500/70">
												{url.replace(/^https?:\/\//, "")}
											</div>
										)}
									</div>
								);
							})}
							{editing && (
								<AddTermButton
									onClick={() =>
										setProjects([
											...data.projects,
											{ name: "new_project", description: "", url: undefined },
										])
									}
								>
									+ project
								</AddTermButton>
							)}
						</div>
					</section>
				)}

				{/* Education */}
				{(data.education.length > 0 || editing) && (
					<section className="rise-in-delay-2">
						<HR label="education" />
						<ul className="space-y-2 text-[13px]">
							{data.education.map((e, i) => (
								<li key={i} className="flex flex-wrap items-baseline justify-between gap-2">
									<div className="flex items-baseline gap-2 flex-1 min-w-0">
										<span className="text-emerald-500/60">·</span>
										<EditableText
											value={e.institution}
											onChange={(v) => {
												const next = [...data.education];
												next[i] = { ...next[i], institution: v };
												setEducation(next);
											}}
											className="font-bold text-emerald-50"
											placeholder="institution"
										/>
										<span className="text-emerald-500/60">—</span>
										<EditableText
											value={e.degree}
											onChange={(v) => {
												const next = [...data.education];
												next[i] = { ...next[i], degree: v };
												setEducation(next);
											}}
											className="text-emerald-100/85"
											placeholder="degree"
										/>
									</div>
									<EditableText
										value={e.year ?? ""}
										onChange={(v) => {
											const next = [...data.education];
											next[i] = { ...next[i], year: v || undefined };
											setEducation(next);
										}}
										className="text-[11px] text-emerald-500/70"
										placeholder="year"
										allowEmpty
									/>
									{editing && (
										<button
											type="button"
											onClick={() =>
												setEducation(data.education.filter((_, idx) => idx !== i))
											}
											className="text-emerald-700 hover:text-red-400"
										>
											<X className="size-3" />
										</button>
									)}
								</li>
							))}
							{editing && (
								<li>
									<AddTermButton
										onClick={() =>
											setEducation([
												...data.education,
												{ institution: "institution", degree: "degree" },
											])
										}
									>
										+ education
									</AddTermButton>
								</li>
							)}
						</ul>
					</section>
				)}

				<div className="mt-12 text-[12px] text-emerald-500/60">
					<span>{PROMPT}</span>{" "}
					<span className="bg-emerald-300/80 text-black px-0.5 animate-[pulse-dot_1.2s_ease-in-out_infinite]">
						_
					</span>
				</div>
			</article>
		</main>
	);
}

function ensureUrl(href: string): string {
	if (!href) return "";
	if (/^https?:\/\//i.test(href)) return href;
	if (href.includes("@")) return `mailto:${href}`;
	return `https://${href}`;
}

function AddTermButton({
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
			className="inline-flex items-center h-7 px-2 rounded text-[11px] text-emerald-400 border border-dashed border-emerald-700/50 hover:border-emerald-300 hover:text-emerald-100 transition-colors"
		>
			{children}
		</button>
	);
}

function TermItemControls({
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
		<div className="inline-flex items-center gap-2 text-[11px] text-emerald-500/70">
			<button
				type="button"
				onClick={onMoveUp}
				disabled={!canMoveUp}
				className="hover:text-emerald-200 disabled:opacity-30"
			>
				↑
			</button>
			<button
				type="button"
				onClick={onMoveDown}
				disabled={!canMoveDown}
				className="hover:text-emerald-200 disabled:opacity-30"
			>
				↓
			</button>
			<button
				type="button"
				onClick={onDelete}
				className="hover:text-red-400"
			>
				rm
			</button>
		</div>
	);
}
