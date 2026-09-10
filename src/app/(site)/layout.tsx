import Link from "next/link";
import { isAdminHost } from "@/lib/access";

/**
 * 리포트 본문(`/`) 을 제외한 부속 화면 — 평가 방법, 월별 리포트 전문,
 * 관리자 — 에 공통 헤더를 붙인다.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdminHost();

  return (
    <>
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
    </>
  );
}
