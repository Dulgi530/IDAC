import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "exceljs"],
  // PDF 내보내기에서 런타임에 한글 폰트 파일을 읽으므로 서버 번들에 포함시킨다.
  outputFileTracingIncludes: {
    "/api/reports/**": ["./assets/fonts/**"],
  },
};

export default nextConfig;
