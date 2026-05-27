import { redirect } from "next/navigation";
import {
	BarChart3,
	Eye,
	Users,
	TrendingUp,
	ArrowUpRight,
} from "lucide-react";
import { isAdminAuthedCached } from "@/lib/admin/auth";
import { listPortfoliosFull } from "@/lib/db/portfolios";
import { StatCard } from "@/components/admin/StatCard";
import { TimelineChart } from "@/components/admin/TimelineChart";
import { TopPerformers } from "@/components/admin/TopPerformers";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { SkillsCloud } from "@/components/admin/SkillsCloud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function daysAgo(n: number): Date {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - n);
	return d;
}

export default async function AdminOverviewPage() {
	if (!(await isAdminAuthedCached())) redirect("/admin/login");

	const rows = await listPortfoliosFull();
	const renderedAt = Date.now();

	const summaries = rows.map((r) => ({
		id: r.id,
		slug: r.slug,
		name: r.name,
		views: r.views ?? 0,
		created_at: r.created_at,
		title: r.data?.title ?? null,
		email: r.data?.contact?.email ?? null,
	}));

	const total = rows.length;
	const totalViews = rows.reduce((s, r) => s + (r.views ?? 0), 0);
	const avgViews = total > 0 ? Math.round(totalViews / total) : 0;

	const weekAgo = daysAgo(7);
	const prevWeekStart = daysAgo(14);

	const last7d = rows.filter((r) => new Date(r.created_at) >= weekAgo).length;
	const prev7d = rows.filter((r) => {
		const t = new Date(r.created_at);
		return t >= prevWeekStart && t < weekAgo;
	}).length;

	const growthPct =
		prev7d === 0 ? (last7d > 0 ? 100 : 0) : Math.round(((last7d - prev7d) / prev7d) * 100);

	const createdAt = rows.map((r) => r.created_at);

	return (
		<div className="px-6 py-8 max-w-7xl mx-auto">
			<div className="rise-in mb-8">
				<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
					Dashboard · overview
				</div>
				<h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
					Welcome back, admin.
				</h1>
				<p className="mt-2 text-white/55 text-[14px] max-w-xl">
					Live metrics for every portfolio created through PasteCV.
				</p>
			</div>

			<div className="rise-in-delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
				<StatCard
					label="Total portfolios"
					value={total.toLocaleString()}
					hint="All-time"
					icon={<Users className="size-4" />}
				/>
				<StatCard
					label="Total views"
					value={totalViews.toLocaleString()}
					hint="Aggregate impressions"
					icon={<Eye className="size-4" />}
				/>
				<StatCard
					label="Avg views"
					value={avgViews.toLocaleString()}
					hint="Per portfolio"
					icon={<BarChart3 className="size-4" />}
				/>
				<StatCard
					label="Last 7 days"
					value={last7d.toLocaleString()}
					hint={
						<span
							className={`inline-flex items-center gap-1 ${growthPct >= 0 ? "text-[var(--color-accent)]" : "text-red-400/80"}`}
						>
							<ArrowUpRight
								className={`size-3 ${growthPct < 0 ? "rotate-90" : ""}`}
							/>
							{growthPct >= 0 ? "+" : ""}
							{growthPct}% vs prev week
						</span>
					}
					icon={<TrendingUp className="size-4" />}
				/>
			</div>

			<div className="rise-in-delay-2 grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
				<div className="lg:col-span-2">
					<TimelineChart createdAt={createdAt} days={30} renderedAt={renderedAt} />
				</div>
				<RecentActivity portfolios={summaries} />
			</div>

			<div className="rise-in-delay-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
				<TopPerformers portfolios={summaries} />
				<SkillsCloud portfolios={rows} />
			</div>
		</div>
	);
}
