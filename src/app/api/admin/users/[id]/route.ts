import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin/auth";
import { deleteAdminUser } from "@/lib/admin/users";

export const runtime = "nodejs";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
	if (!(await isAdminAuthed())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { id } = await ctx.params;
	if (!id) {
		return NextResponse.json({ error: "Missing id" }, { status: 400 });
	}
	try {
		await deleteAdminUser(id);
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("admin delete user:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Delete failed" },
			{ status: 500 },
		);
	}
}
