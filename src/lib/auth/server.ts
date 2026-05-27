import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

function getEnv() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
	if (!anon) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
	return { url, anon };
}

/**
 * Supabase client bound to the current request's cookies.
 * Use in RSC, Route Handlers, and Server Actions — RLS applies to this client,
 * so RLS policies are what enforce per-user authorization.
 */
export async function getSupabaseServer(): Promise<SupabaseClient> {
	const { url, anon } = getEnv();
	const store = await cookies();

	return createServerClient(url, anon, {
		cookies: {
			getAll() {
				return store.getAll();
			},
			setAll(toSet) {
				try {
					for (const { name, value, options } of toSet) {
						store.set(name, value, options);
					}
				} catch {
					// Called from a RSC where cookies are read-only; safe to ignore.
					// The session refresh middleware/route handler will eventually
					// persist any rotated tokens.
				}
			},
		},
	});
}
