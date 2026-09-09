import { notFound } from "next/navigation";
import { loadReport } from "@/lib/storage";
import { GradeBadge } from "@/components/GradeBadge";
import { ExchangeChips } from "@/components/ExchangeChips";
import {
  DOMESTIC_EXCHANGES,
  DOMESTIC_EXCHANGE_LABEL,
  GLOBAL_EXCHANGE_LABEL,
} from "@/lib/evaluation/types";
import {
  formatAmount,
  formatCount,
  formatDate,
  formatFeeRatio,
  formatKrwCompact,
  formatNumber,
  formatPct,
  formatPctSigned,
  formatPeriod,
  formatPriceKrw,
} from "@/lib/format";

export const dynamic = "force-dynamic";

/** 퍼블릭 리포트 상세. 생성된 리포트를 읽기 전용으로 보여준다. */
export default async function ReportPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params;
  const report = await loadReport(period).catch(() => null);
  if (!report) notFound();

  return (
    <>
      <h1>{formatPeriod(report.period)} 디지털자산 활용성·지속가능성 평가 리포트</h1>
      <p className="lead">
        본 리포트는 국내 5대 거래소 중 3곳 이상에 상장되어 원화 즉시 환급이 가능한 디지털자산
        {report.entries.length}종을 대상으로, 활용성과 지속가능성을 계량 평가한 결과를 정리한 것이다.
        순위는 안정성 종합 티어를 1순위, 이체 수수료 부담률을 2순위 기준으로 정렬하였다.
      </p>

      <div className="card">
        <div className="meta-grid">
          <div className="item">
            <div className="label">데이터 기준</div>
            <div className="value">{formatDate(report.asOf)}</div>
          </div>
          <div className="item">
            <div className="label">평가 대상</div>
            <div className="value">{report.entries.length}종</div>
          </div>
          <div className="item">
            <div className="label">1차 후보군</div>
            <div className="value">{report.universe.stageA}종</div>
          </div>
          <div className="item">
            <div className="label">적용 환율</div>
            <div className="value">1 USD = {formatNumber(report.usdKrw)}원</div>
          </div>
          <div className="item">
            <div className="label">데이터 소스</div>
            <div className="value">
              {report.dataSource === "live" ? "실시간 API 집계" : "오프라인 스냅샷"}
            </div>
          </div>
        </div>
      </div>

      {report.notices.length > 0 && (
        <div className="notice">
          <strong>유의사항</strong>
          <ul>
            {report.notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="btn-row">
        <a className="btn" href={`/api/reports/${report.period}/export/pdf`}>
          PDF 내려받기
        </a>
        <a className="btn secondary" href={`/api/reports/${report.period}/export/xlsx`}>
          엑셀 내려받기
        </a>
        <a className="btn secondary" href={`/api/reports/${report.period}`}>
          JSON 원본
        </a>
      </div>

      <h2>1. 종합 순위표 (활용성·지속가능성 계량 평가)</h2>
      <p className="footnote">
        등급은 선정 {report.entries.length}종 내 상대평가 5분위이며, 상위 20%가 A등급이다. 이체
        수수료는 국내 상장 거래소 출금 수수료의 중앙값에 현재가를 적용해 원화로 환산한 값이고,
        부담률은 100만원을 이체할 때 수수료가 차지하는 비중이다.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>코인</th>
              <th>현재가</th>
              <th>시가총액</th>
              <th>시총순위</th>
              <th>유통량</th>
              <th>총발행량</th>
              <th>1년 변동률</th>
              <th>연율 변동성</th>
              <th>최대낙폭</th>
              <th>변동성등급</th>
              <th>규모등급</th>
              <th>SNS등급</th>
              <th>이체수수료</th>
              <th>수수료(원)</th>
              <th>부담률<br />(100만원 기준)</th>
              <th>매매수수료</th>
              <th>국내 상장 거래소</th>
              <th>해외 상장</th>
              <th>활용성</th>
              <th>지속성</th>
              <th>종합</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry) => (
              <tr key={entry.symbol}>
                <td className="center">{entry.rank}</td>
                <td className="nowrap">
                  <strong>{entry.nameKo}</strong>
                  <br />
                  <span className="footnote">{entry.symbol}</span>
                </td>
                <td className="num">{formatPriceKrw(entry.priceKrw)}</td>
                <td className="num">{formatKrwCompact(entry.scale.marketCapKrw)}</td>
                <td className="center">{entry.scale.cmcRank}</td>
                <td className="num">{formatNumber(Math.round(entry.scale.circulatingSupply))}</td>
                <td className="num">
                  {entry.scale.totalSupply ? formatNumber(entry.scale.totalSupply) : "무제한"}
                </td>
                <td className="num">{formatPctSigned(entry.volatility.changeRate1yPct)}</td>
                <td className="num">{formatPct(entry.volatility.annualizedVolatilityPct)}</td>
                <td className="num">{formatPct(entry.volatility.maxDrawdownPct)}</td>
                <td className="center">
                  <GradeBadge grade={entry.volatility.grade} />
                </td>
                <td className="center">
                  <GradeBadge grade={entry.scale.grade} />
                </td>
                <td className="center">
                  <GradeBadge grade={entry.community.grade} />
                </td>
                <td className="num">
                  {formatAmount(entry.fee.medianAmount)} {entry.symbol}
                </td>
                <td className="num">{formatPriceKrw(entry.fee.medianKrw)}</td>
                <td className="num">{formatFeeRatio(entry.fee.ratioPct)}</td>
                <td className="num">{entry.fee.tradingFeePct.toFixed(2)}%</td>
                <td>
                  <ExchangeChips listings={entry.listings} />
                </td>
                <td className="footnote">
                  {entry.globalListings.map((ex) => GLOBAL_EXCHANGE_LABEL[ex]).join("·")}
                </td>
                <td className="num">{entry.scores.usability.toFixed(1)}</td>
                <td className="num">{entry.scores.sustainability.toFixed(1)}</td>
                <td className="num">
                  <strong>{entry.scores.total.toFixed(1)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>2. 거래소별 온체인 출금 수수료 (코인 수량 기준)</h2>
      <p className="footnote">
        미상장 거래소는 &quot;-&quot;로 표기하였다. 거래소는 네트워크 혼잡도에 따라 수수료를 수시로
        조정하므로, 실제 출금 전 거래소 공지를 확인할 필요가 있다.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>코인</th>
              <th>기준 네트워크</th>
              {DOMESTIC_EXCHANGES.map((exchange) => (
                <th key={exchange}>{DOMESTIC_EXCHANGE_LABEL[exchange]}</th>
              ))}
              <th>중앙값</th>
              <th>원화 환산</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry) => (
              <tr key={entry.symbol}>
                <td className="center">{entry.rank}</td>
                <td className="nowrap">
                  {entry.nameKo} ({entry.symbol})
                </td>
                <td className="nowrap">{entry.fee.network}</td>
                {DOMESTIC_EXCHANGES.map((exchange) => (
                  <td key={exchange} className="num">
                    {entry.fee.byExchange[exchange] == null
                      ? "-"
                      : formatAmount(entry.fee.byExchange[exchange]!)}
                  </td>
                ))}
                <td className="num">{formatAmount(entry.fee.medianAmount)}</td>
                <td className="num">{formatPriceKrw(entry.fee.medianKrw)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>3. 재단 정보 및 재단 안정성</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>코인</th>
              <th>재단이름</th>
              <th>재단 홈페이지</th>
              <th>재단 설명</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry) => (
              <tr key={entry.symbol}>
                <td className="center">{entry.rank}</td>
                <td className="nowrap">
                  {entry.nameKo} ({entry.symbol})
                </td>
                <td>{entry.foundation.name}</td>
                <td>
                  <a href={entry.foundation.homepage} target="_blank" rel="noreferrer">
                    {entry.foundation.homepage.replace(/^https?:\/\//, "")}
                  </a>
                </td>
                <td className="narrative">{entry.foundation.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>4. 코인 제작 목표 및 활용 분야 (백서 기준)</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>코인</th>
              <th>코인 제작 및 활용 목표</th>
              <th>코인 활용 분야</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry) => (
              <tr key={entry.symbol}>
                <td className="center">{entry.rank}</td>
                <td className="nowrap">
                  {entry.nameKo} ({entry.symbol})
                </td>
                <td className="narrative">{entry.whitepaper.goal}</td>
                <td className="narrative">{entry.whitepaper.useCases}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>5. SNS 채널 정보 및 활성도</h2>
      <p className="footnote">
        참가자 수와 월간 메시지 수는 조사 시점의 추정치이며, 두 지표를 로그 스케일로 합성해(참가자
        60%, 메시지 40%) 상대 등급을 산정하였다.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>코인</th>
              <th>SNS 채널 (URL · 참가자 수)</th>
              <th>합계 참가자</th>
              <th>월간 메시지</th>
              <th>활성도 등급</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry) => (
              <tr key={entry.symbol}>
                <td className="center">{entry.rank}</td>
                <td className="nowrap">
                  {entry.nameKo} ({entry.symbol})
                </td>
                <td className="narrative">
                  {entry.community.channels.map((channel) => (
                    <div key={channel.url}>
                      <strong>{channel.platform}</strong>{" "}
                      <a href={channel.url} target="_blank" rel="noreferrer">
                        {channel.url.replace(/^https?:\/\//, "")}
                      </a>{" "}
                      · {formatCount(channel.members)}
                    </div>
                  ))}
                </td>
                <td className="num">{formatCount(entry.community.totalMembers)}</td>
                <td className="num">
                  {entry.community.monthlyMessages
                    ? `${formatNumber(entry.community.monthlyMessages)}건`
                    : "-"}
                </td>
                <td className="center">
                  <GradeBadge grade={entry.community.grade} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>6. 코인별 총평</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>코인</th>
              <th>종합점수</th>
              <th>총평 (활용성·지속성 종합)</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry) => (
              <tr key={entry.symbol}>
                <td className="center">{entry.rank}</td>
                <td className="nowrap">
                  {entry.nameKo} ({entry.symbol})
                </td>
                <td className="num">{entry.scores.total.toFixed(1)}</td>
                <td className="narrative">{entry.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>7. 데이터 출처</h2>
      <ul className="footnote">
        {report.sources.map((source) => (
          <li key={source}>{source}</li>
        ))}
      </ul>
    </>
  );
}
