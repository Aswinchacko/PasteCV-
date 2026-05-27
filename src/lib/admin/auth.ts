import {
	createHash,
	randomBytes,
	scrypt as scryptCb,
	timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSupabase } from "@/lib/db/client";

const scrypt = promisify(scryptCb) as (
	password: string,
	salt: Buffer,
	keylen: number,
) => Promise<Buffer>;

export const ADMIN_COOKIE = "pastecv_admin";
export const ADMIN_USERNAME = "admin";

// ---------------------------------------------------------------------------
// Supabase table required (run once in the SQL editor):
//
//   create table if not exists admin_config (
//     id smallint primary key default 1,
//     password_hash text not null,
//     updated_at timestamptz not null default now(),
//     constraint admin_config_singleton check (id = 1)
//   );
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const derived = await scrypt(password, salt, 64);
	return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyHashed(
	password: string,
	stored: string,
): Promise<boolean> {
	const [scheme, saltHex, hashHex] = stored.split("$");
	if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

	const salt = Buffer.from(saltHex, "hex");
	const expected = Buffer.from(hashHex, "hex");

	let derived: Buffer;
	try {
		derived = await scrypt(password, salt, expected.length);
	} catch {
		return false;
	}

	if (derived.length !== expected.length) return false;
	return timingSafeEqual(derived, expected);
}

export async function getStoredHash(): Promise<string | null> {
	const { data, error } = await getSupabase()
		.from("admin_config")
		.select("password_hash")
		.eq("id", 1)
		.maybeSingle();

	if (error) {
		console.error("admin_config read error:", error.message);
		return null;
	}

	return (data?.password_hash as string | undefined) ?? null;
}

export async function setStoredHash(hash: string): Promise<void> {
	const { error } = await getSupabase().from("admin_config").upsert({
		id: 1,
		password_hash: hash,
		updated_at: new Date().toISOString(),
	});
	if (error) throw new Error(`admin_config write failed: ${error.message}`);
}

export async function isAdminConfigured(): Promise<boolean> {
	return (await getStoredHash()) !== null;
}

export function verifyUsername(input: string): boolean {
	const a = Buffer.from(input);
	const b = Buffer.from(ADMIN_USERNAME);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

export function deriveSessionToken(passwordHash: string): string {
	return createHash("sha256")
		.update(`pastecv:session:${passwordHash}`)
		.digest("hex");
}

async function checkAdminAuthed(): Promise<boolean> {
	try {
		const store = await cookies();
		const token = store.get(ADMIN_COOKIE)?.value;
		if (!token) return false;

		const hash = await getStoredHash();
		if (!hash) return false;

		const expected = deriveSessionToken(hash);
		const a = Buffer.from(token);
		const b = Buffer.from(expected);
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	} catch {
		return false;
	}
}

export const isAdminAuthed = checkAdminAuthed;
export const isAdminAuthedCached = cache(checkAdminAuthed);
