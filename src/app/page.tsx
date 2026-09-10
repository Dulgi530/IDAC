import { ReportView } from "@/components/report/ReportView";
import { currentPeriod } from "@/components/report/format";
import { toSnapshotPayload } from "@/lib/snapshot";
import { listReports, loadReport } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * 퍼블릭 리포트 화면.
 *
 * 첫 화면은 이번 달 리포트를, 아직 발행 전이면 가장 최근 발행분을 서버에서
 * 그대로 렌더링한다. 월 전환만 클라이언트에서 `/api/snapshot` 을 호출한다.
 */
export default async function ReportPage() {
  const requested = currentPeriod();
  const summaries = await listReports();

  const target = summaries.some((s) => s.period === requested)
    ? requested
    : (summaries[0]?.period ?? null);

  const report = target ? await loadReport(target).catch(() => null) : null;

  return (
    <ReportView
      initial={report ? toSnapshotPayload(report) : null}
      initialRequestedPeriod={requested}
      archivePeriods={summaries.map((s) => s.period)}
    />
  );
}
