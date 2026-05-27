"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
	if (cached) return cached;

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
	if (!anon) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");

	cached = createBrowserClient(url, anon);
	return cached;
}
