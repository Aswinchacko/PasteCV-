"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Search,
	Trash2,
	Eye,
	FileText,
	Calendar,
	ShieldCheck,
	Mail,
	X,
} from "lucide-react";
import type { AdminUserRow } from "@/lib/admin/users";
import { MailComposer } from "./MailComposer";

type SortKey = "createdAt" | "lastSignInAt" | "portfolioCount" | "totalViews";

interface Props {
	users: AdminUserRow[];
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

function fmtDate(iso: string | null): string {
	if (!iso) return "—";
	return dateFmt.format(new Date(iso));
}

function fmtRelative(iso: string | null): string {
	if (!iso) return "never";
	const d = new Date(iso).getTime();
	const diff = Date.now() - d;
	const day = 24 * 60 * 60 * 1000;
	if (diff < 60_000) return "just now";
	if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
	if (diff < day) return `${Math.floor(diff / (60 * 60_000))}h ago`;
	if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
	return fmtDate(iso);
}

function ProviderBadge({ provider }: { provider: string | null }) {
	const label = provider ?? "email";
	const color =
		provider === "google"
			? "bg-red-500/10 text-red-300 border-red-500/20"
			: provider === "github"
				? "bg-white/[0.06] text-white/80 border-white/15"
				: "bg-blue-500/10 text-blue-300 border-blue-500/20";
	return (
		<span
			className={`inline-flex items-center px-1.5 h-5 rounded text-[10px] font-mono uppercase tracking-wider border ${color}`}
		>
			{label}
		</span>
	);
}

export function UsersWorkspace({ users }: Props) {
	const router = useRouter();
	const [q, setQ] = useState("");
	const [sortKey, setSortKey] = useState<SortKey>("createdAt");
	const [deleting, setDeleting] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [mailTarget, setMailTarget] = useState<AdminUserRow | null>(null);

	const filtered = useMemo(() => {
		const needle = q.trim().toLowerCase();
		const list = needle
			? users.filter(
					(u) =>
						u.email?.toLowerCase().includes(needle) ||
						u.displayName?.toLowerCase().includes(needle) ||
						u.id.toLowerCase().includes(needle),
				)
			: users.slice();

		list.sort((a, b) => {
			if (sortKey === "createdAt") {
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			}
			if (sortKey === "lastSignInAt") {
				const at = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
				const bt = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
				return bt - at;
			}
			if (sortKey === "portfolioCount") {
				return b.portfolioCount - a.portfolioCount;
			}
			return b.totalViews - a.totalViews;
		});

		return list;
	}, [q, sortKey, users]);

	async function handleDelete(id: string) {
		setDeleting(id);
		try {
			const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error ?? "Delete failed");
			}
			setConfirmId(null);
			router.refresh();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Delete failed");
		} finally {
			setDeleting(null);
		}
	}

	const totalPortfolios = users.reduce((s, u) => s + u.portfolioCount, 0);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
				<MiniStat
					label="Total users"
					value={users.length.toLocaleString()}
					icon={<ShieldCheck className="size-4" />}
				/>
				<MiniStat
					label="With portfolios"
					value={users
						.filter((u) => u.portfolioCount > 0)
						.length.toLocaleString()}
					icon={<FileText className="size-4" />}
				/>
				<MiniStat
					label="Portfolios"
					value={totalPortfolios.toLocaleString()}
					icon={<FileText className="size-4" />}
				/>
				<MiniStat
					label="Last 7 days"
					value={users
						.filter(
							(u) =>
								Date.now() - new Date(u.createdAt).getTime() <
								7 * 24 * 60 * 60 * 1000,
						)
						.length.toLocaleString()}
					icon={<Calendar className="size-4" />}
				/>
			</div>

			<div className="glass rounded-2xl overflow-hidden">
				<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5">
					<div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-black/30 border border-white/10 flex-1 max-w-md">
						<Search className="size-4 text-white/30" />
						<input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Search by email, name, or id"
							className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none"
						/>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-[11px] font-mono text-white/40">sort:</span>
						<select
							value={sortKey}
							onChange={(e) => setSortKey(e.target.value as SortKey)}
							className="bg-black/40 border border-white/10 text-white text-[12px] rounded-lg h-9 px-2 focus:outline-none focus:border-[var(--color-accent)]/40"
						>
							<option value="createdAt">Newest</option>
							<option value="lastSignInAt">Recently active</option>
							<option value="portfolioCount">Most portfolios</option>
							<option value="totalViews">Most views</option>
						</select>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-[13px]">
						<thead>
							<tr className="text-left text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 border-b border-white/5">
								<th className="px-4 py-2.5 font-normal">User</th>
								<th className="px-4 py-2.5 font-normal">Provider</th>
								<th className="px-4 py-2.5 font-normal">Joined</th>
								<th className="px-4 py-2.5 font-normal">Last sign-in</th>
								<th className="px-4 py-2.5 font-normal text-right">
									Portfolios
								</th>
								<th className="px-4 py-2.5 font-normal text-right">Views</th>
								<th className="px-4 py-2.5 font-normal" />
							</tr>
						</thead>
						<tbody>
							{filtered.length === 0 && (
								<tr>
									<td
										colSpan={7}
										className="px-4 py-10 text-center text-white/40"
									>
										{q ? "No users match that search." : "No users yet."}
									</td>
								</tr>
							)}
							{filtered.map((u) => (
								<tr
									key={u.id}
									className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
								>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3 min-w-0">
											{u.avatarUrl ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={u.avatarUrl}
													alt=""
													className="size-8 rounded-full object-cover shrink-0"
												/>
											) : (
												<span className="size-8 inline-flex items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-[12px] font-semibold shrink-0">
													{(u.displayName || u.email || "U")
														.slice(0, 1)
														.toUpperCase()}
												</span>
											)}
											<div className="min-w-0">
												<div className="text-white font-medium truncate">
													{u.displayName ?? "—"}
												</div>
												<div className="text-white/50 text-[11px] font-mono truncate">
													{u.email ?? u.id}
												</div>
											</div>
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-1">
											{(u.providers.length > 0
												? u.providers
												: [u.provider ?? "email"]
											).map((p) => (
												<ProviderBadge key={p} provider={p} />
											))}
										</div>
									</td>
									<td className="px-4 py-3 text-white/65">
										{fmtDate(u.createdAt)}
									</td>
									<td className="px-4 py-3 text-white/65">
										{fmtRelative(u.lastSignInAt)}
									</td>
									<td className="px-4 py-3 text-right">
										<span className="inline-flex items-center gap-1 text-white">
											<FileText className="size-3 text-white/40" />
											{u.portfolioCount}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										<span className="inline-flex items-center gap-1 text-white/65 font-mono text-[12px]">
											<Eye className="size-3 text-white/40" />
											{u.totalViews.toLocaleString()}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										<div className="inline-flex items-center gap-1">
											<button
												type="button"
												onClick={() => setMailTarget(u)}
												disabled={!u.email}
												className="inline-flex items-center justify-center size-7 rounded-md text-white/40 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/40"
												title={
													u.email
														? `Send email to ${u.email}`
														: "User has no email"
												}
											>
												<Mail className="size-3.5" />
											</button>
											<button
												type="button"
												onClick={() => setConfirmId(u.id)}
												className="inline-flex items-center justify-center size-7 rounded-md text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-colors"
												title="Delete user"
											>
												<Trash2 className="size-3.5" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{mailTarget && mailTarget.email && (
				<MailComposer
					userId={mailTarget.id}
					recipientEmail={mailTarget.email}
					recipientName={mailTarget.displayName}
					onClose={() => setMailTarget(null)}
				/>
			)}

			{confirmId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
					<div className="w-full max-w-md glass rounded-2xl p-6">
						<div className="flex items-start justify-between gap-3 mb-3">
							<div>
								<h2 className="text-lg font-semibold tracking-tight">
									Delete this user?
								</h2>
								<p className="mt-1 text-[13px] text-white/55">
									This permanently removes the auth account and cascades to
									delete all their portfolios. Cannot be undone.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setConfirmId(null)}
								className="size-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.05] inline-flex items-center justify-center"
							>
								<X className="size-4" />
							</button>
						</div>
						<div className="text-[12px] font-mono bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/70 truncate">
							{users.find((u) => u.id === confirmId)?.email ?? confirmId}
						</div>
						<div className="mt-4 flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => setConfirmId(null)}
								disabled={deleting !== null}
								className="h-9 px-3 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => handleDelete(confirmId)}
								disabled={deleting !== null}
								className="h-9 px-3 rounded-lg text-[13px] font-medium bg-red-500/90 text-white hover:bg-red-500 transition-colors disabled:opacity-60"
							>
								{deleting ? "Deleting…" : "Delete user"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function MiniStat({
	label,
	value,
	icon,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
}) {
	return (
		<div className="glass rounded-xl px-4 py-3">
			<div className="flex items-center gap-2 text-white/40 font-mono text-[10px] uppercase tracking-[0.15em]">
				{icon}
				{label}
			</div>
			<div className="mt-1 text-xl font-semibold tracking-tight">{value}</div>
		</div>
	);
}
