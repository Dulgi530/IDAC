import { NextResponse } from "next/server";
import { fetchTopListings, fetchUsdKrw } from "@/lib/providers/coinmarketcap";
import { fetchSkynetScores, isSkynetConfigured } from "@/lib/providers/skynet";

export const dynamic = "force-dynamic";

/**
 * GET /api/market/aggregate?limit=100 — 코인마켓캡 + CertiK Skynet 집계 API.
 *
 * 시세·시가총액(코인마켓캡)과 보안 점수(Skynet)를 심볼 기준으로 합쳐 돌려준다.
 * Skynet 키가 없으면 시세만 반환하고 `skynetAvailable: false` 로 알린다.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = clamp(Number(url.searchParams.get("limit") ?? 100), 1, 500);

  try {
    const [listings, usdKrw] = await Promise.all([fetchTopListings(limit), fetchUsdKrw()]);

    const skynetAvailable = isSkynetConfigured();
    const skynet = skynetAvailable
      ? await fetchSkynetScores(listings.map((l) => l.symbol)).catch(() => new Map())
      : new Map();

    return NextResponse.json({
      asOf: new Date().toISOString(),
      usdKrw,
      skynetAvailable,
      count: listings.length,
      assets: listings.map((listing) => ({
        ...listing,
        skynet: skynet.get(listing.symbol) ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: `집계에 실패했습니다: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
