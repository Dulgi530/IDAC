/** 원화·수치 표기 유틸. B.2.1 의 "조, 억, 만, 천, 원" 표기 규칙을 구현한다. */

const JO = 1_0000_0000_0000;
const EOK = 1_0000_0000;
const MAN = 1_0000;
const CHEON = 1_000;

const nf = new Intl.NumberFormat("ko-KR");

/**
 * 정수 원화를 조/억/만/천/원 단위로 전개한다.
 * 예) 1_845_230_000_000_000 → "1,845조 2,300억원"
 */
export function formatKrwUnits(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const negative = value < 0;
  let rest = Math.round(Math.abs(value));
  if (rest === 0) return "0원";

  const parts: string[] = [];
  const push = (unitValue: number, label: string) => {
    const q = Math.floor(rest / unitValue);
    if (q > 0) {
      parts.push(`${nf.format(q)}${label}`);
      rest -= q * unitValue;
    }
  };

  push(JO, "조");
  push(EOK, "억");
  push(MAN, "만");
  push(CHEON, "천");
  if (rest > 0) parts.push(`${nf.format(rest)}`);

  return `${negative ? "-" : ""}${parts.join(" ")}원`;
}

/**
 * 시가총액처럼 자릿수가 큰 금액을 상위 2개 단위까지만 남겨 읽기 쉽게 줄인다.
 * 예) 1_845_236_700_000_000 → "1,845조 2,367억원"
 */
export function formatKrwCompact(value: number): string {
  const full = formatKrwUnits(value);
  const tokens = full.replace(/원$/, "").trim().split(" ");
  if (tokens.length <= 2) return full;
  return `${tokens.slice(0, 2).join(" ")}원`;
}

/** 코인 현재가 표기. 1원 미만은 소수점을 살린다. */
export function formatPriceKrw(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value >= 100) return `${nf.format(Math.round(value))}원`;
  if (value >= 1) return `${value.toFixed(2)}원`;
  return `${value.toFixed(4)}원`;
}

/** 퍼센트 표기. 부호를 항상 남긴다. */
export function formatPctSigned(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatPct(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(digits)}%`;
}

/** 코인 수량 표기 (수수료 등). */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0";
  if (value >= 1) return nf.format(Number(value.toFixed(4)));
  return value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}

/** 참가자 수 등 큰 정수의 요약 표기. */
export function formatCount(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "비공개";
  if (value >= 1_0000) return `${(value / 1_0000).toFixed(1)}만명`;
  return `${nf.format(value)}명`;
}

export function formatNumber(value: number): string {
  return nf.format(value);
}

/** "2026-09" → "2026년 9월" */
export function formatPeriod(period: string): string {
  const [y, m] = period.split("-");
  if (!y || !m) return period;
  return `${y}년 ${Number(m)}월`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}

/** 수수료 부담률처럼 0에 가까운 값이 "0.000%" 로 뭉개지지 않게 표기한다. */
export function formatFeeRatio(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0%";
  if (value < 0.001) return "<0.001%";
  return `${value.toFixed(3)}%`;
}
