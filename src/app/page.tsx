import Link from "next/link";
import { listReports } from "@/lib/storage";
import { formatDate, formatPeriod } from "@/lib/format";

export const dynamic = "force-dynamic";

/** 퍼블릭 홈. 생성된 리포트를 조회 전용으로 나열한다. */
export default async function HomePage() {
  const reports = await listReports();

  return (
    <>
      <h1>디지털자산 활용성·지속가능성 평가 리포트</h1>
      <p className="lead">
        국내 5대 거래소에 상장되어 원화로 즉시 현금화할 수 있는 디지털자산을 대상으로, 활용성
        (거래소 상장·이체 수수료·활용 분야)과 지속가능성(가격변동성·시가총액·재단·커뮤니티)을 매월
        평가해 30종의 순위를 제공합니다.
      </p>

      {reports.length === 0 ? (
        <div className="card">
          <p>아직 발행된 리포트가 없습니다.</p>
          <p className="footnote">
            관리자 도메인의 <code>/admin</code> 화면에서 리포트를 생성하면 이 목록에 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="report-list">
          {reports.map((report) => (
            <li key={report.period}>
              <Link href={`/reports/${report.period}`}>
                <div className="card">
                  <h3 style={{ margin: 0 }}>{formatPeriod(report.period)} 평가 리포트</h3>
                  <p className="footnote" style={{ margin: "4px 0 0" }}>
                    평가 대상 {report.coinCount}종 · 데이터 기준 {formatDate(report.asOf)} ·{" "}
                    {report.dataSource === "live" ? "실시간 집계" : "오프라인 스냅샷"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
