import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin/auth";
import { deletePortfolios } from "@/lib/db/portfolios";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
	if (!(await isAdminAuthed())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let ids: string[] = [];
	try {
		const body = (await req.json()) as { ids?: unknown };
		if (!Array.isArray(body.ids))
			return NextResponse.json({ error: "ids must be array" }, { status: 400 });
		ids = body.ids.filter((x): x is string => typeof x === "string");
	} catch {
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}

	if (ids.length === 0) {
		return NextResponse.json({ error: "No ids provided" }, { status: 400 });
	}

	try {
		await deletePortfolios(ids);
		return NextResponse.json({ ok: true, deleted: ids.length });
	} catch (err) {
		console.error("admin bulk delete error:", err);
		return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 });
	}
}
