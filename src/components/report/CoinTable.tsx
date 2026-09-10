"use client";

import { useState } from "react";
import {
  AtSign,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import {
  DOMESTIC_EXCHANGES,
  DOMESTIC_EXCHANGE_LABEL,
  type DomesticExchange,
} from "@/lib/evaluation/types";
import type { SnapshotCoin } from "@/lib/snapshot";
import { GradeChip } from "./GradeChip";
import { compactCount, krw, num, pct, pctSigned, shortUrl } from "./format";

/** 순위표. 행을 펼치면 재단·활용·SNS·수수료·총평 상세가 열린다. */
export function CoinTable({ coins }: { coins: SnapshotCoin[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/30 print:border-neutral-300 print:bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1380px] table-fixed text-sm print:min-w-0 print:text-[10px]">
          <colgroup>
            <col className="w-[58px]" />
            <col className="w-[200px]" />
            <col className="w-[150px]" />
            <col className="w-[170px]" />
            <col className="w-[180px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[170px]" />
            <col className="w-[200px]" />
            <col className="w-[100px]" />
            <col className="w-[60px]" />
          </colgroup>
          <thead className="border-b border-neutral-800 bg-neutral-900/60 text-left text-xs uppercase tracking-wider text-neutral-400 print:border-neutral-300 print:bg-neutral-100 print:text-neutral-700">
            <tr>
              <th className="px-3 py-3">순위</th>
              <th className="px-3 py-3">코인명</th>
              <th className="px-3 py-3">현재가 (₩)</th>
              <th className="px-3 py-3">시가총액 (등급)</th>
              <th className="px-3 py-3">1Y 변동성 (등급)</th>
              <th className="px-3 py-3">
                GTF 90D · 180D{" "}
                <span className="normal-case tracking-normal text-neutral-500">(연환산)</span>
              </th>
              <th className="px-3 py-3">송금 수수료 (5사 평균)</th>
              <th className="px-3 py-3">국내 거래소</th>
              <th className="px-3 py-3">재단</th>
              <th className="px-3 py-3">SNS</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/70 print:divide-neutral-300">
            {coins.map((coin) => (
              <CoinRow
                key={coin.rank}
                coin={coin}
                expanded={!!expanded[coin.rank]}
                onToggle={() =>
                  setExpanded((prev) => ({ ...prev, [coin.rank]: !prev[coin.rank] }))
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoinRow({
  coin,
  expanded,
  onToggle,
}: {
  coin: SnapshotCoin;
  expanded: boolean;
  onToggle: () => void;
}) {
  const change = coin.priceChange1yPct;
  const changeTone = change >= 0 ? "text-emerald-400" : "text-rose-400";
  const averageUsd = coin.feePerExchange.averageUsd;

  return (
    <>
      <tr className="hover:bg-neutral-900/50 print:hover:bg-transparent">
        <td className="px-3 py-3 align-top tabular-nums text-neutral-300 print:text-neutral-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800 text-xs font-semibold text-neutral-100 print:bg-neutral-200 print:text-neutral-900">
            {coin.rank}
          </div>
        </td>

        <td className="px-3 py-3 align-top">
          <div className="flex items-center gap-3">
            <div
              title={coin.symbol}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[9px] font-semibold tracking-tight text-neutral-300 print:bg-neutral-200 print:text-neutral-900"
            >
              {coin.symbol.slice(0, 4)}
            </div>
            <div>
              <div className="font-semibold text-neutral-100 print:text-neutral-900">
                {coin.nameKo || coin.name}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                {coin.symbol}
                {coin.nameKo && coin.nameKo !== coin.name ? ` · ${coin.name}` : ""}
              </div>
            </div>
          </div>
        </td>

        <td className="px-3 py-3 align-top tabular-nums">
          <div className="text-neutral-100 print:text-neutral-900">{krw(coin.priceKrw)}</div>
          <div className="text-[11px] text-neutral-500">
            ${num(coin.priceUsd, coin.priceUsd < 1 ? 4 : 2)}
          </div>
        </td>

        <td className="px-3 py-3 align-top">
          <div className="flex items-center gap-2">
            <span className="tabular-nums text-neutral-100 print:text-neutral-900">
              {coin.marketCapLabel}
            </span>
            <GradeChip grade={coin.marketCapGrade} />
          </div>
          <div className="text-[11px] tabular-nums text-neutral-500">
            ${num(coin.marketCapUsd / 1e9, 1)}B
          </div>
        </td>

        <td className="px-3 py-3 align-top">
          <div className="flex items-center gap-2">
            <span className="tabular-nums text-neutral-100 print:text-neutral-900">
              {pct(coin.vol1yPct)}
            </span>
            <GradeChip grade={coin.volGrade} />
          </div>
          <div className={`text-[11px] tabular-nums ${changeTone}`}>
            1Y {pctSigned(change)}
          </div>
        </td>

        <td className="px-3 py-3 align-top">
          <div className="text-[11px] tabular-nums text-neutral-300 print:text-neutral-900">
            90D{" "}
            <span className="font-semibold text-neutral-100 print:text-neutral-900">
              {pct(coin.vol90dPct)}
            </span>
          </div>
          <div className="text-[11px] tabular-nums text-neutral-300 print:text-neutral-900">
            180D{" "}
            <span className="font-semibold text-neutral-100 print:text-neutral-900">
              {pct(coin.vol180dPct)}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-neutral-500">LN 로그수익률 · √365 연환산</div>
        </td>

        <td className="px-3 py-3 align-top">
          <div className="flex items-center gap-2">
            <GradeChip grade={coin.feeGrade} />
            <span className="text-[11px] text-neutral-400 print:text-neutral-700">
              평균 {averageUsd == null ? "—" : `$${averageUsd.toFixed(3)}`}
            </span>
          </div>
          <div className="mt-1 text-[10px] tabular-nums text-neutral-500">
            {DOMESTIC_EXCHANGES.map((exchange) => {
              const fee = coin.feePerExchange.exchanges[exchange];
              return (
                <span key={exchange} className="mr-1.5 whitespace-nowrap">
                  {DOMESTIC_EXCHANGE_LABEL[exchange].slice(0, 2)}{" "}
                  {fee?.feeUsd == null ? "—" : `$${fee.feeUsd.toFixed(2)}`}
                </span>
              );
            })}
          </div>
        </td>

        <td className="px-3 py-3 align-top">
          <div className="flex flex-wrap gap-1">
            {coin.exchangesKr.map((exchange) => (
              <span
                key={exchange}
                className="rounded bg-neutral-800 px-1.5 py-0.5 text-[11px] text-neutral-200 print:bg-neutral-200 print:text-neutral-900"
              >
                {exchange}
              </span>
            ))}
            {coin.exchangesKr.length === 0 && (
              <span className="text-[11px] text-neutral-500">미상장</span>
            )}
          </div>
        </td>

        <td className="px-3 py-3 align-top">
          <div className="line-clamp-2 text-neutral-100 print:text-neutral-900">
            {coin.foundationName}
          </div>
          {coin.foundationUrl && (
            <a
              href={coin.foundationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline print:text-neutral-700"
            >
              {shortUrl(coin.foundationUrl)}
              <ExternalLink className="h-3 w-3 print:hidden" />
            </a>
          )}
        </td>

        <td className="px-3 py-3 align-top">
          <div className="flex items-center gap-2">
            <GradeChip grade={coin.snsGrade} />
            <span className="text-[11px] text-neutral-500">
              {compactCount(coin.snsTotalMembers)}
            </span>
          </div>
        </td>

        <td className="px-3 py-3 align-top text-right print:hidden">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`${coin.nameKo || coin.name} 상세 보기`}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-neutral-900/40 print:bg-white">
          <td colSpan={11} className="px-3 py-5">
            <CoinDetail coin={coin} />
          </td>
        </tr>
      )}
    </>
  );
}

function CoinDetail({ coin }: { coin: SnapshotCoin }) {
  return (
    <div className="grid gap-5 px-3 lg:grid-cols-3">
      <DetailCard title="재단 정보" subtitle={coin.foundationName || "—"}>
        {coin.foundationUrl && (
          <a
            href={coin.foundationUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-2 inline-flex items-center gap-1 text-xs text-sky-400 hover:underline"
          >
            {coin.foundationUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <p className="text-sm leading-relaxed text-neutral-300">{coin.foundationDesc || "—"}</p>
      </DetailCard>

      <DetailCard title="활용 목표 · 활용 분야">
        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            코인 제작 및 활용 목표
          </div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-300">{coin.goalDesc || "—"}</p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            코인 활용 분야
          </div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-300">{coin.useDesc || "—"}</p>
        </div>
      </DetailCard>

      <DetailCard title="SNS 채널 · 활성도" subtitle={`종합 등급 ${coin.snsGrade}`}>
        <div className="grid grid-cols-2 gap-2">
          <SnsLink
            icon={<AtSign className="h-3.5 w-3.5" />}
            label="X (Twitter)"
            url={coin.snsXUrl}
            members={coin.snsXFollowers}
          />
          <SnsLink
            icon={<Send className="h-3.5 w-3.5" />}
            label="Telegram"
            url={coin.snsTelegramUrl}
            members={coin.snsTelegramFollowers}
          />
          <SnsLink
            icon={<MessageCircle className="h-3.5 w-3.5" />}
            label="Discord"
            url={coin.snsDiscordUrl}
            members={coin.snsDiscordFollowers}
          />
          <SnsLink
            icon={<Users className="h-3.5 w-3.5" />}
            label="Reddit"
            url={coin.snsRedditUrl}
            members={coin.snsRedditFollowers}
          />
          <SnsLink
            icon={<GitBranch className="h-3.5 w-3.5" />}
            label="GitHub"
            url={coin.snsGithubUrl}
            members={null}
          />
        </div>
      </DetailCard>

      <div className="lg:col-span-3">
        <FeeBreakdown coin={coin} />
      </div>

      <div className="lg:col-span-3">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-5 py-4">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">총평</div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-200">{coin.summary}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] tabular-nums text-neutral-500">
            <span>활용성 {num(coin.usabilityScore, 1)}점</span>
            <span>지속가능성 {num(coin.sustainabilityScore, 1)}점</span>
            <span className="text-neutral-300">종합 {num(coin.compositeScore, 1)}점</span>
            <span>1년 최대낙폭 {pct(coin.maxDrawdownPct)}</span>
            {coin.skynetScore != null && <span>CertiK Skynet {num(coin.skynetScore)}점</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 국내 5대 거래소 출금 수수료 상세. */
function FeeBreakdown({ coin }: { coin: SnapshotCoin }) {
  const averageUsd = coin.feePerExchange.averageUsd;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            거래소별 출금 수수료 (국내 5대 거래소)
          </div>
          <div className="mt-1 text-sm font-semibold text-neutral-100">
            평균 {averageUsd == null ? "—" : `$${averageUsd.toFixed(3)}`} · {coin.feeLabel}
          </div>
        </div>
        <span className="text-right text-[11px] text-neutral-500">
          단위: {coin.symbol} (USD 환산)
          <br />
          {coin.feeNetwork} · 100만원 이체 시 {pct(coin.feeRatioPct, 3)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
        {DOMESTIC_EXCHANGES.map((exchange) => (
          <FeeCell key={exchange} exchange={exchange} coin={coin} />
        ))}
      </div>
    </div>
  );
}

function FeeCell({ exchange, coin }: { exchange: DomesticExchange; coin: SnapshotCoin }) {
  const fee = coin.feePerExchange.exchanges[exchange];
  return (
    <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2 print:border-neutral-300 print:bg-white">
      <div className="text-[11px] text-neutral-400">{DOMESTIC_EXCHANGE_LABEL[exchange]}</div>
      <div className="mt-0.5 text-sm font-medium tabular-nums text-neutral-100 print:text-neutral-900">
        {fee?.feeCoin == null ? "—" : num(fee.feeCoin, 6)}
        <span className="ml-1 text-[11px] text-neutral-500">{coin.symbol}</span>
      </div>
      <div className="text-[11px] tabular-nums text-neutral-500">
        {fee?.feeUsd == null ? "—" : `≈ $${fee.feeUsd.toFixed(3)}`}
      </div>
    </div>
  );
}

function DetailCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-5 py-4">
      <div className="text-[11px] uppercase tracking-wider text-neutral-500">{title}</div>
      {subtitle && <div className="mt-1 text-sm font-semibold text-neutral-100">{subtitle}</div>}
      <div className={subtitle ? "mt-2" : "mt-1"}>{children}</div>
    </div>
  );
}

function SnsLink({
  icon,
  label,
  url,
  members,
}: {
  icon: React.ReactNode;
  label: string;
  url: string | null;
  members: number | null;
}) {
  if (!url) {
    return (
      <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span>미공개</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
    >
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-neutral-400">{members == null ? "↗" : compactCount(members)}</span>
    </a>
  );
}
