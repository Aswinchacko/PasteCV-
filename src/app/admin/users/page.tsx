import { redirect } from "next/navigation";
import { isAdminAuthedCached } from "@/lib/admin/auth";
import { listAdminUsers } from "@/lib/admin/users";
import { UsersWorkspace } from "@/components/admin/UsersWorkspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
	if (!(await isAdminAuthedCached())) redirect("/admin/login");

	const users = await listAdminUsers();

	return (
		<div className="px-6 py-8 max-w-7xl mx-auto">
			<div className="rise-in mb-8 flex items-end justify-between flex-wrap gap-3">
				<div>
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
						People
					</div>
					<h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
						Signed-up users
					</h1>
					<p className="mt-2 text-white/55 text-[14px]">
						Everyone who&apos;s created an account on pastecv. Inspect activity,
						portfolio counts, and remove abusive accounts.
					</p>
				</div>
			</div>

			<div className="rise-in-delay-1">
				<UsersWorkspace users={users} />
			</div>
		</div>
	);
}
