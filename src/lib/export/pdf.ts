import path from "node:path";
import { existsSync } from "node:fs";
import PDFDocument from "pdfkit";
import {
  DOMESTIC_EXCHANGES,
  DOMESTIC_EXCHANGE_LABEL,
  type CoinEntry,
  type Report,
} from "../evaluation/types";
import {
  formatAmount,
  formatCount,
  formatFeeRatio,
  formatKrwCompact,
  formatPct,
  formatPctSigned,
  formatPeriod,
  formatPriceKrw,
} from "../format";

/**
 * 리포트를 PDF 로 변환한다 (요구사항 3: PDF 다운로드).
 *
 * pdfkit 은 한글 글리프를 내장하지 않으므로 Pretendard 를 직접 임베드한다.
 * `npm run fetch:fonts` 로 assets/fonts 에 폰트를 준비해 두어야 한다.
 */

const FONT_DIR = path.resolve("assets/fonts");
const REGULAR = path.join(FONT_DIR, "Pretendard-Regular.otf");
const BOLD = path.join(FONT_DIR, "Pretendard-Bold.otf");

const PAGE = { size: "A4" as const, layout: "landscape" as const, margin: 32 };
const INK = "#1a2233";
const MUTED = "#5b6577";
const LINE = "#d7dce5";
const HEAD_BG = "#1f3a5f";

export class MissingFontError extends Error {
  constructor() {
    super(
      "PDF 생성에 필요한 한글 폰트가 없습니다. `npm run fetch:fonts` 를 실행해 assets/fonts 에 Pretendard 를 준비하세요.",
    );
    this.name = "MissingFontError";
  }
}

export async function buildPdf(report: Report): Promise<Buffer> {
  if (!existsSync(REGULAR) || !existsSync(BOLD)) throw new MissingFontError();

  const doc = new PDFDocument({ ...PAGE, bufferPages: true, autoFirstPage: false });
  doc.registerFont("body", REGULAR);
  doc.registerFont("bold", BOLD);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  drawCover(doc, report);
  drawRankingTable(doc, report);
  for (const entry of report.entries) drawEntryDetail(doc, entry);
  drawMethodology(doc, report);
  drawPageNumbers(doc);

  doc.end();
  return done;
}

type Doc = InstanceType<typeof PDFDocument>;

function drawCover(doc: Doc, report: Report) {
  doc.addPage();
  const { width } = doc.page;

  doc.rect(0, 0, width, 150).fill(HEAD_BG);
  doc.fillColor("#ffffff").font("bold").fontSize(28).text("IDAC", 48, 44);
  doc.font("body").fontSize(12).text("디지털자산 활용성·지속가능성 평가 리포트", 48, 84);
  doc.fontSize(18).font("bold").text(formatPeriod(report.period), 48, 106);

  doc.fillColor(INK).font("body").fontSize(10);
  let y = 190;
  const rows: [string, string][] = [
    ["평가 대상", `${report.entries.length}종 (1차 후보 ${report.universe.stageA}종 → 최종 ${report.universe.stageB}종)`],
    ["데이터 기준", new Date(report.asOf).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })],
    ["생성 시각", new Date(report.generatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })],
    ["데이터 소스", report.dataSource === "live" ? "실시간 API 집계" : "오프라인 스냅샷(fixture)"],
    ["적용 환율", `1 USD = ${report.usdKrw.toLocaleString("ko-KR")}원`],
    ["정렬 기준", "안정성 티어 → 이체 수수료 낮은 순 → 종합점수"],
  ];
  for (const [key, value] of rows) {
    doc.font("bold").text(key, 48, y, { width: 120 });
    doc.font("body").text(value, 176, y, { width: 560 });
    y += 22;
  }

  if (report.notices.length > 0) {
    y += 12;
    doc.font("bold").fillColor("#a3401f").text("유의사항", 48, y);
    y += 18;
    doc.font("body").fillColor(MUTED).fontSize(9);
    for (const notice of report.notices) {
      doc.text(`· ${notice}`, 48, y, { width: width - 96 });
      y = doc.y + 6;
    }
  }
}

/** 열 정의: 제목, 너비, 값 추출기, 정렬. */
interface Column {
  title: string;
  width: number;
  value: (entry: CoinEntry) => string;
  align?: "left" | "right" | "center";
}

const RANKING_COLUMNS: Column[] = [
  { title: "순위", width: 30, value: (e) => String(e.rank), align: "center" },
  { title: "심볼", width: 42, value: (e) => e.symbol },
  { title: "코인명", width: 80, value: (e) => e.nameKo },
  { title: "현재가", width: 78, value: (e) => formatPriceKrw(e.priceKrw), align: "right" },
  { title: "시가총액", width: 108, value: (e) => formatKrwCompact(e.scale.marketCapKrw), align: "right" },
  { title: "1년변동", width: 56, value: (e) => formatPctSigned(e.volatility.changeRate1yPct), align: "right" },
  { title: "변동성", width: 50, value: (e) => formatPct(e.volatility.annualizedVolatilityPct), align: "right" },
  { title: "변동\n등급", width: 34, value: (e) => e.volatility.grade, align: "center" },
  { title: "규모\n등급", width: 34, value: (e) => e.scale.grade, align: "center" },
  { title: "SNS\n등급", width: 34, value: (e) => e.community.grade, align: "center" },
  { title: "이체수수료", width: 74, value: (e) => `${formatAmount(e.fee.medianAmount)} ${e.symbol}`, align: "right" },
  { title: "수수료(원)", width: 68, value: (e) => formatPriceKrw(e.fee.medianKrw), align: "right" },
  { title: "부담률\n(100만원)", width: 52, value: (e) => formatFeeRatio(e.fee.ratioPct), align: "right" },
  {
    title: "국내 상장 거래소",
    width: 116,
    value: (e) =>
      DOMESTIC_EXCHANGES.filter((ex) => e.listings[ex])
        .map((ex) => DOMESTIC_EXCHANGE_LABEL[ex])
        .join("·"),
  },
  { title: "활용성", width: 44, value: (e) => e.scores.usability.toFixed(1), align: "right" },
  { title: "지속성", width: 44, value: (e) => e.scores.sustainability.toFixed(1), align: "right" },
  { title: "종합", width: 44, value: (e) => e.scores.total.toFixed(1), align: "right" },
];

function drawRankingTable(doc: Doc, report: Report) {
  doc.addPage();
  doc.fillColor(INK).font("bold").fontSize(14).text("1. 종합 순위표", 32, 32);
  doc.font("body").fontSize(8).fillColor(MUTED).text(
    "안정성(가격변동성·규모·재단·커뮤니티)을 종합한 티어 순으로 정렬하고, 동일 티어 내에서는 이체 수수료가 낮은 코인을 앞에 두었다. 부담률은 100만원 이체 기준이다.",
    32,
    52,
    { width: doc.page.width - 64 },
  );

  let y = 76;
  y = drawTableHeader(doc, RANKING_COLUMNS, y);

  for (const entry of report.entries) {
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = drawTableHeader(doc, RANKING_COLUMNS, 40);
    }
    y = drawTableRow(doc, RANKING_COLUMNS, entry, y);
  }
}

function drawTableHeader(doc: Doc, columns: Column[], y: number): number {
  const height = 24;
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
  doc.rect(32, y, totalWidth, height).fill(HEAD_BG);

  let x = 32;
  doc.font("bold").fontSize(7).fillColor("#ffffff");
  for (const column of columns) {
    doc.text(column.title, x + 3, y + 5, { width: column.width - 6, align: "center" });
    x += column.width;
  }
  return y + height;
}

function drawTableRow(doc: Doc, columns: Column[], entry: CoinEntry, y: number): number {
  const height = 18;
  if (entry.rank % 2 === 0) {
    const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
    doc.rect(32, y, totalWidth, height).fill("#f4f6fa");
  }

  let x = 32;
  doc.font("body").fontSize(7).fillColor(INK);
  for (const column of columns) {
    doc.text(column.value(entry), x + 3, y + 5, {
      width: column.width - 6,
      align: column.align ?? "left",
      lineBreak: false,
      ellipsis: true,
    });
    x += column.width;
  }

  doc.moveTo(32, y + height).lineTo(x, y + height).strokeColor(LINE).lineWidth(0.4).stroke();
  return y + height;
}

function drawEntryDetail(doc: Doc, entry: CoinEntry) {
  doc.addPage();
  const width = doc.page.width - 64;

  doc.fillColor(INK).font("bold").fontSize(15)
    .text(`${entry.rank}위  ${entry.nameKo} (${entry.symbol})`, 32, 32);
  doc.font("body").fontSize(8).fillColor(MUTED)
    .text(
      `${entry.name} · 시총 ${entry.scale.cmcRank}위 · 기준 네트워크 ${entry.fee.network}` +
        (entry.isStablecoin ? " · 스테이블코인" : ""),
      32,
      52,
    );

  let y = 74;
  y = section(doc, "B. 가격변동안정성 및 코인규모", y, [
    ["현재가", formatPriceKrw(entry.priceKrw)],
    ["1년 가격 변동률", `${formatPctSigned(entry.volatility.changeRate1yPct)} (등급 ${entry.volatility.grade})`],
    ["연율 변동성 / 최대낙폭", `${formatPct(entry.volatility.annualizedVolatilityPct)} / ${formatPct(entry.volatility.maxDrawdownPct)}`],
    ["시가총액", `${formatKrwCompact(entry.scale.marketCapKrw)} (등급 ${entry.scale.grade})`],
    ["유통량 / 총 발행량", `${entry.scale.circulatingSupply.toLocaleString("ko-KR")} / ${entry.scale.totalSupply ? entry.scale.totalSupply.toLocaleString("ko-KR") : "무제한"}`],
    ["국내 상장 거래소", DOMESTIC_EXCHANGES.filter((ex) => entry.listings[ex]).map((ex) => DOMESTIC_EXCHANGE_LABEL[ex]).join(", ")],
    ["이체 수수료", `${formatAmount(entry.fee.medianAmount)} ${entry.symbol} = ${formatPriceKrw(entry.fee.medianKrw)} (100만원 이체 시 ${formatFeeRatio(entry.fee.ratioPct)})`],
    ["거래소별 출금 수수료", DOMESTIC_EXCHANGES.map((ex) => `${DOMESTIC_EXCHANGE_LABEL[ex]} ${entry.fee.byExchange[ex] == null ? "-" : formatAmount(entry.fee.byExchange[ex]!)}`).join(" / ")],
  ], width);

  y = section(doc, "C. 재단 정보", y, [
    ["재단이름", entry.foundation.name],
    ["홈페이지", entry.foundation.homepage],
    ["재단 설명", entry.foundation.description],
  ], width);

  y = section(doc, "D. 코인 제작 목표 및 활용 분야", y, [
    ["제작 목표", entry.whitepaper.goal],
    ["활용 분야", entry.whitepaper.useCases],
  ], width);

  y = section(doc, `E. SNS 채널 및 활성도 (등급 ${entry.community.grade})`, y, [
    ...entry.community.channels.map(
      (channel): [string, string] => [channel.platform, `${channel.url}  ·  ${formatCount(channel.members)}`],
    ),
    ["합계 참가자", formatCount(entry.community.totalMembers)],
    ["월간 메시지(추정)", entry.community.monthlyMessages ? `${entry.community.monthlyMessages.toLocaleString("ko-KR")}건` : "-"],
  ], width);

  section(doc, "F. 총평", y, [["", entry.summary]], width);
}

function section(doc: Doc, title: string, y: number, rows: [string, string][], width: number): number {
  // 섹션 제목과 최소 한 줄이 함께 들어갈 여유가 없을 때만 페이지를 넘긴다.
  if (y > doc.page.height - 78) {
    doc.addPage();
    y = 40;
  }

  doc.font("bold").fontSize(9.5).fillColor(HEAD_BG).text(title, 32, y);
  y = doc.y + 4;

  doc.fontSize(8);
  for (const [label, value] of rows) {
    if (y > doc.page.height - 46) {
      doc.addPage();
      y = 40;
    }
    if (label) {
      doc.font("bold").fillColor(MUTED).text(label, 40, y, { width: 120 });
      doc.font("body").fillColor(INK).text(value, 168, y, { width: width - 140 });
    } else {
      doc.font("body").fillColor(INK).text(value, 40, y, { width: width - 16 });
    }
    y = doc.y + 3;
  }
  return y + 8;
}

function drawMethodology(doc: Doc, report: Report) {
  doc.addPage();
  const width = doc.page.width - 64;
  doc.font("bold").fontSize(14).fillColor(INK).text("평가 방법론 및 데이터 출처", 32, 32);

  let y = 60;
  const blocks: [string, string[]][] = [
    ["평가 항목", [
      "활용성(Usability) : 1.1 국내 거래소 상장 여부, 1.2 거래·이체 수수료, 1.3 백서상 활용 목표와 분야",
      "지속성(Sustainability) : 2.1 가격변동성, 2.2 시가총액 및 전체 물량, 2.3 재단 유무 및 안정성, 2.4 커뮤니티·SNS 채널",
    ]],
    ["선정 절차", [
      `A단계 : 시총 100위 이내 + 글로벌 2개 이상 거래소 상장 + 변동성 기준을 적용해 ${report.universe.stageA}종 선별 (스테이블코인은 규모 조건만 적용)`,
      `B단계 : 국내 5대 거래소 중 3곳 이상 상장 요건을 적용해 최종 ${report.universe.stageB}종 확정`,
    ]],
    ["배점", [
      "활용성 100점 = 국내상장 40 + 이체수수료 35 + 활용분야 25",
      "지속성 100점 = 가격변동성 35 + 시가총액 25 + 재단 20 + 커뮤니티 20",
      "종합점수 = 활용성 40% + 지속성 60%",
      "등급(A~E) = 선정 30종 내 상대평가 5분위. 상위 20%가 A등급이다.",
    ]],
    ["데이터 출처", report.sources.map((source) => `${source.label} — ${source.detail}`)],
  ];

  for (const [title, lines] of blocks) {
    doc.font("bold").fontSize(10).fillColor(HEAD_BG).text(title, 32, y);
    y = doc.y + 6;
    doc.font("body").fontSize(8.5).fillColor(INK);
    for (const line of lines) {
      doc.text(`· ${line}`, 40, y, { width: width - 16 });
      y = doc.y + 4;
    }
    y += 10;
  }

  if (report.notices.length > 0) {
    doc.font("bold").fontSize(10).fillColor("#a3401f").text("유의사항", 32, y);
    y = doc.y + 6;
    doc.font("body").fontSize(8.5).fillColor(INK);
    for (const notice of report.notices) {
      doc.text(`· ${notice}`, 40, y, { width: width - 16 });
      y = doc.y + 4;
    }
  }
}

function drawPageNumbers(doc: Doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);

    // 푸터는 하단 여백 바깥에 그린다. 여백을 잠시 0으로 두지 않으면 pdfkit 이
    // "여백을 넘었다"고 판단해 페이지를 새로 만들어 버린다.
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.font("body").fontSize(7).fillColor(MUTED).text(
      `IDAC 디지털자산 평가 리포트   ·   ${i + 1} / ${range.count}`,
      32,
      doc.page.height - 24,
      { width: doc.page.width - 64, align: "center", lineBreak: false },
    );

    doc.page.margins.bottom = bottom;
  }
}
