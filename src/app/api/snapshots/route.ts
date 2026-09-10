import { NextResponse } from "next/server";
import { listReports } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * GET /api/snapshots — 발행된 월별 리포트 목록.
 * 리포트 화면 상단의 월 선택 칩이 이 목록으로 만들어진다. 퍼블릭 조회 가능.
 */
export async function GET() {
  const reports = await listReports();
  return NextResponse.json({
    snapshots: reports.map((report) => ({
      period: report.period,
      status: "ready" as const,
      coinCount: report.coinCount,
      updatedAt: report.generatedAt,
    })),
  });
}
