import { fetchJson, ProviderError } from "./http";

/**
 * 쟁글 Xangle (평가방식 3.2).
 *
 * 국내 디지털자산 공시 플랫폼으로, 프로젝트가 재단 활동·토큰 분배·거버넌스를
 * 정기적으로 공시하는지를 확인할 수 있다. 이 정보는 2.3 "재단이 지속적으로
 * 활용하고 있을 것" 판정의 직접적인 근거가 된다.
 *
 * 공개 무인증 API 가 없으므로 파트너 키가 있을 때만 동작하며, 키가 없으면
 * 해당 항목을 리포트에서 제외하고 그 사실을 유의사항으로 남긴다.
 */

export interface XangleProfile {
  symbol: string;
  /** 쟁글 프로젝트 상세 페이지. */
  profileUrl: string | null;
  /** 누적 공시 건수. 재단 활동의 양적 지표. */
  disclosureCount: number | null;
  /** 최근 공시 일자 (ISO). 재단 활동의 최신성 지표. */
  lastDisclosureAt: string | null;
  /** 쟁글이 부여한 프로젝트 평가 점수(0~100). 미제공은 null. */
  score: number | null;
}

export function isXangleConfigured(): boolean {
  return Boolean(process.env.XANGLE_API_KEY);
}

/**
 * 최근 공시일로부터 경과한 개월 수로 재단 활동 지속성을 가늠한다.
 * 6개월 이상 공시가 없으면 "지속적 활동" 근거가 약하다고 본다.
 */
export function monthsSinceLastDisclosure(profile: XangleProfile, now = new Date()): number | null {
  if (!profile.lastDisclosureAt) return null;
  const last = new Date(profile.lastDisclosureAt);
  if (Number.isNaN(last.getTime())) return null;
  return (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

export async function fetchXangleProfiles(symbols: string[]): Promise<Map<string, XangleProfile>> {
  const key = process.env.XANGLE_API_KEY;
  if (!key) {
    throw new ProviderError("xangle", "XANGLE_API_KEY 가 설정되어 있지 않습니다.");
  }
  const base = process.env.XANGLE_BASE_URL || "https://api.xangle.io";

  const result = new Map<string, XangleProfile>();
  // 심볼 단건 조회만 지원하므로 동시 요청 수를 4개로 제한한다.
  for (const group of chunk(symbols, 4)) {
    const settled = await Promise.allSettled(
      group.map((symbol) =>
        fetchJson<{
          url?: string;
          disclosureCount?: number;
          lastDisclosedAt?: string;
          score?: number;
        }>(`${base}/v1/projects/${encodeURIComponent(symbol.toLowerCase())}`, {
          provider: "xangle",
          headers: { authorization: `Bearer ${key}` },
        }).then((data) => ({ symbol, data })),
      ),
    );

    for (const item of settled) {
      // 쟁글 미등록 프로젝트(404)는 정상적인 결과이므로 조용히 건너뛴다.
      if (item.status !== "fulfilled") continue;
      const { symbol, data } = item.value;
      result.set(symbol, {
        symbol,
        profileUrl: data.url ?? null,
        disclosureCount: data.disclosureCount ?? null,
        lastDisclosureAt: data.lastDisclosedAt ?? null,
        score: data.score ?? null,
      });
    }
  }
  return result;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
