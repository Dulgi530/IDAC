/**
 * 시장 스냅샷 (fixture 모드 전용).
 *
 * ────────────────────────────────────────────────────────────────────────
 *  이 파일은 코인마켓캡 API 키가 없을 때 앱과 리포트 생성을 검증하기 위한
 *  **오프라인 스냅샷**이다. 운영(live) 모드에서는 전량 코인마켓캡 실시간
 *  데이터로 대체되며, 이 파일은 사용되지 않는다.
 *
 *  `verified: true`  : 공개 자료로 교차 확인한 값
 *  `verified: false` : 시장 상황과 유통량으로부터 산출한 **추정치**
 *
 *  추정치는 리포트에 "검증 필요" 각주로 표기된다. 실제 발행 리포트는
 *  반드시 live 모드로 생성할 것.
 * ────────────────────────────────────────────────────────────────────────
 */

export const SNAPSHOT_AS_OF = "2026-09-09T00:00:00.000Z";

/** 스냅샷 기준 USD/KRW 환율 (2026-09-09 서울외환시장 기준 확인값). */
export const SNAPSHOT_USD_KRW = 1342;

export interface MarketSnapshotRow {
  symbol: string;
  cmcRank: number;
  /** USD 현재가. */
  priceUsd: number;
  /** 유통 물량. */
  circulatingSupply: number;
  /** 총 발행 한도. 무제한이면 null. */
  totalSupply: number | null;
  /** 1년 전 대비 가격 변동률(%). */
  changeRate1yPct: number;
  /** 일간 수익률 표준편차의 연율화 값(%). */
  annualizedVolatilityPct: number;
  /** 1년 내 최대 낙폭(%). */
  maxDrawdownPct: number;
  /** 가격을 공개 자료로 교차 확인했는지 여부. */
  verified: boolean;
}

export const MARKET_SNAPSHOT: MarketSnapshotRow[] = [
  { symbol: "BTC",  cmcRank: 1,  priceUsd: 78337,    circulatingSupply: 19_950_000,      totalSupply: 21_000_000,      changeRate1yPct: -30.1, annualizedVolatilityPct: 45.2, maxDrawdownPct: -38.4, verified: true },
  { symbol: "ETH",  cmcRank: 2,  priceUsd: 2473.51,  circulatingSupply: 120_700_000,     totalSupply: null,            changeRate1yPct: -42.5, annualizedVolatilityPct: 61.3, maxDrawdownPct: -52.1, verified: true },
  { symbol: "USDT", cmcRank: 3,  priceUsd: 1.0002,   circulatingSupply: 175_000_000_000, totalSupply: null,            changeRate1yPct: 0.02,  annualizedVolatilityPct: 0.9,  maxDrawdownPct: -0.4,  verified: true },
  { symbol: "XRP",  cmcRank: 4,  priceUsd: 1.40,     circulatingSupply: 60_500_000_000,  totalSupply: 99_986_000_000,  changeRate1yPct: -50.9, annualizedVolatilityPct: 78.4, maxDrawdownPct: -61.2, verified: true },
  { symbol: "USDC", cmcRank: 5,  priceUsd: 0.9999,   circulatingSupply: 75_000_000_000,  totalSupply: null,            changeRate1yPct: -0.01, annualizedVolatilityPct: 0.6,  maxDrawdownPct: -0.2,  verified: true },
  { symbol: "SOL",  cmcRank: 6,  priceUsd: 102.80,   circulatingSupply: 578_000_000,     totalSupply: null,            changeRate1yPct: -52.2, annualizedVolatilityPct: 82.6, maxDrawdownPct: -64.8, verified: true },
  { symbol: "DOGE", cmcRank: 9,  priceUsd: 0.098,    circulatingSupply: 150_200_000_000, totalSupply: null,            changeRate1yPct: -59.3, annualizedVolatilityPct: 94.1, maxDrawdownPct: -70.5, verified: false },
  { symbol: "TRX",  cmcRank: 10, priceUsd: 0.265,    circulatingSupply: 94_600_000_000,  totalSupply: null,            changeRate1yPct: -12.6, annualizedVolatilityPct: 41.8, maxDrawdownPct: -33.7, verified: true },
  { symbol: "ADA",  cmcRank: 12, priceUsd: 0.2200,   circulatingSupply: 36_000_000_000,  totalSupply: 45_000_000_000,  changeRate1yPct: -73.2, annualizedVolatilityPct: 88.7, maxDrawdownPct: -76.3, verified: true },
  { symbol: "LINK", cmcRank: 14, priceUsd: 10.85,    circulatingSupply: 678_000_000,     totalSupply: 1_000_000_000,   changeRate1yPct: -55.4, annualizedVolatilityPct: 84.2, maxDrawdownPct: -66.1, verified: false },
  { symbol: "AVAX", cmcRank: 18, priceUsd: 8.10,     circulatingSupply: 440_000_000,     totalSupply: 715_000_000,     changeRate1yPct: -66.8, annualizedVolatilityPct: 91.5, maxDrawdownPct: -73.2, verified: true },
  { symbol: "BCH",  cmcRank: 19, priceUsd: 355.00,   circulatingSupply: 19_900_000,      totalSupply: 21_000_000,      changeRate1yPct: -37.5, annualizedVolatilityPct: 63.9, maxDrawdownPct: -49.8, verified: false },
  { symbol: "LTC",  cmcRank: 21, priceUsd: 62.50,    circulatingSupply: 76_300_000,      totalSupply: 84_000_000,      changeRate1yPct: -41.2, annualizedVolatilityPct: 66.4, maxDrawdownPct: -52.7, verified: false },
  { symbol: "HBAR", cmcRank: 24, priceUsd: 0.128,    circulatingSupply: 42_300_000_000,  totalSupply: 50_000_000_000,  changeRate1yPct: -47.7, annualizedVolatilityPct: 79.8, maxDrawdownPct: -62.4, verified: false },
  { symbol: "XLM",  cmcRank: 26, priceUsd: 0.185,    circulatingSupply: 31_500_000_000,  totalSupply: 50_000_000_000,  changeRate1yPct: -48.6, annualizedVolatilityPct: 74.5, maxDrawdownPct: -60.3, verified: true },
  { symbol: "SUI",  cmcRank: 27, priceUsd: 1.32,     circulatingSupply: 3_700_000_000,   totalSupply: 10_000_000_000,  changeRate1yPct: -64.5, annualizedVolatilityPct: 96.3, maxDrawdownPct: -72.8, verified: false },
  { symbol: "DOT",  cmcRank: 31, priceUsd: 2.35,     circulatingSupply: 1_600_000_000,   totalSupply: null,            changeRate1yPct: -42.1, annualizedVolatilityPct: 77.6, maxDrawdownPct: -58.9, verified: false },
  { symbol: "UNI",  cmcRank: 33, priceUsd: 4.85,     circulatingSupply: 630_000_000,     totalSupply: 1_000_000_000,   changeRate1yPct: -46.8, annualizedVolatilityPct: 86.1, maxDrawdownPct: -64.5, verified: false },
  { symbol: "AAVE", cmcRank: 35, priceUsd: 148.00,   circulatingSupply: 15_200_000,      totalSupply: 16_000_000,      changeRate1yPct: -49.3, annualizedVolatilityPct: 88.4, maxDrawdownPct: -66.9, verified: false },
  { symbol: "NEAR", cmcRank: 41, priceUsd: 1.42,     circulatingSupply: 1_280_000_000,   totalSupply: null,            changeRate1yPct: -58.2, annualizedVolatilityPct: 90.7, maxDrawdownPct: -69.4, verified: false },
  { symbol: "APT",  cmcRank: 44, priceUsd: 2.55,     circulatingSupply: 700_000_000,     totalSupply: null,            changeRate1yPct: -61.9, annualizedVolatilityPct: 93.2, maxDrawdownPct: -71.6, verified: false },
  { symbol: "ETC",  cmcRank: 46, priceUsd: 12.40,    circulatingSupply: 152_000_000,     totalSupply: 210_700_000,     changeRate1yPct: -44.6, annualizedVolatilityPct: 72.3, maxDrawdownPct: -57.8, verified: false },
  { symbol: "POL",  cmcRank: 48, priceUsd: 0.145,    circulatingSupply: 10_500_000_000,  totalSupply: null,            changeRate1yPct: -55.1, annualizedVolatilityPct: 85.3, maxDrawdownPct: -65.7, verified: false },
  { symbol: "ARB",  cmcRank: 52, priceUsd: 0.235,    circulatingSupply: 5_200_000_000,   totalSupply: 10_000_000_000,  changeRate1yPct: -57.4, annualizedVolatilityPct: 89.6, maxDrawdownPct: -68.2, verified: false },
  { symbol: "ATOM", cmcRank: 58, priceUsd: 2.95,     circulatingSupply: 470_000_000,     totalSupply: null,            changeRate1yPct: -46.2, annualizedVolatilityPct: 80.4, maxDrawdownPct: -62.9, verified: false },
  { symbol: "ALGO", cmcRank: 62, priceUsd: 0.128,    circulatingSupply: 8_900_000_000,   totalSupply: 10_000_000_000,  changeRate1yPct: -50.7, annualizedVolatilityPct: 83.1, maxDrawdownPct: -64.1, verified: false },
  { symbol: "STX",  cmcRank: 71, priceUsd: 0.385,    circulatingSupply: 1_550_000_000,   totalSupply: 1_818_000_000,   changeRate1yPct: -59.8, annualizedVolatilityPct: 92.5, maxDrawdownPct: -70.3, verified: false },
  { symbol: "OP",   cmcRank: 74, priceUsd: 0.365,    circulatingSupply: 1_700_000_000,   totalSupply: 4_294_000_000,   changeRate1yPct: -62.3, annualizedVolatilityPct: 95.1, maxDrawdownPct: -72.4, verified: false },
  { symbol: "IMX",  cmcRank: 85, priceUsd: 0.315,    circulatingSupply: 1_900_000_000,   totalSupply: 2_000_000_000,   changeRate1yPct: -60.5, annualizedVolatilityPct: 94.8, maxDrawdownPct: -71.1, verified: false },
  { symbol: "SAND", cmcRank: 96, priceUsd: 0.145,    circulatingSupply: 2_600_000_000,   totalSupply: 3_000_000_000,   changeRate1yPct: -63.7, annualizedVolatilityPct: 97.4, maxDrawdownPct: -74.6, verified: false },

  // ── A단계 후보군 확장분 ────────────────────────────────────────────────
  // 시총 100위 이내이나 국내 3개 거래소 미만 상장이라 B단계(최종 30종)에는
  // 오르지 못하는 종목들. 요구사항 A의 "1차 후보 60종"을 채우기 위한 것으로,
  // 정성 데이터(재단·백서·SNS)는 최종 선정 종목에만 작성한다.
  { symbol: "BNB",   cmcRank: 7,  priceUsd: 520.00,      circulatingSupply: 139_000_000,        totalSupply: null,           changeRate1yPct: -38.4, annualizedVolatilityPct: 55.7, maxDrawdownPct: -46.2, verified: false },
  { symbol: "STETH", cmcRank: 8,  priceUsd: 2470.00,     circulatingSupply: 9_200_000,          totalSupply: null,           changeRate1yPct: -42.6, annualizedVolatilityPct: 61.5, maxDrawdownPct: -52.3, verified: false },
  { symbol: "TON",   cmcRank: 11, priceUsd: 1.65,        circulatingSupply: 2_600_000_000,      totalSupply: null,           changeRate1yPct: -55.8, annualizedVolatilityPct: 84.9, maxDrawdownPct: -66.4, verified: false },
  { symbol: "WBTC",  cmcRank: 13, priceUsd: 78_300.00,   circulatingSupply: 128_000,            totalSupply: null,           changeRate1yPct: -30.2, annualizedVolatilityPct: 45.4, maxDrawdownPct: -38.5, verified: false },
  { symbol: "LEO",   cmcRank: 15, priceUsd: 9.20,        circulatingSupply: 924_000_000,        totalSupply: null,           changeRate1yPct: 4.8,   annualizedVolatilityPct: 22.6, maxDrawdownPct: -14.3, verified: false },
  { symbol: "HYPE",  cmcRank: 16, priceUsd: 18.50,       circulatingSupply: 340_000_000,        totalSupply: 1_000_000_000,  changeRate1yPct: -58.9, annualizedVolatilityPct: 98.2, maxDrawdownPct: -70.1, verified: false },
  { symbol: "WBETH", cmcRank: 17, priceUsd: 2680.00,     circulatingSupply: 2_300_000,          totalSupply: null,           changeRate1yPct: -41.8, annualizedVolatilityPct: 61.1, maxDrawdownPct: -51.8, verified: false },
  { symbol: "USDE",  cmcRank: 20, priceUsd: 1.0001,      circulatingSupply: 8_500_000_000,      totalSupply: null,           changeRate1yPct: 0.01,  annualizedVolatilityPct: 1.4,  maxDrawdownPct: -0.9,  verified: false },
  { symbol: "BGB",   cmcRank: 22, priceUsd: 3.85,        circulatingSupply: 1_200_000_000,      totalSupply: null,           changeRate1yPct: -25.4, annualizedVolatilityPct: 68.3, maxDrawdownPct: -44.7, verified: false },
  { symbol: "WEETH", cmcRank: 23, priceUsd: 2690.00,     circulatingSupply: 2_100_000,          totalSupply: null,           changeRate1yPct: -41.5, annualizedVolatilityPct: 60.8, maxDrawdownPct: -51.6, verified: false },
  { symbol: "OKB",   cmcRank: 25, priceUsd: 42.50,       circulatingSupply: 210_000_000,        totalSupply: null,           changeRate1yPct: -18.7, annualizedVolatilityPct: 64.2, maxDrawdownPct: -41.9, verified: false },
  { symbol: "CRO",   cmcRank: 28, priceUsd: 0.085,       circulatingSupply: 33_000_000_000,     totalSupply: null,           changeRate1yPct: -52.3, annualizedVolatilityPct: 81.7, maxDrawdownPct: -63.8, verified: false },
  { symbol: "DAI",   cmcRank: 29, priceUsd: 0.9998,      circulatingSupply: 5_400_000_000,      totalSupply: null,           changeRate1yPct: -0.02, annualizedVolatilityPct: 0.8,  maxDrawdownPct: -0.3,  verified: false },
  { symbol: "MNT",   cmcRank: 30, priceUsd: 0.62,        circulatingSupply: 3_400_000_000,      totalSupply: 6_220_000_000,  changeRate1yPct: -49.6, annualizedVolatilityPct: 79.4, maxDrawdownPct: -61.2, verified: false },
  { symbol: "TAO",   cmcRank: 32, priceUsd: 215.00,      circulatingSupply: 9_600_000,          totalSupply: 21_000_000,     changeRate1yPct: -57.1, annualizedVolatilityPct: 99.6, maxDrawdownPct: -69.8, verified: false },
  { symbol: "ICP",   cmcRank: 34, priceUsd: 2.85,        circulatingSupply: 540_000_000,        totalSupply: null,           changeRate1yPct: -51.4, annualizedVolatilityPct: 83.5, maxDrawdownPct: -64.7, verified: false },
  { symbol: "KAS",   cmcRank: 36, priceUsd: 0.038,       circulatingSupply: 26_000_000_000,     totalSupply: 28_700_000_000, changeRate1yPct: -60.2, annualizedVolatilityPct: 95.3, maxDrawdownPct: -71.5, verified: false },
  { symbol: "XMR",   cmcRank: 37, priceUsd: 215.00,      circulatingSupply: 18_500_000,         totalSupply: null,           changeRate1yPct: -12.4, annualizedVolatilityPct: 48.9, maxDrawdownPct: -32.6, verified: false },
  { symbol: "FDUSD", cmcRank: 38, priceUsd: 0.9995,      circulatingSupply: 1_400_000_000,      totalSupply: null,           changeRate1yPct: -0.03, annualizedVolatilityPct: 1.1,  maxDrawdownPct: -0.6,  verified: false },
  { symbol: "PI",    cmcRank: 39, priceUsd: 0.21,        circulatingSupply: 8_100_000_000,      totalSupply: 100_000_000_000,changeRate1yPct: -68.3, annualizedVolatilityPct: 108.4,maxDrawdownPct: -78.2, verified: false },
  { symbol: "FIL",   cmcRank: 42, priceUsd: 1.55,        circulatingSupply: 700_000_000,        totalSupply: null,           changeRate1yPct: -53.8, annualizedVolatilityPct: 82.1, maxDrawdownPct: -65.3, verified: false },
  { symbol: "ONDO",  cmcRank: 43, priceUsd: 0.34,        circulatingSupply: 3_400_000_000,      totalSupply: 10_000_000_000, changeRate1yPct: -61.7, annualizedVolatilityPct: 94.5, maxDrawdownPct: -72.9, verified: false },
  { symbol: "FET",   cmcRank: 45, priceUsd: 0.36,        circulatingSupply: 2_600_000_000,      totalSupply: 2_630_000_000,  changeRate1yPct: -64.2, annualizedVolatilityPct: 97.8, maxDrawdownPct: -74.1, verified: false },
  { symbol: "LDO",   cmcRank: 49, priceUsd: 0.68,        circulatingSupply: 900_000_000,        totalSupply: 1_000_000_000,  changeRate1yPct: -56.4, annualizedVolatilityPct: 91.2, maxDrawdownPct: -68.7, verified: false },
  { symbol: "QNT",   cmcRank: 51, priceUsd: 58.00,       circulatingSupply: 12_100_000,         totalSupply: 14_600_000,     changeRate1yPct: -47.9, annualizedVolatilityPct: 76.3, maxDrawdownPct: -60.4, verified: false },
  { symbol: "THETA", cmcRank: 54, priceUsd: 0.52,        circulatingSupply: 1_000_000_000,      totalSupply: 1_000_000_000,  changeRate1yPct: -58.6, annualizedVolatilityPct: 88.9, maxDrawdownPct: -68.3, verified: false },
  { symbol: "JUP",   cmcRank: 56, priceUsd: 0.28,        circulatingSupply: 3_000_000_000,      totalSupply: 10_000_000_000, changeRate1yPct: -65.8, annualizedVolatilityPct: 101.7,maxDrawdownPct: -75.4, verified: false },
  { symbol: "RUNE",  cmcRank: 60, priceUsd: 1.05,        circulatingSupply: 3_700_000_000,      totalSupply: null,           changeRate1yPct: -59.3, annualizedVolatilityPct: 96.1, maxDrawdownPct: -71.2, verified: false },
  { symbol: "FLOKI", cmcRank: 66, priceUsd: 0.000062,    circulatingSupply: 9_600_000_000_000,  totalSupply: 10_000_000_000_000, changeRate1yPct: -67.4, annualizedVolatilityPct: 112.3, maxDrawdownPct: -77.6, verified: false },
  { symbol: "GALA",  cmcRank: 70, priceUsd: 0.0095,      circulatingSupply: 39_000_000_000,     totalSupply: 50_000_000_000, changeRate1yPct: -66.1, annualizedVolatilityPct: 105.8,maxDrawdownPct: -76.3, verified: false },
];

/** 국내 5대 거래소 KRW 마켓 상장 현황 스냅샷. */
export const DOMESTIC_LISTING_SNAPSHOT: Record<string, string[]> = {
  BTC:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  ETH:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  USDT: ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  USDC: ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  XRP:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  SOL:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  DOGE: ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  TRX:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  ADA:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  LINK: ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  AVAX: ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  BCH:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  LTC:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  HBAR: ["upbit", "bithumb", "coinone", "korbit"],
  XLM:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  SUI:  ["upbit", "bithumb", "coinone", "korbit"],
  DOT:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  UNI:  ["upbit", "bithumb", "coinone", "korbit"],
  AAVE: ["upbit", "bithumb", "coinone", "korbit"],
  NEAR: ["upbit", "bithumb", "coinone", "korbit"],
  APT:  ["upbit", "bithumb", "coinone", "korbit"],
  ETC:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  POL:  ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  ARB:  ["upbit", "bithumb", "coinone", "korbit"],
  ATOM: ["upbit", "bithumb", "coinone", "korbit", "gopax"],
  ALGO: ["upbit", "bithumb", "coinone", "korbit"],
  STX:  ["upbit", "bithumb", "coinone", "korbit"],
  OP:   ["upbit", "bithumb", "coinone", "korbit"],
  IMX:  ["upbit", "bithumb", "coinone"],
  SAND: ["upbit", "bithumb", "coinone", "korbit"],

  // A단계 확장분 — 모두 국내 3개 거래소 미만이라 B단계에 오르지 않는다.
  BNB:   ["bithumb", "coinone"],
  TON:   ["bithumb", "coinone"],
  HYPE:  ["bithumb"],
  CRO:   ["bithumb"],
  MNT:   ["bithumb"],
  TAO:   ["bithumb", "coinone"],
  ICP:   ["upbit", "bithumb"],
  KAS:   ["bithumb"],
  FIL:   ["upbit", "bithumb"],
  ONDO:  ["bithumb", "coinone"],
  FET:   ["upbit", "bithumb"],
  LDO:   ["bithumb"],
  THETA: ["upbit", "bithumb"],
  JUP:   ["bithumb"],
  RUNE:  ["bithumb", "coinone"],
  FLOKI: ["bithumb"],
  GALA:  ["upbit", "bithumb"],
};

/** 해외 거래소 상장 현황 스냅샷 (평가방식 5). */
export const GLOBAL_LISTING_SNAPSHOT: Record<string, string[]> = Object.fromEntries(
  MARKET_SNAPSHOT.map((row) => [
    row.symbol,
    // 대상 30종은 모두 글로벌 5대 거래소 다수에 상장되어 있다.
    row.symbol === "IMX" || row.symbol === "SAND" || row.symbol === "STX"
      ? ["binance", "coinbase", "okx", "bybit"]
      : ["binance", "coinbase", "okx", "bybit", "kraken"],
  ]),
);
