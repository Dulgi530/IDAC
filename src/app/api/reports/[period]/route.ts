import { NextResponse } from "next/server";
import { authorizeWrite } from "@/lib/access";
import { deleteReport, loadReport } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** GET /api/reports/{period} — 리포트 원본 JSON. 퍼블릭 조회 가능. */
export async function GET(_request: Request, context: { params: Promise<{ period: string }> }) {
  const { period } = await context.params;
  const report = await loadReport(period).catch(() => null);
  if (!report) {
    return NextResponse.json({ error: "해당 기간의 리포트가 없습니다." }, { status: 404 });
  }
  return NextResponse.json(report);
}

/** DELETE /api/reports/{period} — ADMIN 전용. */
export async function DELETE(request: Request, context: { params: Promise<{ period: string }> }) {
  const auth = await authorizeWrite(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { period } = await context.params;
  const removed = await deleteReport(period).catch(() => false);
  if (!removed) {
    return NextResponse.json({ error: "해당 기간의 리포트가 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ period, deleted: true });
}
