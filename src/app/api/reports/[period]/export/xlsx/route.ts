import { NextResponse } from "next/server";
import { buildWorkbook } from "@/lib/export/xlsx";
import { loadReport } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** GET /api/reports/{period}/export/xlsx — 엑셀 다운로드. 퍼블릭 허용. */
export async function GET(_request: Request, context: { params: Promise<{ period: string }> }) {
  const { period } = await context.params;
  const report = await loadReport(period).catch(() => null);
  if (!report) {
    return NextResponse.json({ error: "해당 기간의 리포트가 없습니다." }, { status: 404 });
  }

  const buffer = await buildWorkbook(report);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="IDAC-${period}.xlsx"`,
      "cache-control": "no-store",
    },
  });
}
