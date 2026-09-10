import Link from "next/link";
import { Database } from "lucide-react";
import { DOMESTIC_EXCHANGE_LABEL, GLOBAL_EXCHANGE_LABEL } from "@/lib/evaluation/types";
import type { SnapshotCoin, SnapshotInfo } from "@/lib/snapshot";
import { compactKrw, dateTimeLabel, num, pct, periodLabel } from "./format";

/** 평가 방법론 — A → B → C∼F 단계와 GTF 변동성 산출 기준. */
export function MethodologyPanel() {
  return (
    <details
      open
      className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/40 px-5 py-4 open:pb-5 print:open print:border-neutral-300 print:bg-white"
    >
      <summary className="cursor-pointer select-none text-sm font-medium text-neutral-300 print:text-neutral-900">
        평가 방법론 및 데이터 출처
      </summary>

      <div className="mt-4 grid gap-4 text-xs leading-relaxed text-neutral-400 md:grid-cols-3 print:text-neutral-700">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-200 print:text-neutral-900">
            A. 1차 후보 선정
          </div>
          <p>
            글로벌 시가총액 상위 100위 코인을 코인마켓캡 데이터로 수집하고, 바이낸스·코인베이스·OKX
            등 해외 거래소 2곳 이상에 활성 거래쌍을 갖춘 자산을 1차 후보군(60종)으로 추렸다.
            스테이블코인은 규모 조건만 적용한다.
          </p>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-200 print:text-neutral-900">
            B. 국내 거래소 필터 + 등급 산정
          </div>
          <p>
            업비트·빗썸·코인원·코빗·고팍스 공개 API 로 KRW 마켓 상장 여부를 확정하고
            <strong className="font-semibold text-neutral-200 print:text-neutral-900">
              {" "}
              국내 3사 이상에 동시 상장된 자산
            </strong>
            만 평가 대상으로 선정하였다(즉시 환급 가능성 우선). 1년 일봉 시계열에서 연환산 변동성과
            누적 변동률을 계산하고, 시가총액과 함께 상대 분위(quintile)에 따라 A∼E 등급을 부여했다.
          </p>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-200 print:text-neutral-900">
            C∼F. 재단·활용·SNS·총평
          </div>
          <p>
            재단 홈페이지·백서·SNS 채널에서 재단 정보와 활용 목표·활용 분야를 150자 이내로 정리하고,
            채널별 누적 참가자 규모로 SNS 활성도를 등급화한 뒤 전 항목을 종합한 200자 총평을 자동
            생성하였다.
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-neutral-800 pt-3 text-[11px] leading-relaxed text-neutral-500 print:border-neutral-300">
        <div className="mb-1 font-semibold text-neutral-300 print:text-neutral-900">
          GTF 변동성 산출 기준
        </div>
        <p>
          엑셀 산식과 동일하게 일별 로그수익률{" "}
          <code className="rounded bg-neutral-800 px-1 print:bg-neutral-200">LN(Pₜ / Pₜ₋₁)</code> 을
          계산하고, 최근 90거래일·180거래일 구간에 표본 표준편차{" "}
          <code className="rounded bg-neutral-800 px-1 print:bg-neutral-200">STDEV.S</code> 를 적용한
          뒤 연환산 계수{" "}
          <code className="rounded bg-neutral-800 px-1 print:bg-neutral-200">√365</code> (24/7
          거래되는 디지털 자산 기준, 주식은 √245) 를 곱해 연환산 변동성을 산출한다.
        </p>
        <p className="mt-2">
          정렬 기준 — 1순위: 변동성·시가총액·재단·커뮤니티를 가중 합산한 안정성 티어(A→E). 2순위:
          국내 5사 평균 송금수수료(USD 환산) 오름차순. 3순위: 종합 점수 내림차순.
        </p>
      </div>
    </details>
  );
}

/** 집계에 사용한 데이터 출처 카드. */
export function SourceCards({ snapshot }: { snapshot: SnapshotInfo }) {
  const sources = snapshot.meta.sources;
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/30 px-5 py-4 print:border-neutral-300 print:bg-white">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 print:text-neutral-700">
        <Database className="h-3.5 w-3.5" />
        데이터 출처 집계
      </div>
      <div className="mt-3 grid gap-2 text-xs text-neutral-300 md:grid-cols-2 lg:grid-cols-3 print:text-neutral-700">
        {sources.map((source) => (
          <div
            key={source.id}
            className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 print:border-neutral-300 print:bg-white"
          >
            <div className="text-[11px] font-semibold text-neutral-100 print:text-neutral-900">
              {source.label}
            </div>
            <div className="mt-0.5 text-[10px] leading-relaxed text-neutral-500 print:text-neutral-700">
              {source.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 리포트 요약 지표 4종. */
export function StatTiles({
  snapshot,
  coins,
}: {
  snapshot: SnapshotInfo;
  coins: SnapshotCoin[];
}) {
  const totalCap = coins.reduce((sum, coin) => sum + coin.marketCapKrw, 0);
  const avgVol = coins.reduce((sum, coin) => sum + coin.vol1yPct, 0) / coins.length;
  const listedOn4 = coins.filter((coin) => coin.exchangeCountKr >= 4).length;
  const stableCount = coins.filter((coin) => coin.isStablecoin).length;

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-4 print:grid-cols-4">
      <StatTile
        label="평가 코인 수"
        value={`${snapshot.coinCount} 종`}
        hint="국내 3사 이상 거래소 동시 상장"
      />
      <StatTile
        label="총 시가총액"
        value={compactKrw(totalCap)}
        hint={`평가 대상 ${snapshot.coinCount}종 합산 (KRW 환산)`}
      />
      <StatTile label="평균 1년 변동성" value={pct(avgVol)} hint="연환산 가격 변동성" />
      <StatTile
        label="국내 4사 이상 상장"
        value={`${listedOn4} 종`}
        hint={`스테이블코인 ${stableCount}종 포함 · 1USD ≈ ${num(snapshot.fxUsdKrw)} KRW`}
      />
    </div>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-5 py-4 print:border-neutral-300 print:bg-white">
      <div className="text-[11px] uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-50 print:text-neutral-900">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-neutral-500">{hint}</div>
    </div>
  );
}

/** 리포트 유의사항. 데이터 신뢰도 경고를 숨기지 않고 본문에 남긴다. */
export function NoticePanel({ notices }: { notices: string[] }) {
  if (notices.length === 0) return null;
  return (
    <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 print:border-neutral-300 print:bg-white">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 print:text-neutral-900">
        유의사항
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-amber-100/80 print:text-neutral-700">
        {notices.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>
    </div>
  );
}

/** 리포트가 아직 발행되지 않은 달. */
export function EmptyState({ period }: { period: string }) {
  return (
    <div className="mt-10 rounded-xl border border-neutral-800 bg-neutral-900/40 px-8 py-16 text-center">
      <div className="mx-auto max-w-lg">
        <h2 className="text-lg font-semibold text-neutral-100">
          {periodLabel(period)} 평가 보고서가 아직 없습니다
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          해당 월의 보고서가 아직 발행되지 않았습니다. 공개 사이트에서는 발행 완료된 보고서만 열람할
          수 있으며, 신규 발행은 관리자 도메인의 <code>/admin</code> 화면에서만 가능합니다.
        </p>
      </div>
    </div>
  );
}

/** 집계 시점과 커버리지를 밝히는 꼬리말. */
export function ReportFooter({ snapshot }: { snapshot: SnapshotInfo }) {
  const sizes = snapshot.meta.krMarketSizes;
  const globalExchanges = snapshot.meta.globalExchanges;

  return (
    <footer className="mt-8 border-t border-neutral-800 pt-4 text-[11px] leading-relaxed text-neutral-500 print:border-neutral-300 print:text-neutral-700">
      <p>
        본 보고서는 {periodLabel(snapshot.period)} 평가 시점의 데이터(업데이트:{" "}
        {dateTimeLabel(snapshot.updatedAt)})를 기반으로 자동 생성된 분석 자료이며, 디지털 자산 시장
        상황에 따라 변동성·시가총액·SNS 활성도 지표는 수시로 변경될 수 있다. 투자 자문이 아니다.
      </p>
      {sizes && (
        <p className="mt-1">
          국내 거래소 KRW 마켓 커버리지 —{" "}
          {Object.entries(sizes)
            .map(
              ([exchange, size]) =>
                `${DOMESTIC_EXCHANGE_LABEL[exchange as keyof typeof DOMESTIC_EXCHANGE_LABEL]} ${size}종`,
            )
            .join(", ")}
          .
        </p>
      )}
      {globalExchanges.length > 0 && (
        <p className="mt-1">
          해외 상장 판정 거래소:{" "}
          {globalExchanges
            .map(
              (exchange) =>
                GLOBAL_EXCHANGE_LABEL[exchange as keyof typeof GLOBAL_EXCHANGE_LABEL] ?? exchange,
            )
            .join(" · ")}
          .
        </p>
      )}
      <p className="mt-1">
        A단계 후보 {snapshot.universe.stageA}종 → B단계 최종 {snapshot.universe.stageB}종 · 집계 소요{" "}
        {num(snapshot.meta.durationMs)}ms ·{" "}
        {snapshot.dataSource === "live" ? "실시간 API 집계" : "오프라인 스냅샷(fixture)"}
      </p>
      <p className="mt-2 flex flex-wrap gap-3 print:hidden">
        <Link href={`/reports/${snapshot.period}`} className="text-sky-400 hover:underline">
          리포트 전문 보기 →
        </Link>
        <Link href="/methodology" className="text-sky-400 hover:underline">
          평가 기준·배점 전문 →
        </Link>
      </p>
    </footer>
  );
}
