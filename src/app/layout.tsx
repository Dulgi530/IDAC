import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { isAdminHost } from "@/lib/access";

export const metadata: Metadata = {
  title: "IDAC · 디지털자산 활용성·지속가능성 평가",
  description:
    "국내 5대 거래소 상장 디지털자산을 활용성과 지속가능성 기준으로 매월 평가해 순위를 제공하는 리포트 플랫폼",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdminHost();

  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand">
              IDAC
            </Link>
            <span className="tagline">디지털자산 활용성·지속가능성 평가 리포트</span>
            <nav>
              <Link href="/">리포트</Link>
              <Link href="/methodology">평가 방법</Link>
              {admin ? <Link href="/admin">관리자</Link> : null}
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
