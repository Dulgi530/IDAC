import {
  DOMESTIC_EXCHANGES,
  DOMESTIC_EXCHANGE_LABEL,
  type CoinEntry,
  type DomesticExchange,
  type Grade,
  type Report,
  type ReportSource,
} from "./evaluation/types";

/**
 * 리포트 화면(`/`)이 소비하는 스냅샷 표현.
 *
 * `Report` 는 평가 규격을 그대로 옮긴 도메인 모델이라 중첩이 깊다. 화면은
 * 한 줄에 여러 항목을 붙여 보여주므로, 표에 필요한 값만 평평하게 펴서
 * 내려준다. 계산은 전부 파이프라인에서 끝났고 여기서는 재배치만 한다.
 */

export interface SnapshotSummary {
  period: string;
  status: "ready";
  coinCount: number;
  fxUsdKrw: number;
  updatedAt: string;
}

export interface SnapshotMeta {
  durationMs: number;
  globalExchanges: string[];
  krMarketSizes: Partial<Record<DomesticExchange, number>> | null;
  sources: ReportSource[];
}

export interface SnapshotInfo extends SnapshotSummary {
  title: string;
  asOf: string;
  dataSource: Report["dataSource"];
  universe: Report["universe"];
  notices: string[];
  meta: SnapshotMeta;
}

/** 거래소 1곳의 출금 수수료. */
export interface ExchangeFee {
  /** 출금 수수료(코인 수량). 미상장·미제공은 null. */
  feeCoin: number | null;
  /** 위 값을 현재가로 환산한 USD 금액. */
  feeUsd: number | null;
}

export interface SnapshotCoin {
  rank: number;
  symbol: string;
  name: string;
  nameKo: string;
  isStablecoin: boolean;

  priceKrw: number;
  priceUsd: number;

  marketCapKrw: number;
  marketCapUsd: number;
  marketCapLabel: string;
  marketCapGrade: Grade;

  /** 1년 연환산 변동성(%). */
  vol1yPct: number;
  /** GTF 90거래일 연환산 변동성(%). 시계열이 없으면 null. */
  vol90dPct: number | null;
  /** GTF 180거래일 연환산 변동성(%). 시계열이 없으면 null. */
  vol180dPct: number | null;
  volGrade: Grade;
  priceChange1yPct: number;
  maxDrawdownPct: number;

  feeGrade: Grade;
  feeLabel: string;
  /** 100만원 이체 기준 수수료 부담률(%). */
  feeRatioPct: number;
  feeNetwork: string;
  feePerExchange: {
    exchanges: Record<DomesticExchange, ExchangeFee>;
    /** 값이 있는 거래소들의 평균 USD 수수료. */
    averageUsd: number | null;
    sampleSize: number;
  };

  exchangeCountKr: number;
  exchangesKr: string[];

  foundationName: string;
  foundationUrl: string;
  foundationDesc: string;
  goalDesc: string;
  useDesc: string;

  snsGrade: Grade;
  snsTotalMembers: number;
  snsXUrl: string | null;
  snsXFollowers: number | null;
  snsTelegramUrl: string | null;
  snsTelegramFollowers: number | null;
  snsDiscordUrl: string | null;
  snsDiscordFollowers: number | null;
  snsRedditUrl: string | null;
  snsRedditFollowers: number | null;
  snsGithubUrl: string | null;

  compositeScore: number;
  usabilityScore: number;
  sustainabilityScore: number;
  skynetScore: number | null;

  summary: string;
}

export interface SnapshotPayload {
  snapshot: SnapshotInfo;
  coins: SnapshotCoin[];
}

/** 수수료 등급에 붙는 사람이 읽는 라벨. */
const FEE_GRADE_LABEL: Record<Grade, string> = {
  A: "A (매우 낮음)",
  B: "B (낮음)",
  C: "C (보통)",
  D: "D (높음)",
  E: "E (매우 높음)",
};

export function toSnapshotPayload(report: Report): SnapshotPayload {
  return {
    snapshot: {
      period: report.period,
      status: "ready",
      title: report.title,
      coinCount: report.entries.length,
      fxUsdKrw: report.usdKrw,
      asOf: report.asOf,
      updatedAt: report.generatedAt,
      dataSource: report.dataSource,
      universe: report.universe,
      notices: report.notices,
      meta: {
        durationMs: report.meta.durationMs,
        globalExchanges: report.meta.globalExchanges,
        krMarketSizes: report.meta.krMarketSizes,
        sources: report.sources,
      },
    },
    coins: report.entries.map((entry) => toSnapshotCoin(entry, report.usdKrw)),
  };
}

export function toSnapshotSummary(report: Report): SnapshotSummary {
  return {
    period: report.period,
    status: "ready",
    coinCount: report.entries.length,
    fxUsdKrw: report.usdKrw,
    updatedAt: report.generatedAt,
  };
}

function toSnapshotCoin(entry: CoinEntry, usdKrw: number): SnapshotCoin {
  const exchanges = {} as Record<DomesticExchange, ExchangeFee>;
  const feesUsd: number[] = [];

  for (const exchange of DOMESTIC_EXCHANGES) {
    const feeCoin = entry.fee.byExchange[exchange];
    // 수수료(코인 수량) × 코인 현재가(원) ÷ 환율 = USD 환산 수수료.
    const feeUsd = feeCoin == null ? null : (feeCoin * entry.priceKrw) / usdKrw;
    if (feeUsd != null) feesUsd.push(feeUsd);
    exchanges[exchange] = { feeCoin, feeUsd };
  }

  const channel = (platform: string) =>
    entry.community.channels.find((c) => c.platform === platform) ?? null;
  const x = channel("X");
  const telegram = channel("Telegram");
  const discord = channel("Discord");
  const reddit = channel("Reddit");
  const github = channel("GitHub");

  return {
    rank: entry.rank,
    symbol: entry.symbol,
    name: entry.name,
    nameKo: entry.nameKo,
    isStablecoin: entry.isStablecoin,

    priceKrw: entry.priceKrw,
    priceUsd: entry.priceKrw / usdKrw,

    marketCapKrw: entry.scale.marketCapKrw,
    marketCapUsd: entry.scale.marketCapKrw / usdKrw,
    marketCapLabel: entry.scale.marketCapKrwText,
    marketCapGrade: entry.scale.grade,

    vol1yPct: entry.volatility.annualizedVolatilityPct,
    vol90dPct: entry.volatility.annualized90dPct,
    vol180dPct: entry.volatility.annualized180dPct,
    volGrade: entry.volatility.grade,
    priceChange1yPct: entry.volatility.changeRate1yPct,
    maxDrawdownPct: entry.volatility.maxDrawdownPct,

    feeGrade: entry.fee.grade,
    feeLabel: FEE_GRADE_LABEL[entry.fee.grade],
    feeRatioPct: entry.fee.ratioPct,
    feeNetwork: entry.fee.network,
    feePerExchange: {
      exchanges,
      averageUsd:
        feesUsd.length === 0 ? null : feesUsd.reduce((a, b) => a + b, 0) / feesUsd.length,
      sampleSize: feesUsd.length,
    },

    exchangeCountKr: entry.domesticListingCount,
    exchangesKr: DOMESTIC_EXCHANGES.filter((ex) => entry.listings[ex]).map(
      (ex) => DOMESTIC_EXCHANGE_LABEL[ex],
    ),

    foundationName: entry.foundation.name,
    foundationUrl: entry.foundation.homepage,
    foundationDesc: entry.foundation.description,
    goalDesc: entry.whitepaper.goal,
    useDesc: entry.whitepaper.useCases,

    snsGrade: entry.community.grade,
    snsTotalMembers: entry.community.totalMembers,
    snsXUrl: x?.url ?? null,
    snsXFollowers: x?.members ?? null,
    snsTelegramUrl: telegram?.url ?? null,
    snsTelegramFollowers: telegram?.members ?? null,
    snsDiscordUrl: discord?.url ?? null,
    snsDiscordFollowers: discord?.members ?? null,
    snsRedditUrl: reddit?.url ?? null,
    snsRedditFollowers: reddit?.members ?? null,
    snsGithubUrl: github?.url ?? null,

    compositeScore: entry.scores.total,
    usabilityScore: entry.scores.usability,
    sustainabilityScore: entry.scores.sustainability,
    skynetScore: entry.skynetScore,

    summary: entry.summary,
  };
}
