import { NextResponse } from "next/server";
import { buildPdf, MissingFontError } from "@/lib/export/pdf";
import { loadReport } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** GET /api/reports/{period}/export/pdf — PDF 다운로드. 퍼블릭 허용. */
export async function GET(_request: Request, context: { params: Promise<{ period: string }> }) {
  const { period } = await context.params;
  const report = await loadReport(period).catch(() => null);
  if (!report) {
    return NextResponse.json({ error: "해당 기간의 리포트가 없습니다." }, { status: 404 });
  }

  try {
    const buffer = await buildPdf(report);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="IDAC-${period}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof MissingFontError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
