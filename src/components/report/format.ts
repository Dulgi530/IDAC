/** 리포트 화면 전용 표기 유틸. 서버·클라이언트 양쪽에서 같은 결과를 내야 한다. */

const nf = new Intl.NumberFormat("ko-KR");

/** 소수 자릿수를 고정한 천단위 표기. 값이 없으면 em dash. */
export function num(value: number | null | undefined, digits = 0): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

/** 코인 현재가(원). 1원 미만은 소수점을 살린다. */
export function krw(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value >= 1 ? `₩${num(value, 0)}` : `₩${value.toFixed(4)}`;
}

/** 팔로워 수처럼 자릿수가 큰 정수의 요약 표기. */
export function compactCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

/** 시가총액 합계처럼 큰 원화 금액을 조/억 단위로 줄인다. */
export function compactKrw(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1e12) return `${nf.format(Math.round(value / 1e12))}조원`;
  return `${nf.format(Math.round(value / 1e8))}억원`;
}

/** 퍼센트. 값이 없으면 em dash. */
export function pct(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

/** 부호를 항상 남기는 퍼센트. */
export function pctSigned(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

/** "2026-09" → "2026년 9월" */
export function periodLabel(period: string): string {
  const [year, month] = period.split("-");
  if (!year || !month) return period;
  return `${year}년 ${Number(month)}월`;
}

/** ISO 문자열을 한국어 날짜·시각으로. 서버·클라이언트 시간대 차를 없애려 UTC 로 고정한다. */
export function dateTimeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}. ${p(d.getUTCMonth() + 1)}. ${p(d.getUTCDate())}. ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())} UTC`;
}

/** 현재 월 ("YYYY-MM"). */
export function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** URL 에서 스킴과 끝 슬래시를 떼어 짧게 보여준다. */
export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
