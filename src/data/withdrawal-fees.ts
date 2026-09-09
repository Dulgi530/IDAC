import type { DomesticExchange } from "../lib/evaluation/types";

/**
 * 국내 5대 거래소 온체인 출금(이체) 수수료 수동 관리 테이블 — **폴백 전용**.
 *
 * ────────────────────────────────────────────────────────────────────────
 *  주의: 이 파일의 값은 "검증이 필요한 참고 기준값"이다.
 *  업비트·빗썸은 출금 수수료를 무인증 공개 API 로 제공하지 않으므로,
 *  운영 환경에서는 다음 순서로 실제 값을 확보해야 한다.
 *
 *   1) 코인원·코빗·고팍스 : 공개 API 실시간 조회 (providers/domestic.ts)
 *   2) 업비트·빗썸        : Open API 키를 발급받아 /v1/withdraws/chance 조회
 *   3) 위 두 경로가 모두 막힌 경우에만 이 테이블을 사용
 *
 *  거래소는 네트워크 혼잡도에 따라 수수료를 수시로 조정한다.
 *  `npm run fees:refresh` 로 공개 API 값을 내려받아 이 파일을 갱신할 것.
 * ────────────────────────────────────────────────────────────────────────
 */

/** 이 테이블을 마지막으로 대조한 시점. 리포트에 그대로 표기된다. */
export const FEE_TABLE_UPDATED_AT = "2026-09-01";

type FeeRow = Partial<Record<DomesticExchange, number>>;

export const MANUAL_WITHDRAWAL_FEES: Record<string, FeeRow> = {
  BTC: { upbit: 0.0009, bithumb: 0.0009, coinone: 0.0009, korbit: 0.001, gopax: 0.001 },
  ETH: { upbit: 0.01, bithumb: 0.01, coinone: 0.02, korbit: 0.01, gopax: 0.01 },
  USDT: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  USDC: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  XRP: { upbit: 0.4, bithumb: 0.4, coinone: 0.4, korbit: 0.4, gopax: 0.4 },
  SOL: { upbit: 0.01, bithumb: 0.01, coinone: 0.01, korbit: 0.01, gopax: 0.01 },
  ADA: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  DOGE: { upbit: 5, bithumb: 5, coinone: 5, korbit: 5, gopax: 5 },
  TRX: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  LINK: { upbit: 0.55, bithumb: 0.6, coinone: 0.5, korbit: 0.5, gopax: 0.5 },
  AVAX: { upbit: 0.01, bithumb: 0.01, coinone: 0.01, korbit: 0.01, gopax: 0.01 },
  DOT: { upbit: 0.1, bithumb: 0.1, coinone: 0.1, korbit: 0.1, gopax: 0.1 },
  POL: { upbit: 0.5, bithumb: 0.5, coinone: 0.5, korbit: 0.5, gopax: 0.5 },
  LTC: { upbit: 0.01, bithumb: 0.01, coinone: 0.01, korbit: 0.001, gopax: 0.001 },
  BCH: { upbit: 0.001, bithumb: 0.001, coinone: 0.001, korbit: 0.001, gopax: 0.001 },
  ATOM: { upbit: 0.01, bithumb: 0.01, coinone: 0.01, korbit: 0.01, gopax: 0.01 },
  XLM: { upbit: 0.01, bithumb: 0.01, coinone: 0.01, korbit: 0.01, gopax: 0.01 },
  ETC: { upbit: 0.01, bithumb: 0.01, coinone: 0.01, korbit: 0.01, gopax: 0.01 },
  HBAR: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  ALGO: { upbit: 0.1, bithumb: 0.1, coinone: 0.1, korbit: 0.1, gopax: 0.1 },
  NEAR: { upbit: 0.05, bithumb: 0.05, coinone: 0.05, korbit: 0.05, gopax: 0.05 },
  APT: { upbit: 0.05, bithumb: 0.05, coinone: 0.05, korbit: 0.05, gopax: 0.05 },
  SUI: { upbit: 0.1, bithumb: 0.1, coinone: 0.1, korbit: 0.1, gopax: 0.1 },
  ARB: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  OP: { upbit: 0.4, bithumb: 0.4, coinone: 0.4, korbit: 0.4, gopax: 0.4 },
  UNI: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  AAVE: { upbit: 0.06, bithumb: 0.06, coinone: 0.06, korbit: 0.06, gopax: 0.06 },
  SAND: { upbit: 5, bithumb: 5, coinone: 5, korbit: 5, gopax: 5 },
  MANA: { upbit: 5, bithumb: 5, coinone: 5, korbit: 5, gopax: 5 },
  IMX: { upbit: 3, bithumb: 3, coinone: 3, korbit: 3, gopax: 3 },
  STX: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  INJ: { upbit: 0.02, bithumb: 0.02, coinone: 0.02, korbit: 0.02, gopax: 0.02 },
  TIA: { upbit: 0.05, bithumb: 0.05, coinone: 0.05, korbit: 0.05, gopax: 0.05 },
  SEI: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  RENDER: { upbit: 1, bithumb: 1, coinone: 1, korbit: 1, gopax: 1 },
  GRT: { upbit: 20, bithumb: 20, coinone: 20, korbit: 20, gopax: 20 },
  VET: { upbit: 30, bithumb: 30, coinone: 30, korbit: 30, gopax: 30 },
  SHIB: { upbit: 100000, bithumb: 100000, coinone: 100000, korbit: 100000, gopax: 100000 },
  EOS: { upbit: 0.1, bithumb: 0.1, coinone: 0.1, korbit: 0.1, gopax: 0.1 },
  BONK: { upbit: 100000, bithumb: 100000, coinone: 100000, korbit: 100000, gopax: 100000 },
};

/** 거래소 매매(테이커) 수수료율(%) — 원화 마켓 기준 공시 요율. */
export const TRADING_FEE_PCT: Record<DomesticExchange, number> = {
  upbit: 0.05,
  bithumb: 0.04,
  coinone: 0.2,
  korbit: 0.2,
  gopax: 0.2,
};
