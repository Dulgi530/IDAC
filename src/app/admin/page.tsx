import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/access";
import { listReports } from "@/lib/storage";
import { formatPeriod } from "@/lib/format";
import { GenerateForm } from "./GenerateForm";

export const dynamic = "force-dynamic";

/**
 * 관리자 화면. ADMIN_HOST 도메인으로 접속했을 때만 노출된다.
 * 퍼블릭 도메인에서는 존재 자체를 감추기 위해 404 를 반환한다.
 */
export default async function AdminPage() {
  if (!(await isAdminHost())) notFound();

  const reports = await listReports();
  const tokenConfigured = Boolean(process.env.ADMIN_TOKEN);

  return (
    <>
      <h1>관리자 · 리포트 생성</h1>
      <p className="lead">
        이 화면은 관리자 도메인에서만 열린다. 리포트를 생성하면 퍼블릭 화면에 조회 전용으로
        공개된다.
      </p>

      {!tokenConfigured && (
        <div className="notice">
          <strong>ADMIN_TOKEN 이 설정되지 않았습니다.</strong>
          <p style={{ margin: "6px 0 0" }}>
            환경변수 <code>ADMIN_TOKEN</code> 을 설정해야 리포트 생성이 활성화됩니다.
          </p>
        </div>
      )}

      <div className="card">
        <GenerateForm />
      </div>

      <h2>발행된 리포트</h2>
      {reports.length === 0 ? (
        <p className="footnote">아직 생성된 리포트가 없습니다.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>기간</th>
                <th>평가 대상</th>
                <th>데이터 소스</th>
                <th>생성 시각</th>
                <th>바로가기</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.period}>
                  <td>{formatPeriod(report.period)}</td>
                  <td className="num">{report.coinCount}종</td>
                  <td className="center">
                    {report.dataSource === "live" ? "실시간 집계" : "오프라인 스냅샷"}
                  </td>
                  <td className="nowrap">
                    {new Date(report.generatedAt).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                    })}
                  </td>
                  <td className="nowrap">
                    <a href={`/reports/${report.period}`}>리포트</a>
                    {" · "}
                    <a href={`/api/reports/${report.period}/export/pdf`}>PDF</a>
                    {" · "}
                    <a href={`/api/reports/${report.period}/export/xlsx`}>엑셀</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
