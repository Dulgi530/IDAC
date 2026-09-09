import { fetchJson, ProviderError } from "./http";

/**
 * CertiK Skynet (평가방식 3.2).
 * 프로젝트 보안·거버넌스 점수를 가져와 2.3 재단 안정성 평가를 보조한다.
 *
 * Skynet 은 공개 무인증 REST API 를 제공하지 않으므로, 파트너 API 키가 있을 때만
 * 동작한다. 키가 없으면 null 을 돌려주고 평가에서는 해당 항목을 제외한다.
 */

export interface SkynetScore {
  symbol: string;
  /** 0~100 종합 보안 점수. */
  securityScore: number;
  /** 코드 보안 세부 점수. */
  codeSecurity: number | null;
  /** 거버넌스 및 커뮤니티 세부 점수. */
  governance: number | null;
  projectUrl: string | null;
}

export function isSkynetConfigured(): boolean {
  return Boolean(process.env.SKYNET_API_KEY);
}

export async function fetchSkynetScores(symbols: string[]): Promise<Map<string, SkynetScore>> {
  const key = process.env.SKYNET_API_KEY;
  if (!key) {
    throw new ProviderError("skynet", "SKYNET_API_KEY 가 설정되어 있지 않습니다.");
  }
  const base = process.env.SKYNET_BASE_URL || "https://api.skynet.certik.com";

  const result = new Map<string, SkynetScore>();
  // Skynet 은 심볼 단건 조회만 지원하므로 동시 요청 수를 4개로 제한해 순차 처리한다.
  const chunks = chunk(symbols, 4);
  for (const group of chunks) {
    const settled = await Promise.allSettled(
      group.map((symbol) =>
        fetchJson<{
          securityScore: number;
          codeSecurityScore?: number;
          governanceScore?: number;
          url?: string;
        }>(`${base}/v1/projects/${encodeURIComponent(symbol.toLowerCase())}/score`, {
          provider: "skynet",
          headers: { authorization: `Bearer ${key}` },
        }).then((data) => ({ symbol, data })),
      ),
    );

    for (const item of settled) {
      // 미등록 프로젝트(404)는 정상적인 결과이므로 조용히 건너뛴다.
      if (item.status !== "fulfilled") continue;
      const { symbol, data } = item.value;
      result.set(symbol, {
        symbol,
        securityScore: data.securityScore,
        codeSecurity: data.codeSecurityScore ?? null,
        governance: data.governanceScore ?? null,
        projectUrl: data.url ?? null,
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
