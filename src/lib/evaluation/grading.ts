import type { CoinEntry, Grade } from "./types";

export const GRADES: Grade[] = ["A", "B", "C", "D", "E"];

/** 등급을 점수(100점 만점)로 환산한다. */
export const GRADE_SCORE: Record<Grade, number> = {
  A: 100,
  B: 85,
  C: 70,
  D: 55,
  E: 40,
};

/**
 * 값의 상대 순위를 5분위로 나누어 A~E 등급을 부여한다.
 * `higherIsBetter = false` 이면 값이 작을수록 A 등급이다.
 *
 * 등급은 절대 기준이 아니라 "선정된 코인 집합 내 상대평가"이므로,
 * 매월 대상 코인이 바뀌면 같은 코인의 등급도 달라질 수 있다.
 */
export function gradeByRank(values: number[], higherIsBetter: boolean): Grade[] {
  const n = values.length;
  if (n === 0) return [];

  const order = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));

  const result = new Array<Grade>(n);
  order.forEach((item, position) => {
    // 0-based 위치를 5분위로 매핑한다. 상위 20% = A.
    const quintile = Math.min(4, Math.floor((position * 5) / n));
    result[item.index] = GRADES[quintile];
  });
  return result;
}

/** 단일 값을 구간 경계값으로 등급화한다 (절대 기준 등급용). */
export function gradeByThreshold(
  value: number,
  thresholds: [number, number, number, number],
  higherIsBetter: boolean,
): Grade {
  const [t1, t2, t3, t4] = thresholds;
  if (higherIsBetter) {
    if (value >= t1) return "A";
    if (value >= t2) return "B";
    if (value >= t3) return "C";
    if (value >= t4) return "D";
    return "E";
  }
  if (value <= t1) return "A";
  if (value <= t2) return "B";
  if (value <= t3) return "C";
  if (value <= t4) return "D";
  return "E";
}

/** 활용성(Usability) 점수. 1.1 국내상장 + 1.2 수수료 + 1.3 활용분야. */
export function usabilityScore(input: {
  domesticListingCount: number;
  feeRatioPct: number;
  useCaseScore: number; // 0~100, 백서 기반 활용 분야 성숙도
}): number {
  // 1.1 국내 5대 거래소 상장 수 (40점)
  const listing = (Math.min(input.domesticListingCount, 5) / 5) * 40;

  // 1.2 이체 수수료 부담률 (35점). 100만원 이체 기준 0.05% 이하면 만점,
  //     5% 이상이면 0점으로 선형 감점한다.
  const feePenalty = Math.max(0, Math.min(1, (input.feeRatioPct - 0.05) / (5 - 0.05)));
  const fee = (1 - feePenalty) * 35;

  // 1.3 백서상 활용 목표·분야 (25점)
  const useCase = (input.useCaseScore / 100) * 25;

  return round2(listing + fee + useCase);
}

/** 지속성(Sustainability) 점수. 2.1 변동성 + 2.2 규모 + 2.3 재단 + 2.4 커뮤니티. */
export function sustainabilityScore(input: {
  volatilityGrade: Grade;
  scaleGrade: Grade;
  communityGrade: Grade;
  foundationScore: number; // 0~100, 재단 정보 명확성·운영 지속성
}): number {
  const volatility = (GRADE_SCORE[input.volatilityGrade] / 100) * 35;
  const scale = (GRADE_SCORE[input.scaleGrade] / 100) * 25;
  const foundation = (input.foundationScore / 100) * 20;
  const community = (GRADE_SCORE[input.communityGrade] / 100) * 20;
  return round2(volatility + scale + foundation + community);
}

/**
 * 최종 정렬용 "안정성 종합 점수".
 * 요구사항: 안정성(2.1 가격변동성)과 변동성을 모두 고려해 순위를 매기고,
 * 동일 등급대 안에서는 수수료가 낮은 순으로 정렬한다.
 */
export function stabilityScore(input: {
  volatilityGrade: Grade;
  scaleGrade: Grade;
  communityGrade: Grade;
  foundationScore: number;
}): number {
  return round2(
    (GRADE_SCORE[input.volatilityGrade] / 100) * 50 +
      (GRADE_SCORE[input.scaleGrade] / 100) * 30 +
      (input.foundationScore / 100) * 10 +
      (GRADE_SCORE[input.communityGrade] / 100) * 10,
  );
}

/** 안정성 종합 점수를 등급대(티어)로 묶는다. 티어가 같으면 수수료로 우열을 가린다. */
export function stabilityTier(score: number): Grade {
  return gradeByThreshold(score, [90, 80, 70, 60], true);
}

/**
 * 최종 순위 정렬.
 * 1순위: 안정성 티어(A→E)  2순위: 이체 수수료 부담률(낮은 순)  3순위: 종합 점수(높은 순)
 */
export function sortEntries(entries: CoinEntry[]): CoinEntry[] {
  return [...entries].sort((a, b) => {
    const tierA = GRADES.indexOf(stabilityTier(a.scores.stability));
    const tierB = GRADES.indexOf(stabilityTier(b.scores.stability));
    if (tierA !== tierB) return tierA - tierB;
    if (a.fee.ratioPct !== b.fee.ratioPct) return a.fee.ratioPct - b.fee.ratioPct;
    return b.scores.total - a.scores.total;
  });
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
