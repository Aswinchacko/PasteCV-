import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin/auth";
import { deletePortfolio } from "@/lib/db/portfolios";

export const runtime = "nodejs";

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await isAdminAuthed())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		await deletePortfolio(id);
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("admin delete error:", err);
		return NextResponse.json({ error: "Delete failed" }, { status: 500 });
	}
}
