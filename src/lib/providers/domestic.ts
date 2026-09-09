import { fetchJson } from "./http";
import { DOMESTIC_EXCHANGES, type DomesticExchange } from "../evaluation/types";
import { MANUAL_WITHDRAWAL_FEES } from "../../data/withdrawal-fees";

/**
 * 국내 5대 거래소 (평가방식 4.1~4.4 + 고팍스) 연동.
 *
 * 두 가지를 수집한다.
 *  1) KRW 마켓 상장 심볼 목록      → 1.1 국내 거래소 상장 여부
 *  2) 코인별 온체인 출금(이체) 수수료 → 1.2 거래 및 이체 수수료
 *
 * 거래소마다 수수료 공개 수준이 다르다. `FEE_CAPABILITY` 에 거래소별 취득 경로를
 * 명시해 두고, 공개 API 가 없는 거래소는 수동 관리 테이블로 보완한다.
 */

export type FeeSourceKind =
  /** 인증 없이 공개 REST API 로 수수료를 그대로 제공. */
  | "public-api"
  /** API 키(HMAC/JWT) 인증이 있어야 조회 가능. */
  | "authenticated-api"
  /** API 미제공. 공지/수수료 안내 페이지를 근거로 수동 관리. */
  | "manual-table";

export interface FeeCapability {
  kind: FeeSourceKind;
  /** 근거 문서/엔드포인트. */
  reference: string;
  note: string;
}

export const FEE_CAPABILITY: Record<DomesticExchange, FeeCapability> = {
  upbit: {
    kind: "authenticated-api",
    reference: "GET https://api.upbit.com/v1/withdraws/chance",
    note: "Open API 키(JWT 서명) 필요. currency.withdraw_fee 필드가 온체인 출금 수수료다.",
  },
  bithumb: {
    kind: "authenticated-api",
    reference: "GET https://api.bithumb.com/v1/withdraws/chance",
    note: "빗썸 2.0 Open API 키 필요. 업비트와 동일한 응답 스키마를 따른다.",
  },
  coinone: {
    kind: "public-api",
    reference: "GET https://api.coinone.co.kr/public/v2/currencies",
    note: "무인증 공개 API. 응답의 withdrawal_fee 를 그대로 사용한다.",
  },
  korbit: {
    kind: "public-api",
    reference: "GET https://api.korbit.co.kr/v2/currencies",
    note: "무인증 공개 API. withdrawal_tx_fee 필드를 사용한다.",
  },
  gopax: {
    kind: "public-api",
    reference: "GET https://api.gopax.co.kr/assets",
    note: "무인증 공개 API. withdrawalFee 필드를 사용한다.",
  },
};

/** 거래소별 KRW 마켓 상장 심볼 집합. */
export type ListedSymbols = Record<DomesticExchange, Set<string>>;

export async function fetchDomesticListings(): Promise<ListedSymbols> {
  const [upbit, bithumb, coinone, korbit, gopax] = await Promise.all([
    fetchUpbitSymbols().catch(() => new Set<string>()),
    fetchBithumbSymbols().catch(() => new Set<string>()),
    fetchCoinoneSymbols().catch(() => new Set<string>()),
    fetchKorbitSymbols().catch(() => new Set<string>()),
    fetchGopaxSymbols().catch(() => new Set<string>()),
  ]);
  return { upbit, bithumb, coinone, korbit, gopax };
}

async function fetchUpbitSymbols(): Promise<Set<string>> {
  const rows = await fetchJson<{ market: string }[]>("https://api.upbit.com/v1/market/all", {
    provider: "upbit",
  });
  return krwSymbols(rows.map((r) => r.market));
}

async function fetchBithumbSymbols(): Promise<Set<string>> {
  const rows = await fetchJson<{ market: string }[]>("https://api.bithumb.com/v1/market/all", {
    provider: "bithumb",
  });
  return krwSymbols(rows.map((r) => r.market));
}

async function fetchCoinoneSymbols(): Promise<Set<string>> {
  const json = await fetchJson<{ markets: { target_currency: string }[] }>(
    "https://api.coinone.co.kr/public/v2/markets/KRW",
    { provider: "coinone" },
  );
  return new Set(json.markets.map((m) => m.target_currency.toUpperCase()));
}

async function fetchKorbitSymbols(): Promise<Set<string>> {
  const json = await fetchJson<Record<string, unknown>>("https://api.korbit.co.kr/v2/tickers", {
    provider: "korbit",
  });
  // 응답은 { "btc_krw": {...}, "eth_krw": {...} } 형태다.
  const data = (json.data ?? json) as Record<string, unknown>;
  return krwSymbols(Object.keys(data).map((k) => k.replace("_", "-")), "suffix");
}

async function fetchGopaxSymbols(): Promise<Set<string>> {
  const rows = await fetchJson<{ name: string }[]>("https://api.gopax.co.kr/trading-pairs", {
    provider: "gopax",
  });
  return krwSymbols(rows.map((r) => r.name), "suffix");
}

/** "KRW-BTC"(prefix) 또는 "BTC-KRW"(suffix) 목록에서 KRW 마켓 심볼만 추출한다. */
function krwSymbols(markets: string[], layout: "prefix" | "suffix" = "prefix"): Set<string> {
  const out = new Set<string>();
  for (const market of markets) {
    const [left, right] = market.toUpperCase().split("-");
    if (layout === "prefix" && left === "KRW" && right) out.add(right);
    if (layout === "suffix" && right === "KRW" && left) out.add(left);
  }
  return out;
}

/** 심볼 → 거래소별 온체인 출금 수수료(코인 수량). */
export type WithdrawalFeeTable = Map<string, Record<DomesticExchange, number | null>>;

/**
 * 5대 거래소 온체인 출금 수수료를 모은다.
 * 공개 API 가 있는 거래소는 실시간 조회하고, 나머지는 수동 관리 테이블로 채운다.
 */
export async function fetchWithdrawalFees(symbols: string[]): Promise<WithdrawalFeeTable> {
  const [coinone, korbit, gopax] = await Promise.all([
    fetchCoinoneFees().catch(() => new Map<string, number>()),
    fetchKorbitFees().catch(() => new Map<string, number>()),
    fetchGopaxFees().catch(() => new Map<string, number>()),
  ]);

  const live: Partial<Record<DomesticExchange, Map<string, number>>> = { coinone, korbit, gopax };

  const table: WithdrawalFeeTable = new Map();
  for (const symbol of symbols) {
    const upper = symbol.toUpperCase();
    const manual = MANUAL_WITHDRAWAL_FEES[upper];
    const row = {} as Record<DomesticExchange, number | null>;
    for (const exchange of DOMESTIC_EXCHANGES) {
      const fromApi = live[exchange]?.get(upper);
      row[exchange] = fromApi ?? manual?.[exchange] ?? null;
    }
    table.set(upper, row);
  }
  return table;
}

async function fetchCoinoneFees(): Promise<Map<string, number>> {
  const json = await fetchJson<{ currencies: { symbol: string; withdrawal_fee: string }[] }>(
    "https://api.coinone.co.kr/public/v2/currencies",
    { provider: "coinone" },
  );
  const map = new Map<string, number>();
  for (const c of json.currencies ?? []) {
    const fee = Number(c.withdrawal_fee);
    if (Number.isFinite(fee)) map.set(c.symbol.toUpperCase(), fee);
  }
  return map;
}

async function fetchKorbitFees(): Promise<Map<string, number>> {
  const json = await fetchJson<{
    data?: Record<string, { withdrawal_tx_fee?: string | number }>;
  }>("https://api.korbit.co.kr/v2/currencies", { provider: "korbit" });
  const map = new Map<string, number>();
  for (const [symbol, info] of Object.entries(json.data ?? {})) {
    const fee = Number(info?.withdrawal_tx_fee);
    if (Number.isFinite(fee)) map.set(symbol.toUpperCase(), fee);
  }
  return map;
}

async function fetchGopaxFees(): Promise<Map<string, number>> {
  const rows = await fetchJson<{ id: string; withdrawalFee: number }[]>(
    "https://api.gopax.co.kr/assets",
    { provider: "gopax" },
  );
  const map = new Map<string, number>();
  for (const row of rows) {
    if (Number.isFinite(row.withdrawalFee)) map.set(row.id.toUpperCase(), row.withdrawalFee);
  }
  return map;
}
