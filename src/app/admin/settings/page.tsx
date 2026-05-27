import { redirect } from "next/navigation";
import { Shield, Database, KeyRound } from "lucide-react";
import { isAdminAuthedCached } from "@/lib/admin/auth";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
	if (!(await isAdminAuthedCached())) redirect("/admin/login");

	return (
		<div className="px-6 py-8 max-w-3xl mx-auto">
			<div className="rise-in mb-8">
				<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
					Account
				</div>
				<h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
					Settings
				</h1>
				<p className="mt-2 text-white/55 text-[14px]">
					Manage your admin credentials and review session info.
				</p>
			</div>

			<div className="rise-in-delay-1 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
				<InfoCard
					icon={<Shield className="size-4" />}
					label="Account"
					value="admin"
				/>
				<InfoCard
					icon={<KeyRound className="size-4" />}
					label="Auth"
					value="scrypt + cookie"
				/>
				<InfoCard
					icon={<Database className="size-4" />}
					label="Storage"
					value="admin_config"
				/>
			</div>

			<div className="rise-in-delay-2 glass rounded-2xl p-6">
				<div className="mb-5">
					<h2 className="text-[15px] font-medium">Change password</h2>
					<p className="text-[13px] text-white/50 mt-1">
						You&apos;ll be signed out from all other sessions automatically.
					</p>
				</div>
				<ChangePasswordForm />
			</div>
		</div>
	);
}

function InfoCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="glass rounded-xl px-4 py-3">
			<div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-white/40">
				<span className="text-white/40">{icon}</span>
				{label}
			</div>
			<div className="mt-2 text-[14px] font-medium text-white/85">{value}</div>
		</div>
	);
}
