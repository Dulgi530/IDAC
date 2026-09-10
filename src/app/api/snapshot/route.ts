import { NextResponse } from "next/server";
import { listReports, loadReport } from "@/lib/storage";
import { toSnapshotPayload } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

/**
 * GET /api/snapshot?period=YYYY-MM — 리포트 화면이 쓰는 단일 스냅샷.
 *
 * 요청한 월이 아직 발행되지 않았다면 가장 최근 발행분으로 대체해 내려주고,
 * `requestedPeriod` 로 원래 요청을 알려 준다. 화면은 이 값이 실제 기간과
 * 다를 때 "아직 발행되지 않아 최근 보고서를 표시" 안내를 띄운다.
 * 발행된 리포트가 하나도 없으면 204 로 응답한다. 퍼블릭 조회 가능.
 */
export async function GET(request: Request) {
  const requestedPeriod = new URL(request.url).searchParams.get("period") ?? "";

  const exact = requestedPeriod ? await loadReport(requestedPeriod).catch(() => null) : null;
  if (exact && exact.entries.length > 0) {
    return NextResponse.json({ ...toSnapshotPayload(exact), requestedPeriod });
  }

  const [latestSummary] = await listReports();
  if (!latestSummary) {
    return NextResponse.json({ snapshot: null, coins: [], requestedPeriod }, { status: 404 });
  }

  const latest = await loadReport(latestSummary.period).catch(() => null);
  if (!latest) {
    return NextResponse.json({ snapshot: null, coins: [], requestedPeriod }, { status: 404 });
  }

  return NextResponse.json({ ...toSnapshotPayload(latest), requestedPeriod });
}
