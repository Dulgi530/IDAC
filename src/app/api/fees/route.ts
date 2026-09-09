import { NextResponse } from "next/server";
import { DOMESTIC_EXCHANGES, DOMESTIC_EXCHANGE_LABEL } from "@/lib/evaluation/types";
import { FEE_CAPABILITY, fetchWithdrawalFees } from "@/lib/providers/domestic";
import {
  FEE_TABLE_UPDATED_AT,
  MANUAL_WITHDRAWAL_FEES,
  TRADING_FEE_PCT,
} from "@/data/withdrawal-fees";

export const dynamic = "force-dynamic";

/**
 * GET /api/fees?symbols=BTC,ETH — 국내 5대 거래소 온체인 출금 수수료 조회 API.
 *
 * 응답에는 거래소별 수수료 값과 함께 `capability` 를 포함해, 그 값이
 * 공개 API 실시간 조회인지 수동 관리 테이블인지 호출자가 구분할 수 있게 한다.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = (url.searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const symbols = requested.length > 0 ? requested : Object.keys(MANUAL_WITHDRAWAL_FEES);

  const table = await fetchWithdrawalFees(symbols).catch(() => null);
  if (!table) {
    return NextResponse.json(
      { error: "거래소 수수료 조회에 실패했습니다. 네트워크 또는 거래소 API 상태를 확인하세요." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    asOf: new Date().toISOString(),
    manualTableUpdatedAt: FEE_TABLE_UPDATED_AT,
    exchanges: DOMESTIC_EXCHANGES.map((exchange) => ({
      id: exchange,
      label: DOMESTIC_EXCHANGE_LABEL[exchange],
      tradingFeePct: TRADING_FEE_PCT[exchange],
      capability: FEE_CAPABILITY[exchange],
    })),
    withdrawalFees: symbols.map((symbol) => ({
      symbol,
      byExchange: table.get(symbol) ?? null,
    })),
  });
}
