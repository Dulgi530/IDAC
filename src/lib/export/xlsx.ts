import ExcelJS from "exceljs";
import {
  DOMESTIC_EXCHANGES,
  DOMESTIC_EXCHANGE_LABEL,
  GLOBAL_EXCHANGE_LABEL,
  type Report,
} from "../evaluation/types";
import { formatKrwCompact, formatPeriod } from "../format";

/**
 * 리포트를 엑셀 통합문서로 변환한다 (요구사항 3: 엑셀 다운로드).
 *
 * 시트 구성
 *  1. 종합순위 : 순위·등급·수수료 등 요약 표
 *  2. 코인상세 : 백서 목표·활용 분야·총평 등 서술형 항목
 *  3. 재단정보 : C 항목
 *  4. SNS채널  : E 항목 (채널별 1행)
 *  5. 방법론   : 평가 기준과 데이터 출처
 */
export async function buildWorkbook(report: Report): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IDAC";
  workbook.created = new Date(report.generatedAt);

  buildRankingSheet(workbook, report);
  buildDetailSheet(workbook, report);
  buildFoundationSheet(workbook, report);
  buildSnsSheet(workbook, report);
  buildMethodologySheet(workbook, report);

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

function buildRankingSheet(workbook: ExcelJS.Workbook, report: Report) {
  const sheet = workbook.addWorksheet("종합순위");
  sheet.columns = [
    { header: "순위", key: "rank", width: 6 },
    { header: "심볼", key: "symbol", width: 9 },
    { header: "코인명", key: "nameKo", width: 16 },
    { header: "현재가(원)", key: "priceKrw", width: 15 },
    { header: "시가총액(원)", key: "marketCapText", width: 22 },
    { header: "시총순위", key: "cmcRank", width: 9 },
    { header: "1년 변동률(%)", key: "change1y", width: 14 },
    { header: "연율 변동성(%)", key: "vol", width: 14 },
    { header: "최대낙폭(%)", key: "mdd", width: 12 },
    { header: "변동성등급", key: "volGrade", width: 11 },
    { header: "규모등급", key: "scaleGrade", width: 10 },
    { header: "커뮤니티등급", key: "communityGrade", width: 12 },
    { header: "이체수수료(코인)", key: "feeAmount", width: 16 },
    { header: "이체수수료(원)", key: "feeKrw", width: 15 },
    { header: "수수료부담률(%,100만원기준)", key: "feeRatio", width: 22 },
    { header: "매매수수료(%)", key: "tradingFee", width: 13 },
    { header: "국내상장수", key: "listingCount", width: 11 },
    { header: "국내상장거래소", key: "listings", width: 30 },
    { header: "해외상장거래소", key: "globalListings", width: 30 },
    { header: "활용성점수", key: "usability", width: 11 },
    { header: "지속성점수", key: "sustainability", width: 11 },
    { header: "종합점수", key: "total", width: 10 },
  ];

  for (const entry of report.entries) {
    sheet.addRow({
      rank: entry.rank,
      symbol: entry.symbol,
      nameKo: entry.nameKo,
      priceKrw: Math.round(entry.priceKrw),
      marketCapText: formatKrwCompact(entry.scale.marketCapKrw),
      cmcRank: entry.scale.cmcRank,
      change1y: entry.volatility.changeRate1yPct,
      vol: entry.volatility.annualizedVolatilityPct,
      mdd: entry.volatility.maxDrawdownPct,
      volGrade: entry.volatility.grade,
      scaleGrade: entry.scale.grade,
      communityGrade: entry.community.grade,
      feeAmount: entry.fee.medianAmount,
      feeKrw: Math.round(entry.fee.medianKrw),
      feeRatio: entry.fee.ratioPct,
      tradingFee: entry.fee.tradingFeePct,
      listingCount: entry.domesticListingCount,
      listings: DOMESTIC_EXCHANGES.filter((ex) => entry.listings[ex])
        .map((ex) => DOMESTIC_EXCHANGE_LABEL[ex])
        .join(", "),
      globalListings: entry.globalListings.map((ex) => GLOBAL_EXCHANGE_LABEL[ex]).join(", "),
      usability: entry.scores.usability,
      sustainability: entry.scores.sustainability,
      total: entry.scores.total,
    });
  }

  styleHeader(sheet);
  sheet.getColumn("priceKrw").numFmt = "#,##0";
  sheet.getColumn("feeKrw").numFmt = "#,##0";
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

function buildDetailSheet(workbook: ExcelJS.Workbook, report: Report) {
  const sheet = workbook.addWorksheet("코인상세");
  sheet.columns = [
    { header: "순위", key: "rank", width: 6 },
    { header: "심볼", key: "symbol", width: 9 },
    { header: "코인명", key: "nameKo", width: 16 },
    { header: "기준 네트워크", key: "network", width: 20 },
    { header: "코인 제작 목표", key: "goal", width: 60 },
    { header: "코인 활용 분야", key: "useCases", width: 60 },
    { header: "총평", key: "summary", width: 80 },
  ];

  for (const entry of report.entries) {
    sheet.addRow({
      rank: entry.rank,
      symbol: entry.symbol,
      nameKo: entry.nameKo,
      network: entry.fee.network,
      goal: entry.whitepaper.goal,
      useCases: entry.whitepaper.useCases,
      summary: entry.summary,
    });
  }

  styleHeader(sheet);
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    row.alignment = { wrapText: true, vertical: "top" };
  });
}

function buildFoundationSheet(workbook: ExcelJS.Workbook, report: Report) {
  const sheet = workbook.addWorksheet("재단정보");
  sheet.columns = [
    { header: "순위", key: "rank", width: 6 },
    { header: "심볼", key: "symbol", width: 9 },
    { header: "재단이름", key: "name", width: 40 },
    { header: "재단 홈페이지", key: "homepage", width: 40 },
    { header: "재단 설명", key: "description", width: 80 },
    { header: "Skynet 보안점수", key: "skynet", width: 15 },
  ];

  for (const entry of report.entries) {
    sheet.addRow({
      rank: entry.rank,
      symbol: entry.symbol,
      name: entry.foundation.name,
      homepage: entry.foundation.homepage,
      description: entry.foundation.description,
      skynet: entry.skynetScore ?? "-",
    });
  }

  styleHeader(sheet);
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    row.alignment = { wrapText: true, vertical: "top" };
  });
}

function buildSnsSheet(workbook: ExcelJS.Workbook, report: Report) {
  const sheet = workbook.addWorksheet("SNS채널");
  sheet.columns = [
    { header: "순위", key: "rank", width: 6 },
    { header: "심볼", key: "symbol", width: 9 },
    { header: "플랫폼", key: "platform", width: 12 },
    { header: "URL", key: "url", width: 55 },
    { header: "참가자 수(추정)", key: "members", width: 16 },
    { header: "월간 메시지(추정)", key: "messages", width: 18 },
    { header: "활성도 등급", key: "grade", width: 12 },
  ];

  for (const entry of report.entries) {
    for (const channel of entry.community.channels) {
      sheet.addRow({
        rank: entry.rank,
        symbol: entry.symbol,
        platform: channel.platform,
        url: channel.url,
        members: channel.members ?? "비공개",
        messages: entry.community.monthlyMessages ?? "-",
        grade: entry.community.grade,
      });
    }
  }

  styleHeader(sheet);
  sheet.getColumn("members").numFmt = "#,##0";
}

function buildMethodologySheet(workbook: ExcelJS.Workbook, report: Report) {
  const sheet = workbook.addWorksheet("방법론");
  sheet.columns = [
    { header: "항목", key: "key", width: 24 },
    { header: "내용", key: "value", width: 100 },
  ];

  const rows: [string, string][] = [
    ["리포트 기간", formatPeriod(report.period)],
    ["데이터 기준 시각", report.asOf],
    ["생성 시각", report.generatedAt],
    ["데이터 소스", report.dataSource === "live" ? "실시간 API 집계" : "오프라인 스냅샷(fixture)"],
    ["적용 환율(USD/KRW)", String(report.usdKrw)],
    ["1차 후보군(A단계)", `${report.universe.stageA}종`],
    ["최종 선정(B단계)", `${report.universe.stageB}종`],
    ["활용성 배점", "국내상장 40 + 이체수수료 35 + 백서 활용분야 25"],
    ["수수료 기준", "국내 상장 거래소 출금 수수료 중앙값 × 현재가. 부담률은 100만원 이체 기준"],
    ["지속성 배점", "가격변동성 35 + 시가총액 25 + 재단 20 + 커뮤니티 20"],
    ["종합점수", "활용성 40% + 지속성 60%"],
    ["정렬 기준", "안정성 티어(A→E) → 이체 수수료 낮은 순 → 종합점수 높은 순"],
    ["등급 산정", "선정 30종 내 상대평가 5분위 (상위 20% = A)"],
  ];
  for (const [key, value] of rows) sheet.addRow({ key, value });

  sheet.addRow({});
  sheet.addRow({ key: "데이터 출처", value: "" });
  for (const source of report.sources) sheet.addRow({ key: "", value: source });

  if (report.notices.length > 0) {
    sheet.addRow({});
    sheet.addRow({ key: "유의사항", value: "" });
    for (const notice of report.notices) sheet.addRow({ key: "", value: notice });
  }

  styleHeader(sheet);
  sheet.getColumn("value").alignment = { wrapText: true, vertical: "top" };
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3A5F" } };
  header.alignment = { vertical: "middle", horizontal: "center" };
  header.height = 22;
}
