import type { CoinEntry, Grade } from "./types";
import { DOMESTIC_EXCHANGE_LABEL, DOMESTIC_EXCHANGES } from "./types";
import { formatFeeRatio, formatKrwCompact, formatPctSigned } from "../format";

/** F 총평 생성. 활용성과 지속성 두 축을 200자 내외의 보고서 문체로 서술한다. */

const VOLATILITY_CLAUSE: Record<Grade, string> = {
  A: "가격 변동성이 평가 대상 중 가장 낮아 보유 부담이 작다",
  B: "가격 변동성이 평균을 밑돌아 비교적 안정적이다",
  C: "가격 변동성이 시장 평균 수준이다",
  D: "가격 변동성이 평균을 웃돌아 단기 손실 위험이 있다",
  E: "가격 변동성이 매우 커 보수적 접근이 필요하다",
};

const SCALE_CLAUSE: Record<Grade, string> = {
  A: "시가총액 규모가 최상위권으로 유동성이 풍부하다",
  B: "시가총액 규모가 상위권에 속해 유동성이 양호하다",
  C: "시가총액 규모가 중위권으로 유동성은 보통이다",
  D: "시가총액 규모가 하위권이어서 유동성 관리가 필요하다",
  E: "시가총액 규모가 작아 급격한 가격 충격에 노출될 수 있다",
};

const COMMUNITY_CLAUSE: Record<Grade, string> = {
  A: "공식 SNS와 커뮤니티가 매우 활발해 정보 접근성이 높다",
  B: "공식 SNS 채널이 안정적으로 운영되고 있다",
  C: "SNS 채널은 갖추어져 있으나 활동량은 보통이다",
  D: "SNS 활동량이 제한적이어서 공시 확인에 주의가 필요하다",
  E: "커뮤니티 활동이 저조해 정보 비대칭 위험이 있다",
};

export function buildSummary(entry: CoinEntry): string {
  const listed = DOMESTIC_EXCHANGES.filter((ex) => entry.listings[ex]).map(
    (ex) => DOMESTIC_EXCHANGE_LABEL[ex],
  );

  const usability =
    `국내 ${listed.length}개 거래소(${listed.slice(0, 3).join("·")}${listed.length > 3 ? " 등" : ""})에 상장되어 원화 현금화가 가능하며, ` +
    `100만원 이체 시 수수료는 ${Math.round(entry.fee.medianKrw).toLocaleString("ko-KR")}원(${formatFeeRatio(entry.fee.ratioPct)}) 수준이다.`;

  const sustainability =
    `지속성 측면에서는 최근 1년 변동률 ${formatPctSigned(entry.volatility.changeRate1yPct)}로 ` +
    `${VOLATILITY_CLAUSE[entry.volatility.grade]}. ` +
    `시가총액 ${formatKrwCompact(entry.scale.marketCapKrw)}으로 ${SCALE_CLAUSE[entry.scale.grade]}. ` +
    `${entry.foundation.name}이 운영 주체로 확인되고 ${COMMUNITY_CLAUSE[entry.community.grade]}.`;

  const verdict = buildVerdict(entry);

  return trimTo(`${usability} ${sustainability} ${verdict}`, 200);
}

function buildVerdict(entry: CoinEntry): string {
  const total = entry.scores.total;
  if (entry.isStablecoin) {
    return "가치 연동형 자산으로 결제·정산 수단에 적합하나 준비금 신뢰도 점검이 전제된다.";
  }
  if (total >= 85) return "일반 이용자가 장기 보유하기에 적합한 상위 등급으로 평가된다.";
  if (total >= 75) return "실용적 활용과 중기 보유가 모두 가능한 안정 등급으로 판단된다.";
  if (total >= 65) return "분산 투자 관점에서 제한적 비중으로 접근할 것을 권고한다.";
  return "활용 목적이 뚜렷한 경우에 한해 소액으로 접근할 것을 권고한다.";
}

/** 목표 글자 수에 맞춰 문장 단위로 자른다. 200자 규격을 지키기 위한 처리. */
function trimTo(text: string, limit: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit + 20) return normalized;

  const sentences = normalized.split(/(?<=\.)\s+/);
  let out = "";
  for (const sentence of sentences) {
    if (out.length + sentence.length > limit + 20) break;
    out += (out ? " " : "") + sentence;
  }
  return out || normalized.slice(0, limit);
}
