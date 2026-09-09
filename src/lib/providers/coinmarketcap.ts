import { fetchJson, ProviderError } from "./http";

/**
 * 코인마켓캡 (평가방식 3.1).
 * 시가총액·가격·유통물량·순위 등 A/B 단계의 기준 데이터를 제공한다.
 */

export interface CmcListing {
  cmcId: number;
  symbol: string;
  name: string;
  slug: string;
  cmcRank: number;
  priceKrw: number;
  priceUsd: number;
  marketCapKrw: number;
  volume24hKrw: number;
  percentChange30d: number;
  percentChange90d: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  tags: string[];
}

interface CmcQuote {
  price: number;
  market_cap: number;
  volume_24h: number;
  percent_change_30d: number | null;
  percent_change_90d: number | null;
}

interface CmcListingRaw {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  tags: string[] | null;
  quote: Record<string, CmcQuote>;
}

function baseUrl(): string {
  return process.env.COINMARKETCAP_BASE_URL || "https://pro-api.coinmarketcap.com";
}

function apiKey(): string {
  const key = process.env.COINMARKETCAP_API_KEY;
  if (!key) {
    throw new ProviderError("coinmarketcap", "COINMARKETCAP_API_KEY 가 설정되어 있지 않습니다.");
  }
  return key;
}

/**
 * 시가총액 상위 N종을 KRW/USD 시세와 함께 조회한다.
 * 요구사항 2.2 (시총 100위 이내) 필터의 원천 데이터.
 */
export async function fetchTopListings(limit = 100): Promise<CmcListing[]> {
  const url = `${baseUrl()}/v1/cryptocurrency/listings/latest?start=1&limit=${limit}&convert=KRW,USD&sort=market_cap`;
  const json = await fetchJson<{ data: CmcListingRaw[] }>(url, {
    provider: "coinmarketcap",
    headers: { "X-CMC_PRO_API_KEY": apiKey() },
    timeoutMs: 15_000,
  });

  return json.data.map((row) => {
    const krw = row.quote.KRW;
    const usd = row.quote.USD;
    return {
      cmcId: row.id,
      symbol: row.symbol,
      name: row.name,
      slug: row.slug,
      cmcRank: row.cmc_rank,
      priceKrw: krw?.price ?? 0,
      priceUsd: usd?.price ?? 0,
      marketCapKrw: krw?.market_cap ?? 0,
      volume24hKrw: krw?.volume_24h ?? 0,
      percentChange30d: krw?.percent_change_30d ?? 0,
      percentChange90d: krw?.percent_change_90d ?? 0,
      circulatingSupply: row.circulating_supply,
      totalSupply: row.total_supply,
      maxSupply: row.max_supply,
      tags: row.tags ?? [],
    };
  });
}

export interface DailyClose {
  date: string;
  close: number;
}

/**
 * 최근 1년 일봉 종가. B.1 가격변동안정성(1년 변동률·연율 변동성) 산출에 사용한다.
 * OHLCV 히스토리는 코인마켓캡 유료 플랜(Hobbyist 이상) 전용 엔드포인트다.
 */
export async function fetchDailyCloses(cmcId: number, days = 365): Promise<DailyClose[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const url =
    `${baseUrl()}/v2/cryptocurrency/ohlcv/historical` +
    `?id=${cmcId}&convert=KRW&interval=daily` +
    `&time_start=${start.toISOString().slice(0, 10)}&time_end=${end.toISOString().slice(0, 10)}`;

  const json = await fetchJson<{
    data: { quotes: { time_close: string; quote: Record<string, { close: number }> }[] };
  }>(url, {
    provider: "coinmarketcap",
    headers: { "X-CMC_PRO_API_KEY": apiKey() },
    timeoutMs: 20_000,
  });

  return (json.data?.quotes ?? []).map((q) => ({
    date: q.time_close.slice(0, 10),
    close: q.quote.KRW?.close ?? 0,
  }));
}

/** USD/KRW 환율. 코인마켓캡 시세 변환 기능을 그대로 사용한다. */
export async function fetchUsdKrw(): Promise<number> {
  const url = `${baseUrl()}/v2/tools/price-conversion?amount=1&symbol=USD&convert=KRW`;
  const json = await fetchJson<{ data: { quote: Record<string, { price: number }> } }>(url, {
    provider: "coinmarketcap",
    headers: { "X-CMC_PRO_API_KEY": apiKey() },
  });
  return json.data.quote.KRW.price;
}
