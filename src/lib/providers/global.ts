import { fetchJson } from "./http";
import { GLOBAL_EXCHANGES, type GlobalExchange } from "../evaluation/types";

/**
 * 해외 거래소 (평가방식 5.1~5.3) 상장 여부 확인.
 * A 단계에서 "글로벌 거래규모 상위 거래소에 상장" 조건을 판정하는 데 쓴다.
 */

export type GlobalListedSymbols = Record<GlobalExchange, Set<string>>;

export async function fetchGlobalListings(): Promise<GlobalListedSymbols> {
  const [binance, coinbase, okx, bybit, kraken] = await Promise.all([
    fetchBinance().catch(() => new Set<string>()),
    fetchCoinbase().catch(() => new Set<string>()),
    fetchOkx().catch(() => new Set<string>()),
    fetchBybit().catch(() => new Set<string>()),
    fetchKraken().catch(() => new Set<string>()),
  ]);
  return { binance, coinbase, okx, bybit, kraken };
}

async function fetchBinance(): Promise<Set<string>> {
  const json = await fetchJson<{ symbols: { baseAsset: string; status: string }[] }>(
    "https://api.binance.com/api/v3/exchangeInfo",
    { provider: "binance", timeoutMs: 20_000 },
  );
  return new Set(
    json.symbols.filter((s) => s.status === "TRADING").map((s) => s.baseAsset.toUpperCase()),
  );
}

async function fetchCoinbase(): Promise<Set<string>> {
  const rows = await fetchJson<{ base_currency: string; status: string }[]>(
    "https://api.exchange.coinbase.com/products",
    { provider: "coinbase" },
  );
  return new Set(
    rows.filter((r) => r.status === "online").map((r) => r.base_currency.toUpperCase()),
  );
}

async function fetchOkx(): Promise<Set<string>> {
  const json = await fetchJson<{ data: { baseCcy: string }[] }>(
    "https://www.okx.com/api/v5/public/instruments?instType=SPOT",
    { provider: "okx" },
  );
  return new Set(json.data.map((d) => d.baseCcy.toUpperCase()));
}

async function fetchBybit(): Promise<Set<string>> {
  const json = await fetchJson<{ result: { list: { baseCoin: string }[] } }>(
    "https://api.bybit.com/v5/market/instruments-info?category=spot",
    { provider: "bybit" },
  );
  return new Set(json.result.list.map((d) => d.baseCoin.toUpperCase()));
}

async function fetchKraken(): Promise<Set<string>> {
  const json = await fetchJson<{ result: Record<string, { base: string }> }>(
    "https://api.kraken.com/0/public/AssetPairs",
    { provider: "kraken" },
  );
  return new Set(
    Object.values(json.result).map((p) => p.base.replace(/^X(?=[A-Z]{3})/, "").toUpperCase()),
  );
}

export function listedGlobalExchanges(
  symbol: string,
  listings: GlobalListedSymbols,
): GlobalExchange[] {
  const upper = symbol.toUpperCase();
  return GLOBAL_EXCHANGES.filter((exchange) => listings[exchange].has(upper));
}
