"use client";

import { useCallback, useState, useTransition } from "react";
import { FileDown, FileSpreadsheet, Lock, Printer } from "lucide-react";
import type { SnapshotPayload } from "@/lib/snapshot";
import { CoinTable } from "./CoinTable";
import {
  EmptyState,
  MethodologyPanel,
  NoticePanel,
  ReportFooter,
  SourceCards,
  StatTiles,
} from "./ReportPanels";
import { periodLabel } from "./format";

export interface ReportViewProps {
  /** 서버에서 미리 읽어 둔 첫 화면. 발행된 리포트가 없으면 null. */
  initial: SnapshotPayload | null;
  /** 서버가 실제로 내려준 기간과 요청한 기간이 다를 때 안내를 띄우기 위한 값. */
  initialRequestedPeriod: string;
  /** 발행된 월 목록 (최신순). */
  archivePeriods: string[];
}

/**
 * 리포트 단일 페이지.
 *
 * 첫 화면은 서버에서 렌더링한 값을 그대로 쓰고, 월을 바꿀 때만
 * `/api/snapshot` 을 호출한다. 요청한 달이 아직 발행되지 않았으면 API 가
 * 가장 최근 발행분으로 대체해 주므로, 화면은 그 사실만 안내하면 된다.
 */
export function ReportView({ initial, initialRequestedPeriod, archivePeriods }: ReportViewProps) {
  const [payload, setPayload] = useState(initial);
  const [requestedPeriod, setRequestedPeriod] = useState(initialRequestedPeriod);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectPeriod = useCallback(
    (period: string) => {
      setRequestedPeriod(period);
      setError(null);
      startTransition(async () => {
        try {
          const response = await fetch(`/api/snapshot?period=${encodeURIComponent(period)}`);
          if (!response.ok) {
            setPayload(null);
            return;
          }
          setPayload((await response.json()) as SnapshotPayload);
        } catch {
          setError("리포트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        }
      });
    },
    [startTransition],
  );

  const snapshot = payload?.snapshot ?? null;
  const coins = payload?.coins ?? [];
  const shownPeriod = snapshot?.period ?? requestedPeriod;
  const isFallback = !!snapshot && snapshot.period !== requestedPeriod;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 print:bg-white print:text-neutral-900">
      <div
        id="report-root"
        className="mx-auto max-w-[1480px] px-6 py-8 print:max-w-none print:px-0 print:py-0"
      >
        <header className="flex flex-col gap-4 border-b border-neutral-800 pb-6 md:flex-row md:items-end md:justify-between print:border-neutral-300">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Digital Asset USE Evaluation
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-50 md:text-4xl print:text-neutral-900">
              {periodLabel(shownPeriod)} 디지털자산 활용성·지속가능성 평가 보고서
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400 print:text-neutral-700">
              국내·외 주요 거래소 데이터와 글로벌 코인 평가 플랫폼의 시계열 가격, 시가총액, 프로젝트
              메타데이터를 종합하여 일반 사용자가 안정적으로 활용 가능한 디지털 자산 30종의
              활용성(Usability)과 지속가능성(Sustainability)을 정량 평가하였다.
            </p>

            {archivePeriods.length > 0 && (
              <div className="mt-4 print:hidden">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  발행된 월별 보고서
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {archivePeriods.map((period) => {
                    const active = snapshot?.period === period;
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => selectPeriod(period)}
                        aria-current={active}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                          active
                            ? "border-neutral-100 bg-neutral-100 text-neutral-900"
                            : "border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
                        }`}
                      >
                        {periodLabel(period)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isFallback && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-400">
                요청하신 {periodLabel(requestedPeriod)} 보고서가 아직 발행되지 않아 가장 최근 발행된{" "}
                {periodLabel(snapshot.period)} 보고서를 표시하고 있습니다.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <a
              href={snapshot ? `/api/reports/${snapshot.period}/export/xlsx` : undefined}
              aria-disabled={!snapshot}
              className={`inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 ${
                snapshot ? "" : "pointer-events-none opacity-40"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel 다운로드
            </a>
            <a
              href={snapshot ? `/api/reports/${snapshot.period}/export/pdf` : undefined}
              aria-disabled={!snapshot}
              className={`inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-800 ${
                snapshot ? "" : "pointer-events-none opacity-40"
              }`}
            >
              <FileDown className="h-4 w-4" />
              PDF 다운로드
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-800"
            >
              <Printer className="h-4 w-4" />
              인쇄
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-500">
              <Lock className="h-3 w-3" />
              관리자만 발행 가능
            </span>
          </div>
        </header>

        <MethodologyPanel />
        {snapshot && <SourceCards snapshot={snapshot} />}

        {pending ? (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 px-6 py-12 text-center text-neutral-500">
            데이터 불러오는 중…
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-rose-500/40 bg-rose-500/5 px-6 py-12 text-center text-sm text-rose-300">
            {error}
          </div>
        ) : snapshot && coins.length > 0 ? (
          <>
            <StatTiles snapshot={snapshot} coins={coins} />
            <NoticePanel notices={snapshot.notices} />
            <CoinTable coins={coins} />
            <ReportFooter snapshot={snapshot} />
          </>
        ) : (
          <EmptyState period={requestedPeriod} />
        )}
      </div>
    </div>
  );
}
