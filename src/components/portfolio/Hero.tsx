import { Mail, Globe } from "lucide-react";
import type { ResumeData } from "@/lib/ai/schema";

function GithubIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
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
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
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

interface ContactLinkProps {
	href: string;
	icon: React.ReactNode;
	label: string;
}

function ContactLink({ href, icon, label }: ContactLinkProps) {
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

export function Hero({ data }: { data: ResumeData }) {
	const { name, title, summary, contact } = data;

	return (
		<section className="rise-in">
			<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
				Portfolio · /paste
			</div>
			<h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.02]">
				{name}
			</h1>
			{title && (
				<p className="mt-3 text-xl text-white/55 tracking-tight">{title}</p>
			)}
			{summary && (
				<p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75">
					{summary}
				</p>
			)}

			<div className="mt-7 flex flex-wrap gap-2">
				<ContactLink
					href={contact.email ?? ""}
					icon={<Mail className="size-3.5" />}
					label={contact.email ?? ""}
				/>
				<ContactLink
					href={contact.linkedin ?? ""}
					icon={<LinkedinIcon className="size-3.5" />}
					label="linkedin"
				/>
				<ContactLink
					href={contact.github ?? ""}
					icon={<GithubIcon className="size-3.5" />}
					label="github"
				/>
				<ContactLink
					href={contact.website ?? ""}
					icon={<Globe className="size-3.5" />}
					label="website"
				/>
			</div>
		</section>
	);
}
