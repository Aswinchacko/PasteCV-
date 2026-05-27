"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	Search,
	ArrowUpDown,
	ExternalLink,
	Copy,
	Check,
	Trash2,
	Eye,
	Inbox,
	Download,
	Calendar,
	Filter,
} from "lucide-react";
import type { PortfolioRow } from "@/lib/db/portfolios";
import { PortfolioDrawer } from "./PortfolioDrawer";

type SortKey = "created_at" | "name" | "views";
type SortDir = "asc" | "desc";
type DateRange = "all" | "24h" | "7d" | "30d";

interface Props {
	rows: PortfolioRow[];
	renderedAt: number;
}

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function formatInt(n: number): string {
	return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function pad2(n: number): string {
	return String(n).padStart(2, "0");
}

function absoluteUtc(iso: string): string {
	const d = new Date(iso);
	return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}, ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())} UTC`;
}

function absoluteLocal(iso: string): string {
	const d = new Date(iso);
	return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function relative(iso: string, now: number): string {
	const diff = Math.max(0, now - new Date(iso).getTime());
	const m = Math.floor(diff / 60_000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	if (d < 30) return `${d}d ago`;
	const mo = Math.floor(d / 30);
	if (mo < 12) return `${mo}mo ago`;
	return `${Math.floor(mo / 12)}y ago`;
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DATE_RANGE_MS: Record<Exclude<DateRange, "all">, number> = {
	"24h": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
	"30d": 30 * 24 * 60 * 60 * 1000,
};

export function PortfolioWorkspace({ rows, renderedAt }: Props) {
	const router = useRouter();
	const [, startTransition] = useTransition();

	const [query, setQuery] = useState("");
	const [sortKey, setSortKey] = useState<SortKey>("created_at");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	const [range, setRange] = useState<DateRange>("all");
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [drawerRow, setDrawerRow] = useState<PortfolioRow | null>(null);
	const [hydratedAt, setHydratedAt] = useState<number | null>(null);

	useEffect(() => {
		setHydratedAt(Date.now());
	}, []);

	const displayNow = hydratedAt ?? renderedAt;

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		const cutoff =
			range === "all" ? 0 : displayNow - DATE_RANGE_MS[range];

		let list = rows.filter(
			(r) => range === "all" || new Date(r.created_at).getTime() >= cutoff,
		);

		if (q) {
			list = list.filter((r) => {
				const haystack = [
					r.name,
					r.slug,
					r.data?.title ?? "",
					r.data?.contact?.email ?? "",
					...(r.data?.skills ?? []),
				]
					.join(" ")
					.toLowerCase();
				return haystack.includes(q);
			});
		}

		list = [...list].sort((a, b) => {
			let cmp = 0;
			if (sortKey === "name") cmp = a.name.localeCompare(b.name);
			else if (sortKey === "views") cmp = (a.views ?? 0) - (b.views ?? 0);
			else
				cmp =
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
			return sortDir === "asc" ? cmp : -cmp;
		});

		return list;
	}, [rows, query, sortKey, sortDir, range, displayNow]);

	function toggleSort(key: SortKey) {
		if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
		else {
			setSortKey(key);
			setSortDir(key === "name" ? "asc" : "desc");
		}
	}

	function toggleSelectAll() {
		if (selected.size === filtered.length) setSelected(new Set());
		else setSelected(new Set(filtered.map((r) => r.id)));
	}

	function toggleSelect(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelected(next);
	}

	async function onCopy(slug: string, id: string) {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
			setCopiedId(id);
			setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
		} catch (e) {
			console.error("copy failed", e);
		}
	}

	async function onDelete(id: string, name: string) {
		if (!confirm(`Delete portfolio for "${name}"? This cannot be undone.`))
			return;
		setBusy(true);
		try {
			const res = await fetch(`/api/admin/portfolios/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("delete failed");
			setSelected((s) => {
				const next = new Set(s);
				next.delete(id);
				return next;
			});
			startTransition(() => router.refresh());
		} catch (e) {
			console.error(e);
			alert("Delete failed");
		} finally {
			setBusy(false);
		}
	}

	async function onBulkDelete() {
		if (selected.size === 0) return;
		if (
			!confirm(
				`Delete ${selected.size} portfolio${selected.size === 1 ? "" : "s"}? This cannot be undone.`,
			)
		)
			return;
		setBusy(true);
		try {
			const res = await fetch("/api/admin/portfolios", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids: [...selected] }),
			});
			if (!res.ok) throw new Error("bulk delete failed");
			setSelected(new Set());
			startTransition(() => router.refresh());
		} catch (e) {
			console.error(e);
			alert("Bulk delete failed");
		} finally {
			setBusy(false);
		}
	}

	function onExport() {
		const url = `/api/admin/export?range=${range}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
		window.open(url, "_blank");
	}

	const allChecked =
		filtered.length > 0 && selected.size === filtered.length;
	const someChecked = selected.size > 0 && !allChecked;

	return (
		<>
			<div className="glass rounded-2xl overflow-hidden">
				{/* Toolbar */}
				<div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 flex-wrap">
					<div className="flex-1 min-w-[240px] flex items-center gap-2 px-3 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] focus-within:border-[var(--color-accent)]/40 transition-colors">
						<Search className="size-4 text-white/40" />
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search name, slug, title, email, skills…"
							className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30"
						/>
						{query && (
							<button
								onClick={() => setQuery("")}
								className="text-[11px] font-mono text-white/40 hover:text-white/70"
							>
								clear
							</button>
						)}
					</div>

					<div className="flex items-center gap-1 px-1 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08]">
						<Calendar className="size-3.5 ml-2 text-white/40" />
						{(["all", "24h", "7d", "30d"] as const).map((r) => (
							<button
								key={r}
								onClick={() => setRange(r)}
								className={`px-2.5 h-8 rounded-md text-[12px] font-mono transition-colors ${
									range === r
										? "bg-white/[0.06] text-white"
										: "text-white/50 hover:text-white"
								}`}
							>
								{r}
							</button>
						))}
					</div>

					<button
						onClick={onExport}
						className="inline-flex items-center gap-2 px-3 h-10 rounded-lg text-[13px] text-white/70 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
					>
						<Download className="size-3.5" />
						<span>Export CSV</span>
					</button>
				</div>

				{/* Bulk action bar */}
				{selected.size > 0 && (
					<div className="px-4 py-2 border-b border-white/[0.06] bg-[var(--color-accent)]/[0.04] flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Filter className="size-3.5 text-[var(--color-accent)]" />
							<span className="text-[13px] font-mono">
								{selected.size} selected
							</span>
							<button
								onClick={() => setSelected(new Set())}
								className="text-[11px] font-mono text-white/40 hover:text-white"
							>
								clear
							</button>
						</div>
						<button
							onClick={onBulkDelete}
							disabled={busy}
							className="inline-flex items-center gap-2 px-3 h-8 rounded-md text-[12px] text-red-300 hover:text-red-200 border border-red-400/20 hover:border-red-400/40 bg-red-500/[0.05] hover:bg-red-500/[0.1] transition-all disabled:opacity-40"
						>
							<Trash2 className="size-3.5" />
							<span>Delete selected</span>
						</button>
					</div>
				)}

				{/* Header counts */}
				<div className="px-4 py-2 border-b border-white/[0.06] text-[11px] font-mono uppercase tracking-[0.12em] text-white/35 flex items-center justify-between">
					<span>{filtered.length} of {rows.length} portfolios</span>
					<span>
						{formatInt(filtered.reduce((s, r) => s + (r.views ?? 0), 0))}{" "}
						views in view
					</span>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/40 border-b border-white/[0.06]">
								<th className="pl-4 pr-2 py-3 w-10">
									<input
										type="checkbox"
										checked={allChecked}
										ref={(el) => {
											if (el) el.indeterminate = someChecked;
										}}
										onChange={toggleSelectAll}
										className="accent-[var(--color-accent)] cursor-pointer"
									/>
								</th>
								<Th
									onClick={() => toggleSort("name")}
									active={sortKey === "name"}
								>
									Person
								</Th>
								<th className="px-4 py-3 font-medium">Contact</th>
								<th className="px-4 py-3 font-medium">Skills</th>
								<Th
									onClick={() => toggleSort("views")}
									active={sortKey === "views"}
									align="right"
								>
									Views
								</Th>
								<Th
									onClick={() => toggleSort("created_at")}
									active={sortKey === "created_at"}
								>
									Created
								</Th>
								<th className="px-4 py-3 font-medium text-right">Actions</th>
							</tr>
						</thead>

						<tbody>
							{filtered.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-4 py-16 text-center">
										<div className="inline-flex flex-col items-center gap-3 text-white/40">
											<div className="size-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
												<Inbox className="size-5" />
											</div>
											<div className="text-[14px]">
												{rows.length === 0
													? "No portfolios yet."
													: "No matches for your filters."}
											</div>
										</div>
									</td>
								</tr>
							) : (
								filtered.map((r) => {
									const isSelected = selected.has(r.id);
									const isCopied = copiedId === r.id;
									const skills = r.data?.skills ?? [];
									const shownSkills = skills.slice(0, 3);
									const moreSkills = skills.length - shownSkills.length;

									return (
										<tr
											key={r.id}
											onClick={() => setDrawerRow(r)}
											className={`border-b border-white/[0.04] last:border-b-0 cursor-pointer transition-colors ${
												isSelected
													? "bg-[var(--color-accent)]/[0.04]"
													: "hover:bg-white/[0.015]"
											}`}
										>
											<td
												className="pl-4 pr-2 py-3 align-middle"
												onClick={(e) => e.stopPropagation()}
											>
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() => toggleSelect(r.id)}
													className="accent-[var(--color-accent)] cursor-pointer"
												/>
											</td>

											<td className="px-4 py-3 align-middle">
												<div className="flex items-center gap-3">
													<div className="size-9 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.06] flex items-center justify-center text-[12px] font-semibold text-white/80">
														{initials(r.name)}
													</div>
													<div className="min-w-0">
														<div className="text-[14px] font-medium text-white/90 truncate">
															{r.name}
														</div>
														<div className="text-[11px] font-mono text-white/35 truncate">
															/{r.slug}
														</div>
													</div>
												</div>
											</td>

											<td className="px-4 py-3 align-middle">
												<div className="text-[13px] text-white/70 truncate max-w-[180px]">
													{r.data?.title ?? "—"}
												</div>
												<div className="text-[11px] font-mono text-white/35 truncate max-w-[180px]">
													{r.data?.contact?.email ?? ""}
												</div>
											</td>

											<td className="px-4 py-3 align-middle">
												<div className="flex flex-wrap gap-1 max-w-[220px]">
													{shownSkills.map((s) => (
														<span
															key={s}
															className="inline-flex items-center px-1.5 h-5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-white/60"
														>
															{s}
														</span>
													))}
													{moreSkills > 0 && (
														<span className="inline-flex items-center px-1.5 h-5 rounded text-[10px] font-mono text-white/35">
															+{moreSkills}
														</span>
													)}
												</div>
											</td>

											<td className="px-4 py-3 align-middle text-right">
												<span className="inline-flex items-center gap-1.5 text-[13px] text-white/80 font-mono">
													<Eye className="size-3.5 text-white/40" />
													{formatInt(r.views ?? 0)}
												</span>
											</td>

											<td className="px-4 py-3 align-middle">
												<div
													className="text-[12px] text-white/70"
													title={
														hydratedAt
															? absoluteLocal(r.created_at)
															: absoluteUtc(r.created_at)
													}
												>
													{relative(r.created_at, displayNow)}
												</div>
											</td>

											<td
												className="px-4 py-3 align-middle"
												onClick={(e) => e.stopPropagation()}
											>
												<div className="flex items-center justify-end gap-1">
													<a
														href={`/${r.slug}`}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center justify-center size-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
														title="Open"
													>
														<ExternalLink className="size-3.5" />
													</a>
													<button
														onClick={() => onCopy(r.slug, r.id)}
														className="inline-flex items-center justify-center size-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
														title="Copy link"
													>
														{isCopied ? (
															<Check className="size-3.5 text-[var(--color-accent)]" />
														) : (
															<Copy className="size-3.5" />
														)}
													</button>
													<button
														onClick={() => onDelete(r.id, r.name)}
														disabled={busy}
														className="inline-flex items-center justify-center size-8 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/[0.08] transition-all disabled:opacity-40"
														title="Delete"
													>
														<Trash2 className="size-3.5" />
													</button>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{drawerRow && (
				<PortfolioDrawer
					row={drawerRow}
					onClose={() => setDrawerRow(null)}
					onDelete={() => {
						const r = drawerRow;
						setDrawerRow(null);
						onDelete(r.id, r.name);
					}}
				/>
			)}
		</>
	);
}

interface ThProps {
	children: React.ReactNode;
	onClick: () => void;
	active: boolean;
	align?: "left" | "right";
}

function Th({ children, onClick, active, align = "left" }: ThProps) {
	return (
		<th
			className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""}`}
		>
			<button
				onClick={onClick}
				className={`inline-flex items-center gap-1.5 hover:text-white/80 transition-colors ${active ? "text-white/80" : ""}`}
			>
				{children}
				<ArrowUpDown
					className={`size-3 ${active ? "text-[var(--color-accent)]" : "text-white/30"}`}
				/>
			</button>
		</th>
	);
}
