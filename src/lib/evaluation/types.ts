/**
 * IDAC 디지털자산 활용성·지속가능성 평가 도메인 모델.
 *
 * 평가 규격은 docs/EVALUATION_SPEC.md 의 [평가항목] 1~2, [평가방식] 3~5,
 * 그리고 산출 단계 A~F 를 그대로 코드로 옮긴 것이다.
 */

/** B.1.2 / B.2.2 / E.2.1 에서 사용하는 5단계 상대평가 등급. */
export type Grade = "A" | "B" | "C" | "D" | "E";

/** 국내 5대 거래소 (요구사항 4.1~4.4 + 고팍스). */
export const DOMESTIC_EXCHANGES = [
  "upbit",
  "bithumb",
  "coinone",
  "korbit",
  "gopax",
] as const;
export type DomesticExchange = (typeof DOMESTIC_EXCHANGES)[number];

export const DOMESTIC_EXCHANGE_LABEL: Record<DomesticExchange, string> = {
  upbit: "업비트",
  bithumb: "빗썸",
  coinone: "코인원",
  korbit: "코빗",
  gopax: "고팍스",
};

/** 해외 거래소 (요구사항 5.1~5.3). */
export const GLOBAL_EXCHANGES = ["binance", "coinbase", "okx", "bybit", "kraken"] as const;
export type GlobalExchange = (typeof GLOBAL_EXCHANGES)[number];

export const GLOBAL_EXCHANGE_LABEL: Record<GlobalExchange, string> = {
  binance: "바이낸스",
  coinbase: "코인베이스",
  okx: "OKX",
  bybit: "바이비트",
  kraken: "크라켄",
};

/** 1.1 국내 거래소 상장 여부 (현금화 가능성). */
export type ListingMap = Record<DomesticExchange, boolean>;

/** 1.2 거래 및 이체 수수료. 온체인 출금 수수료를 현재가로 원화 환산한다. */
export interface FeeInfo {
  /** 수수료를 산정한 기준 네트워크 (예: "Bitcoin", "Ethereum(ERC-20)"). */
  network: string;
  /** 거래소별 온체인 출금 수수료(코인 수량). 미상장/미제공은 null. */
  byExchange: Record<DomesticExchange, number | null>;
  /** 위 값들의 중앙값 — 대표 수수료(코인 수량). */
  medianAmount: number;
  /** 대표 수수료를 현재가로 환산한 원화 금액. (요구사항 1.2 계산 방식) */
  medianKrw: number;
  /** 현재가 대비 수수료 비율(%) — 코인 간 수수료 부담 비교용 지표. */
  ratioPct: number;
  /** 거래소 매매 수수료율(%) 대표값. */
  tradingFeePct: number;
}

/** B.1 가격변동안정성. */
export interface VolatilityInfo {
  /** B.1.1 기준일로부터 1년 전 대비 가격 변동률(%). 음수는 하락. */
  changeRate1yPct: number;
  /** 일간 수익률 표준편차를 연율화한 변동성(%). 등급 산정의 주 지표. */
  annualizedVolatilityPct: number;
  /** 1년 내 고점 대비 최대 낙폭(%). */
  maxDrawdownPct: number;
  /** B.1.2 변동폭이 적은 순서대로 부여한 상대 등급. */
  grade: Grade;
}

/** B.2 코인규모. */
export interface ScaleInfo {
  /** B.2.1 시가총액(원). */
  marketCapKrw: number;
  /** B.2.1 조/억/만/천/원 단위로 표기한 시가총액 문자열. */
  marketCapKrwText: string;
  /** 코인마켓캡 시가총액 순위. */
  cmcRank: number;
  /** 유통 물량. */
  circulatingSupply: number;
  /** 총 발행 한도. 무제한이면 null. */
  totalSupply: number | null;
  /** B.2.2 규모가 큰 순서대로 부여한 상대 등급. */
  grade: Grade;
}

/** C 재단 정보. */
export interface FoundationInfo {
  /** C.1.1 재단이름. */
  name: string;
  /** C.1.2 재단 홈페이지 주소. */
  homepage: string;
  /** C.2.1 재단 설명 (150자 내외). */
  description: string;
}

/** D 백서를 통한 활용 목표 및 활용 분야. */
export interface WhitepaperInfo {
  /** D.1.1 코인 제작 및 활용 목표 (150자 내외). */
  goal: string;
  /** D.2.1 코인 활용 분야 (150자 내외). */
  useCases: string;
}

export type SnsPlatform = "X" | "Telegram" | "Discord" | "Reddit" | "GitHub";

/** E.1 SNS 채널 정보. */
export interface SnsChannel {
  platform: SnsPlatform;
  url: string;
  /** 채널 참가자(팔로워/구독자) 수. 비공개면 null. */
  members: number | null;
}

/** E 커뮤니티 및 SNS 소통채널. */
export interface CommunityInfo {
  channels: SnsChannel[];
  /** E.2.1 전 채널 참가자 수 합계. */
  totalMembers: number;
  /** E.2.1 월간 커뮤니티 메시지/게시물 추정치. */
  monthlyMessages: number | null;
  /** E.2.1 참가자 수와 메시지 수를 종합한 활성도 등급. */
  grade: Grade;
}

/** 최종 리포트의 코인 1건. */
export interface CoinEntry {
  /** 최종 순위 (안정성·규모 종합 → 동점 시 수수료가 낮은 순). */
  rank: number;
  symbol: string;
  /** 영문 명칭. */
  name: string;
  /** 국문 명칭. */
  nameKo: string;
  /** 스테이블코인 여부 (요구사항 A: 스테이블코인은 2.2만 적용). */
  isStablecoin: boolean;

  /** B 현재 가격(원). */
  priceKrw: number;
  /** B 상장된 국내 거래소. */
  listings: ListingMap;
  /** 국내 상장 거래소 수. */
  domesticListingCount: number;
  /** 참고용 해외 상장 거래소. */
  globalListings: GlobalExchange[];

  fee: FeeInfo;
  volatility: VolatilityInfo;
  scale: ScaleInfo;
  foundation: FoundationInfo;
  whitepaper: WhitepaperInfo;
  community: CommunityInfo;

  /** CertiK Skynet 종합 보안 점수(0~100). 미제공은 null. */
  skynetScore: number | null;

  /** 산출 점수. */
  scores: {
    /** 활용성 = 국내상장 + 수수료 + 활용분야. */
    usability: number;
    /** 지속성 = 변동성 + 규모 + 재단 + 커뮤니티. */
    sustainability: number;
    /** 안정성 종합 점수 — 최종 정렬의 1순위 키. */
    stability: number;
    /** 종합 점수 (정렬 기준). */
    total: number;
  };

  /** F 총평 (200자). */
  summary: string;
}

/** 데이터 출처 구분. */
export type DataSourceMode = "live" | "fixture";

/** 월간 리포트 1건. */
export interface Report {
  /** 리포트 기간 식별자. 예: "2026-09". */
  period: string;
  title: string;
  /** 데이터 기준 시각 (ISO). */
  asOf: string;
  /** 리포트 생성 시각 (ISO). */
  generatedAt: string;
  /** live = 실 API 집계, fixture = 저장된 스냅샷. */
  dataSource: DataSourceMode;
  /** 원화 환산에 사용한 USD/KRW 환율. */
  usdKrw: number;
  /** 단계별 후보군 규모 (A: 60종 → B: 30종). */
  universe: { stageA: number; stageB: number };
  entries: CoinEntry[];
  /** 산출 근거로 사용한 데이터 출처 목록. */
  sources: string[];
  /** 데이터 신뢰도에 대한 경고 (fixture 모드 등). */
  notices: string[];
}

/** 리포트 목록 화면용 요약. */
export interface ReportSummary {
  period: string;
  title: string;
  asOf: string;
  generatedAt: string;
  dataSource: DataSourceMode;
  coinCount: number;
}
