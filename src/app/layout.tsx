import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDAC X DELV 디지털자산 평가",
  description:
    "국내 5대 거래소 상장 디지털자산을 활용성과 지속가능성 기준으로 매월 평가해 순위를 제공하는 리포트 플랫폼",
};

/**
 * 최상위 레이아웃은 껍데기만 담당한다.
 * 사이트 헤더가 붙는 부속 화면들은 `(site)` 라우트 그룹의 레이아웃에서 감싸고,
 * 리포트 단일 페이지(`/`)는 헤더 없이 전체 화면을 그대로 쓴다.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
