import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/db/client";

export interface AdminUserRow {
	id: string;
	email: string | null;
	displayName: string | null;
	avatarUrl: string | null;
	provider: string | null;
	providers: string[];
	createdAt: string;
	lastSignInAt: string | null;
	emailConfirmedAt: string | null;
	portfolioCount: number;
	totalViews: number;
	isBanned: boolean;
}

/**
 * Lists every Supabase Auth user joined with their portfolio counts.
 * Uses the service-role admin endpoint, so this MUST only be called from
 * admin-gated server contexts.
 *
 * Paginates internally up to 10k users (10 pages × 1000). Good enough for v1.
 */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
	const sb = getSupabase();

	const users: User[] = [];

	const perPage = 1000;
	for (let page = 1; page <= 10; page++) {
		const { data, error } = await sb.auth.admin.listUsers({ page, perPage });
		if (error) throw new Error(`admin.listUsers failed: ${error.message}`);
		users.push(...(data.users as User[]));
		if (data.users.length < perPage) break;
	}

	const { data: portfolioRows, error: pErr } = await sb
		.from("portfolios")
		.select("owner_id, views");
	if (pErr) throw new Error(`portfolios count failed: ${pErr.message}`);

	const countByOwner = new Map<string, { count: number; views: number }>();
	for (const row of portfolioRows ?? []) {
		const owner = row.owner_id as string;
		const v = (row.views as number | null) ?? 0;
		const prev = countByOwner.get(owner) ?? { count: 0, views: 0 };
		countByOwner.set(owner, { count: prev.count + 1, views: prev.views + v });
	}

	return users.map((u): AdminUserRow => {
		const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
		const displayName =
			(meta.full_name as string | undefined) ??
			(meta.name as string | undefined) ??
			(u.email ? u.email.split("@")[0] : null);
		const avatarUrl =
			(meta.avatar_url as string | undefined) ??
			(meta.picture as string | undefined) ??
			null;
		const stats = countByOwner.get(u.id) ?? { count: 0, views: 0 };
		const appMeta = (u.app_metadata ?? {}) as {
			provider?: string;
			providers?: string[];
		};
		return {
			id: u.id,
			email: u.email ?? null,
			displayName,
			avatarUrl,
			provider: appMeta.provider ?? null,
			providers: appMeta.providers ?? [],
			createdAt: u.created_at,
			lastSignInAt: u.last_sign_in_at ?? null,
			emailConfirmedAt: u.email_confirmed_at ?? null,
			portfolioCount: stats.count,
			totalViews: stats.views,
			isBanned: !!(u as { banned_until?: string | null }).banned_until,
		};
	});
}

export async function deleteAdminUser(id: string): Promise<void> {
	const { error } = await getSupabase().auth.admin.deleteUser(id);
	if (error) throw new Error(`admin.deleteUser failed: ${error.message}`);
}
