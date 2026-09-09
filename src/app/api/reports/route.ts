import { NextResponse } from "next/server";
import { authorizeWrite } from "@/lib/access";
import { generateReport } from "@/lib/evaluation/pipeline";
import { listReports, saveReport, assertValidPeriod } from "@/lib/storage";
import type { DataSourceMode } from "@/lib/evaluation/types";

export const dynamic = "force-dynamic";

/** GET /api/reports — 생성된 리포트 목록. 퍼블릭 조회 가능. */
export async function GET() {
  const reports = await listReports();
  return NextResponse.json({ reports });
}

/**
 * POST /api/reports — 신규 리포트 생성. ADMIN 전용.
 * body: { period: "2026-09", mode?: "live" | "fixture" }
 */
export async function POST(request: Request) {
  const auth = await authorizeWrite(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: { period?: string; mode?: string };
  try {
    body = (await request.json()) as { period?: string; mode?: string };
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바른 JSON 이 아닙니다." }, { status: 400 });
  }

  const period = body.period ?? currentPeriod();
  try {
    assertValidPeriod(period);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  const mode: DataSourceMode =
    body.mode === "live" || body.mode === "fixture"
      ? body.mode
      : ((process.env.IDAC_DATA_SOURCE as DataSourceMode) ?? "fixture");

  try {
    const report = await generateReport({ period, mode });
    await saveReport(report);
    return NextResponse.json({
      period: report.period,
      dataSource: report.dataSource,
      coinCount: report.entries.length,
      notices: report.notices,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `리포트 생성에 실패했습니다: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
