import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "./server";

export interface CurrentUser {
	id: string;
	email: string | null;
	displayName: string | null;
	avatarUrl: string | null;
	provider: string | null;
}

async function _getCurrentUser(): Promise<CurrentUser | null> {
	try {
		const sb = await getSupabaseServer();
		const { data, error } = await sb.auth.getUser();
		if (error || !data.user) return null;
		const u = data.user;
		const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
		const name =
			(meta.full_name as string | undefined) ??
			(meta.name as string | undefined) ??
			(u.email ? u.email.split("@")[0] : null);
		const avatar =
			(meta.avatar_url as string | undefined) ??
			(meta.picture as string | undefined) ??
			null;
		return {
			id: u.id,
			email: u.email ?? null,
			displayName: name ?? null,
			avatarUrl: avatar,
			provider: u.app_metadata?.provider ?? null,
		};
	} catch {
		return null;
	}
}

/** Cached per-request so multiple RSCs don't hit auth.getUser() repeatedly. */
export const getCurrentUser = cache(_getCurrentUser);

export async function requireUser(redirectTo = "/login"): Promise<CurrentUser> {
	const user = await getCurrentUser();
	if (!user) redirect(redirectTo);
	return user;
}
