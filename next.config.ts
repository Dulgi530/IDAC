import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "exceljs"],
  /*
   * 런타임에 파일 시스템에서 읽는 자원들은 경로가 동적이라 Next 의 자동 추적에
   * 걸리지 않는다. 서버리스 번들에 명시적으로 포함시켜야 배포본에서도 읽힌다.
   *  - assets/fonts : PDF 내보내기의 한글 폰트
   *  - data/reports : 발행된 리포트 JSON
   */
  outputFileTracingIncludes: {
    "/": ["./data/reports/**"],
    "/admin": ["./data/reports/**"],
    "/reports/[period]": ["./data/reports/**"],
    "/api/reports": ["./data/reports/**"],
    "/api/reports/[period]": ["./data/reports/**"],
    "/api/reports/[period]/export/xlsx": ["./data/reports/**"],
    "/api/reports/[period]/export/pdf": ["./data/reports/**", "./assets/fonts/**"],
  },
};

export default nextConfig;
