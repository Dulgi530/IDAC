import { NextResponse } from "next/server";
import { fetchTopListings, fetchUsdKrw } from "@/lib/providers/coinmarketcap";
import { fetchSkynetScores, isSkynetConfigured } from "@/lib/providers/skynet";
import { fetchXangleProfiles, isXangleConfigured } from "@/lib/providers/xangle";

export const dynamic = "force-dynamic";

/**
 * GET /api/market/aggregate?limit=100 — 코인마켓캡 + 쟁글 + CertiK Skynet 집계 API.
 *
 * 시세·시가총액(코인마켓캡), 재단 공시 현황(쟁글), 보안 점수(Skynet)를 심볼
 * 기준으로 합쳐 돌려준다. 각 키가 없으면 해당 항목만 빠지고, 응답의
 * `*Available` 플래그로 호출자가 그 사실을 알 수 있다.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = clamp(Number(url.searchParams.get("limit") ?? 100), 1, 500);

  try {
    const [listings, usdKrw] = await Promise.all([fetchTopListings(limit), fetchUsdKrw()]);

    const symbols = listings.map((l) => l.symbol);

    const skynetAvailable = isSkynetConfigured();
    const xangleAvailable = isXangleConfigured();

    const [skynet, xangle] = await Promise.all([
      skynetAvailable ? fetchSkynetScores(symbols).catch(() => new Map()) : new Map(),
      xangleAvailable ? fetchXangleProfiles(symbols).catch(() => new Map()) : new Map(),
    ]);

    return NextResponse.json({
      asOf: new Date().toISOString(),
      usdKrw,
      skynetAvailable,
      xangleAvailable,
      count: listings.length,
      assets: listings.map((listing) => ({
        ...listing,
        skynet: skynet.get(listing.symbol) ?? null,
        xangle: xangle.get(listing.symbol) ?? null,
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
