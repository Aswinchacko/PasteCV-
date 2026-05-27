import { redirect } from "next/navigation";
import { isAdminAuthedCached } from "@/lib/admin/auth";
import { listPortfoliosFull } from "@/lib/db/portfolios";
import { PortfolioWorkspace } from "@/components/admin/PortfolioWorkspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPortfoliosPage() {
	if (!(await isAdminAuthedCached())) redirect("/admin/login");

	const rows = await listPortfoliosFull();
	const renderedAt = Date.now();

	return (
		<div className="px-6 py-8 max-w-7xl mx-auto">
			<div className="rise-in mb-8 flex items-end justify-between flex-wrap gap-3">
				<div>
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
						Directory
					</div>
					<h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
						All portfolios
					</h1>
					<p className="mt-2 text-white/55 text-[14px]">
						Search, inspect, export, or remove any portfolio in the database.
					</p>
				</div>
			</div>

			<div className="rise-in-delay-1">
				<PortfolioWorkspace rows={rows} renderedAt={renderedAt} />
			</div>
		</div>
	);
}
