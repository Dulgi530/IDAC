import {
  DOMESTIC_EXCHANGES,
  GLOBAL_EXCHANGES,
  type CoinEntry,
  type DataSourceMode,
  type DomesticExchange,
  type GlobalExchange,
  type ListingMap,
  type Report,
  type ReportMeta,
  type ReportSource,
} from "./types";
import { gradeByRank, sortEntries, stabilityScore, sustainabilityScore, usabilityScore } from "./grading";
import { buildSummary } from "./narrative";
import { COIN_PROFILES, type CoinProfile } from "../../data/profiles";
import {
  DOMESTIC_LISTING_SNAPSHOT,
  GLOBAL_LISTING_SNAPSHOT,
  MARKET_SNAPSHOT,
  SNAPSHOT_AS_OF,
  SNAPSHOT_USD_KRW,
  type MarketSnapshotRow,
} from "../../data/market-snapshot";
import { FEE_TABLE_UPDATED_AT, MANUAL_WITHDRAWAL_FEES, TRADING_FEE_PCT } from "../../data/withdrawal-fees";
import { formatKrwCompact } from "../format";
import { fetchTopListings, fetchUsdKrw, fetchDailyCloses } from "../providers/coinmarketcap";
import { fetchDomesticListings, fetchWithdrawalFees } from "../providers/domestic";
import { fetchGlobalListings, listedGlobalExchanges } from "../providers/global";
import { fetchSkynetScores, isSkynetConfigured } from "../providers/skynet";
import { fetchXangleProfiles, isXangleConfigured, type XangleProfile } from "../providers/xangle";

/** A 단계에서 남길 후보 수. */
const STAGE_A_SIZE = 60;
/** B 단계 최종 선정 수. */
const STAGE_B_SIZE = 30;
/** 국내 거래소 최소 상장 수 — "3군데 이상 상장 + 즉시 환급" 요건. */
const MIN_DOMESTIC_LISTINGS = 3;
/**
 * 수수료 부담률의 기준이 되는 표준 이체금액(원).
 * 코인마다 1개 단가가 크게 다르므로, 같은 금액을 옮길 때 드는 비용으로 환산해야
 * 코인 간 수수료 비교가 성립한다.
 */
const STANDARD_TRANSFER_KRW = 1_000_000;

export interface GenerateOptions {
  /** "2026-09" 형식. */
  period: string;
  mode: DataSourceMode;
}

/** 파이프라인 내부에서 코인 1종에 대해 모아 두는 원시 데이터. */
interface Candidate {
  /** C/D/E 정성 데이터. A단계 후보군에는 프로필 없는 종목도 포함된다. */
  profile: CoinProfile | null;
  market: MarketSnapshotRow;
  /** GTF 90거래일 연환산 변동성(%). 시계열이 없으면 null. */
  vol90dPct: number | null;
  /** GTF 180거래일 연환산 변동성(%). 시계열이 없으면 null. */
  vol180dPct: number | null;
  priceKrw: number;
  marketCapKrw: number;
  listings: ListingMap;
  domesticListingCount: number;
  globalListings: GlobalExchange[];
  feeByExchange: Record<DomesticExchange, number | null>;
  medianFeeAmount: number;
  skynetScore: number | null;
  xangle: XangleProfile | null;
}

export async function generateReport(options: GenerateOptions): Promise<Report> {
  const { period, mode } = options;
  const startedAt = Date.now();
  const notices: string[] = [];
  const sources: ReportSource[] = [];

  const collected =
    mode === "live"
      ? await collectLive(notices, sources)
      : collectFixture(notices, sources);

  const { candidates, usdKrw, asOf, krMarketSizes } = collected;

  // ── A 단계 ────────────────────────────────────────────────────────────
  // 1.2 수수료 / 2.1 변동성 / 2.2 규모를 기준으로 후보군을 좁힌다.
  // 스테이블코인은 요구사항에 따라 2.2(규모) 조건만 적용한다.
  const stageA = candidates
    .filter((c) => c.market.cmcRank <= 100)
    .filter((c) => c.globalListings.length >= 2)
    .filter((c) => isStable(c) || c.market.annualizedVolatilityPct <= 120)
    .sort((a, b) => b.marketCapKrw - a.marketCapKrw)
    .slice(0, STAGE_A_SIZE);

  // ── B 단계 ────────────────────────────────────────────────────────────
  // 국내 5대 거래소 중 3곳 이상에 상장된 코인만 남긴다(즉시 원화 환급 요건).
  const domesticQualified = stageA.filter((c) => c.domesticListingCount >= MIN_DOMESTIC_LISTINGS);

  // C/D/E(재단·백서·SNS) 정성 데이터가 없으면 리포트를 채울 수 없으므로 제외하고,
  // 제외된 종목은 숨기지 않고 유의사항으로 남긴다.
  const missingProfile = domesticQualified.filter((c) => c.profile === null);
  if (missingProfile.length > 0) {
    notices.push(
      `국내 상장 요건은 충족하나 재단·백서·SNS 정성 데이터가 없어 최종 선정에서 제외한 종목: ${missingProfile
        .map((c) => c.market.symbol)
        .join(", ")}`,
    );
  }

  const stageB = domesticQualified
    .filter((c): c is Candidate & { profile: CoinProfile } => c.profile !== null)
    .sort((a, b) => b.marketCapKrw - a.marketCapKrw)
    .slice(0, STAGE_B_SIZE);

  if (stageA.length < STAGE_A_SIZE) {
    notices.push(
      `1차 후보군이 ${stageA.length}종으로 목표치 ${STAGE_A_SIZE}종에 미달했습니다. 시장 스냅샷의 종목 수를 늘려야 합니다.`,
    );
  }

  if (stageB.length < STAGE_B_SIZE) {
    notices.push(
      `국내 3개 거래소 이상 상장 요건을 충족한 코인이 ${stageB.length}종으로, 목표치 ${STAGE_B_SIZE}종에 미달했습니다.`,
    );
  }

  // ── 상대 등급 산정 (B.1.2 / B.2.2 / E.2.1) ────────────────────────────
  const volatilityGrades = gradeByRank(
    stageB.map((c) => c.market.annualizedVolatilityPct),
    false, // 변동성은 낮을수록 A
  );
  const scaleGrades = gradeByRank(
    stageB.map((c) => c.marketCapKrw),
    true, // 규모는 클수록 A
  );
  const communityGrades = gradeByRank(
    stageB.map((c) => communityActivityIndex(c.profile)),
    true,
  );
  // 1.2 이체 수수료도 같은 5분위 상대평가로 등급화한다. 부담률이 낮을수록 A.
  const feeGrades = gradeByRank(
    stageB.map((c) => (c.medianFeeAmount * c.priceKrw) / STANDARD_TRANSFER_KRW),
    false,
  );

  // ── 코인별 항목 조립 (B ~ F) ──────────────────────────────────────────
  const entries: CoinEntry[] = stageB.map((c, i) => {
    // 1.2 이체 수수료: 출금 수수료(코인 수량)에 현재가를 적용해 원화로 환산한다.
    const feeKrw = c.medianFeeAmount * c.priceKrw;
    // 부담률: 100만원을 이체할 때 수수료가 차지하는 비중.
    const feeRatioPct = (feeKrw / STANDARD_TRANSFER_KRW) * 100;

    const totalMembers = c.profile.sns.reduce((sum, ch) => sum + (ch.members ?? 0), 0);

    const usability = usabilityScore({
      domesticListingCount: c.domesticListingCount,
      feeRatioPct,
      useCaseScore: c.profile.useCaseScore,
    });
    const sustainability = sustainabilityScore({
      volatilityGrade: volatilityGrades[i],
      scaleGrade: scaleGrades[i],
      communityGrade: communityGrades[i],
      foundationScore: c.profile.foundationScore,
    });
    const stability = stabilityScore({
      volatilityGrade: volatilityGrades[i],
      scaleGrade: scaleGrades[i],
      communityGrade: communityGrades[i],
      foundationScore: c.profile.foundationScore,
    });

    const entry: CoinEntry = {
      rank: 0, // 정렬 후 부여
      symbol: c.profile.symbol,
      name: c.profile.name,
      nameKo: c.profile.nameKo,
      isStablecoin: c.profile.isStablecoin,
      priceKrw: c.priceKrw,
      listings: c.listings,
      domesticListingCount: c.domesticListingCount,
      globalListings: c.globalListings,
      fee: {
        network: c.profile.network,
        byExchange: c.feeByExchange,
        medianAmount: c.medianFeeAmount,
        medianKrw: feeKrw,
        ratioPct: round4(feeRatioPct),
        tradingFeePct: averageTradingFee(c.listings),
        grade: feeGrades[i],
      },
      volatility: {
        changeRate1yPct: c.market.changeRate1yPct,
        annualizedVolatilityPct: c.market.annualizedVolatilityPct,
        annualized90dPct: c.vol90dPct,
        annualized180dPct: c.vol180dPct,
        maxDrawdownPct: c.market.maxDrawdownPct,
        grade: volatilityGrades[i],
      },
      scale: {
        marketCapKrw: c.marketCapKrw,
        marketCapKrwText: formatKrwCompact(c.marketCapKrw),
        cmcRank: c.market.cmcRank,
        circulatingSupply: c.market.circulatingSupply,
        totalSupply: c.market.totalSupply,
        grade: scaleGrades[i],
      },
      foundation: c.profile.foundation,
      whitepaper: c.profile.whitepaper,
      community: {
        channels: c.profile.sns,
        totalMembers,
        monthlyMessages: c.profile.monthlyMessages,
        grade: communityGrades[i],
      },
      skynetScore: c.skynetScore,
      xangle: c.xangle
        ? {
            profileUrl: c.xangle.profileUrl,
            disclosureCount: c.xangle.disclosureCount,
            lastDisclosureAt: c.xangle.lastDisclosureAt,
            score: c.xangle.score,
          }
        : null,
      scores: {
        usability,
        sustainability,
        stability,
        total: round2(usability * 0.4 + sustainability * 0.6),
      },
      summary: "",
    };

    entry.summary = buildSummary(entry);
    return entry;
  });

  // ── 최종 정렬 (안정성 티어 → 수수료 낮은 순) ──────────────────────────
  const ranked = sortEntries(entries).map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    period,
    title: `${period.replace("-", "년 ").replace(/(\d+)$/, (m) => `${Number(m)}월`)} 디지털자산 활용성·지속가능성 평가 리포트`,
    asOf,
    generatedAt: new Date().toISOString(),
    dataSource: mode,
    usdKrw,
    universe: { stageA: stageA.length, stageB: stageB.length },
    entries: ranked,
    sources,
    meta: {
      durationMs: Date.now() - startedAt,
      globalExchanges: [...GLOBAL_EXCHANGES],
      krMarketSizes,
    } satisfies ReportMeta,
    notices,
  };
}

/** live 모드: 실제 외부 API 를 호출해 데이터를 모은다. */
async function collectLive(notices: string[], sources: ReportSource[]) {
  sources.push(
    {
      id: "cmc",
      label: "코인마켓캡 Pro API",
      detail: "시가총액 상위 100위 시세·유통량 + 1년 일봉 OHLCV (listings/latest, ohlcv/historical)",
    },
    {
      id: "kr-exchanges",
      label: "국내 5대 거래소 공개 API",
      detail: "업비트·빗썸·코인원·코빗·고팍스 KRW 마켓 상장 여부 및 온체인 출금 수수료",
    },
    {
      id: "global-exchanges",
      label: "해외 5대 거래소 공개 API",
      detail: "바이낸스·코인베이스·OKX·바이비트·크라켄 활성 거래쌍 — A단계 후보군 판정",
    },
  );

  const [listings, usdKrw, domestic, global] = await Promise.all([
    fetchTopListings(100),
    fetchUsdKrw(),
    fetchDomesticListings(),
    fetchGlobalListings(),
  ]);

  const profileBySymbol = new Map(COIN_PROFILES.map((p) => [p.symbol, p]));
  // A단계 후보군은 시총 상위 전체를 대상으로 한다. 정성 데이터(C/D/E)가 있는지는
  // B단계에서 따진다.
  const symbols = listings.map((l) => l.symbol);
  const feeTable = await fetchWithdrawalFees(symbols);

  let skynet = new Map<string, { securityScore: number }>();
  if (isSkynetConfigured()) {
    sources.push({
      id: "certik",
      label: "CertiK Skynet",
      detail: "프로젝트 보안 점수(Security Score) — 재단 운영 지속성 보조 지표",
    });
    skynet = await fetchSkynetScores(symbols).catch(() => new Map());
  } else {
    notices.push("SKYNET_API_KEY 가 없어 CertiK Skynet 보안 점수는 리포트에서 제외되었습니다.");
  }

  let xangle = new Map<string, XangleProfile>();
  if (isXangleConfigured()) {
    sources.push({
      id: "xangle",
      label: "쟁글(Xangle) 공시",
      detail: "재단 공시 건수와 최근 공시 시점 — 2.3 재단 활동 지속성 근거",
    });
    xangle = await fetchXangleProfiles(symbols).catch(() => new Map());
  } else {
    notices.push("XANGLE_API_KEY 가 없어 쟁글 공시 현황은 리포트에서 제외되었습니다.");
  }

  const candidates: Candidate[] = [];
  for (const listing of listings) {
    const profile = profileBySymbol.get(listing.symbol) ?? null;

    // 1년 변동률·변동성은 일봉 종가로 직접 계산한다.
    const closes = await fetchDailyCloses(listing.cmcId).catch(() => []);
    const series = closes.map((c) => c.close);
    const stats = series.length >= 30 ? computeVolatility(series) : null;
    if (!stats) {
      notices.push(`${listing.symbol}: 1년 일봉 데이터를 가져오지 못해 변동성 계산에서 제외했습니다.`);
      continue;
    }

    const listingMap = toListingMap((exchange) => domestic[exchange].has(listing.symbol));
    const feeRow = feeTable.get(listing.symbol) ?? emptyFeeRow();

    candidates.push({
      profile,
      vol90dPct: windowedVolatility(series, 90),
      vol180dPct: windowedVolatility(series, 180),
      market: {
        symbol: listing.symbol,
        cmcRank: listing.cmcRank,
        priceUsd: listing.priceUsd,
        circulatingSupply: listing.circulatingSupply,
        totalSupply: listing.totalSupply,
        changeRate1yPct: stats.changeRate1yPct,
        annualizedVolatilityPct: stats.annualizedVolatilityPct,
        maxDrawdownPct: stats.maxDrawdownPct,
        verified: true,
      },
      priceKrw: listing.priceKrw,
      marketCapKrw: listing.marketCapKrw,
      listings: listingMap,
      domesticListingCount: countListed(listingMap),
      globalListings: listedGlobalExchanges(listing.symbol, global),
      feeByExchange: feeRow,
      medianFeeAmount: median(Object.values(feeRow).filter((v): v is number => v != null)),
      skynetScore: skynet.get(listing.symbol)?.securityScore ?? null,
      xangle: xangle.get(listing.symbol) ?? null,
    });
  }

  const krMarketSizes: Partial<Record<DomesticExchange, number>> = {};
  for (const exchange of DOMESTIC_EXCHANGES) krMarketSizes[exchange] = domestic[exchange].size;

  return { candidates, usdKrw, asOf: new Date().toISOString(), krMarketSizes };
}

/** fixture 모드: 저장된 스냅샷으로 동일한 파이프라인을 태운다. */
function collectFixture(notices: string[], sources: ReportSource[]) {
  notices.push(
    "fixture 모드에는 일봉 시계열이 없어 GTF 90D·180D 연환산 변동성은 산출되지 않습니다. live 모드에서만 표기됩니다.",
    "CertiK Skynet 보안 점수와 쟁글(Xangle) 공시 현황은 fixture 모드에서 조회되지 않습니다. live 모드에서 각 API 키를 설정해야 반영됩니다.",
    "이 리포트는 오프라인 스냅샷(fixture) 으로 생성되었습니다. 시세·시가총액·변동성 수치는 조사 기반 기준값이며, 발행용 리포트는 반드시 live 모드로 재생성해야 합니다.",
    `국내 거래소 출금 수수료는 ${FEE_TABLE_UPDATED_AT} 기준 수동 관리 테이블 값입니다.`,
  );
  sources.push(
    {
      id: "cmc-snapshot",
      label: "코인마켓캡 공개 시세 자료",
      detail: "오프라인 스냅샷으로 교차 확인한 시세·시가총액·유통량 기준값",
    },
    {
      id: "kr-fee-table",
      label: "국내 5대 거래소 수수료 안내",
      detail: `업비트·빗썸·코인원·코빗·고팍스 출금 수수료 수동 관리 테이블 (${FEE_TABLE_UPDATED_AT} 기준)`,
    },
    {
      id: "project-docs",
      label: "각 프로젝트 공식 자료",
      detail: "재단 홈페이지·백서·SNS 채널 — C/D/E 항목 정성 데이터",
    },
  );

  const profileBySymbol = new Map(COIN_PROFILES.map((p) => [p.symbol, p]));
  const candidates: Candidate[] = [];

  for (const market of MARKET_SNAPSHOT) {
    const profile = profileBySymbol.get(market.symbol) ?? null;

    const priceKrw = market.priceUsd * SNAPSHOT_USD_KRW;
    const domestic = new Set(DOMESTIC_LISTING_SNAPSHOT[market.symbol] ?? []);
    const listingMap = toListingMap((exchange) => domestic.has(exchange));

    const manual = MANUAL_WITHDRAWAL_FEES[market.symbol] ?? {};
    const feeRow = emptyFeeRow();
    for (const exchange of DOMESTIC_EXCHANGES) {
      // 미상장 거래소는 수수료를 표기하지 않는다.
      feeRow[exchange] = listingMap[exchange] ? manual[exchange] ?? null : null;
    }

    candidates.push({
      profile,
      // 스냅샷에는 일봉 시계열이 없으므로 구간 변동성은 산출할 수 없다.
      vol90dPct: null,
      vol180dPct: null,
      market,
      priceKrw,
      marketCapKrw: priceKrw * market.circulatingSupply,
      listings: listingMap,
      domesticListingCount: countListed(listingMap),
      globalListings: (GLOBAL_LISTING_SNAPSHOT[market.symbol] ?? []) as GlobalExchange[],
      feeByExchange: feeRow,
      medianFeeAmount: median(Object.values(feeRow).filter((v): v is number => v != null)),
      skynetScore: null,
      xangle: null,
    });
  }

  const unverified = MARKET_SNAPSHOT.filter((m) => !m.verified).map((m) => m.symbol);
  if (unverified.length > 0) {
    notices.push(`시세 교차 검증이 완료되지 않은 종목: ${unverified.join(", ")}`);
  }

  const krMarketSizes: Partial<Record<DomesticExchange, number>> = {};
  for (const exchange of DOMESTIC_EXCHANGES) krMarketSizes[exchange] = 0;
  for (const listed of Object.values(DOMESTIC_LISTING_SNAPSHOT)) {
    for (const exchange of listed as readonly DomesticExchange[]) {
      krMarketSizes[exchange] = (krMarketSizes[exchange] ?? 0) + 1;
    }
  }

  return { candidates, usdKrw: SNAPSHOT_USD_KRW, asOf: SNAPSHOT_AS_OF, krMarketSizes };
}

/**
 * GTF 구간 변동성. 엑셀 산식과 동일하게 일별 로그수익률 `LN(Pₜ / Pₜ₋₁)` 에
 * 표본 표준편차(STDEV.S)를 적용한 뒤 연환산 계수 √365 를 곱한다.
 * (24/7 거래되는 디지털자산 기준. 주식이라면 √245 를 쓴다.)
 *
 * 최근 `window` 개의 종가만 사용하며, 표본이 모자라면 null 을 돌려준다.
 */
export function windowedVolatility(closes: number[], window: number): number | null {
  if (closes.length < window + 1) return null;
  const slice = closes.slice(-(window + 1));

  const returns: number[] = [];
  for (let i = 1; i < slice.length; i += 1) {
    if (slice[i - 1] > 0 && slice[i] > 0) returns.push(Math.log(slice[i] / slice[i - 1]));
  }
  if (returns.length < 2) return null;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
  return round2(Math.sqrt(variance) * Math.sqrt(365) * 100);
}

/** 일봉 종가 배열에서 1년 변동률·연율 변동성·최대 낙폭을 계산한다. */
export function computeVolatility(closes: number[]) {
  const first = closes[0];
  const last = closes[closes.length - 1];

  const returns: number[] = [];
  for (let i = 1; i < closes.length; i += 1) {
    if (closes[i - 1] > 0) returns.push(Math.log(closes[i] / closes[i - 1]));
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, returns.length - 1);
  const annualizedVolatilityPct = Math.sqrt(variance) * Math.sqrt(365) * 100;

  let peak = closes[0];
  let maxDrawdown = 0;
  for (const close of closes) {
    if (close > peak) peak = close;
    const drawdown = (close - peak) / peak;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    changeRate1yPct: round2(((last - first) / first) * 100),
    annualizedVolatilityPct: round2(annualizedVolatilityPct),
    maxDrawdownPct: round2(maxDrawdown * 100),
  };
}

/** E.2.1 참가자 수와 메시지 수를 합성한 커뮤니티 활성도 지표. */
function communityActivityIndex(profile: CoinProfile): number {
  const members = profile.sns.reduce((sum, ch) => sum + (ch.members ?? 0), 0);
  const messages = profile.monthlyMessages ?? 0;
  // 규모 편차가 크므로 로그 스케일로 합성한다. 참가자 60%, 메시지 40% 가중.
  return Math.log10(members + 1) * 0.6 + Math.log10(messages + 1) * 0.4;
}

/** 스테이블코인 판정. 프로필이 없으면 스냅샷 심볼로 판정한다. */
function isStable(c: Candidate): boolean {
  if (c.profile) return c.profile.isStablecoin;
  return STABLE_SYMBOLS.has(c.market.symbol);
}

const STABLE_SYMBOLS = new Set(["USDT", "USDC", "DAI", "FDUSD", "USDE", "PYUSD", "TUSD"]);

function toListingMap(predicate: (exchange: DomesticExchange) => boolean): ListingMap {
  const map = {} as ListingMap;
  for (const exchange of DOMESTIC_EXCHANGES) map[exchange] = predicate(exchange);
  return map;
}

function countListed(map: ListingMap): number {
  return DOMESTIC_EXCHANGES.filter((exchange) => map[exchange]).length;
}

function emptyFeeRow(): Record<DomesticExchange, number | null> {
  const row = {} as Record<DomesticExchange, number | null>;
  for (const exchange of DOMESTIC_EXCHANGES) row[exchange] = null;
  return row;
}

/** 상장된 거래소의 매매 수수료율 평균. */
function averageTradingFee(listings: ListingMap): number {
  const rates = DOMESTIC_EXCHANGES.filter((ex) => listings[ex]).map((ex) => TRADING_FEE_PCT[ex]);
  if (rates.length === 0) return 0;
  return round4(rates.reduce((a, b) => a + b, 0) / rates.length);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
