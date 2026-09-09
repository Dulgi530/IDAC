import { promises as fs } from "node:fs";
import path from "node:path";
import type { Report, ReportSummary } from "./evaluation/types";

/**
 * 리포트 저장소. 파일 시스템에 기간별 JSON 으로 보관한다.
 *
 * 퍼블릭 화면은 여기 저장된 리포트를 읽기 전용으로 보여주고,
 * ADMIN 화면만 새 리포트를 써 넣는다(요구사항 4).
 */

function reportDir(): string {
  return path.resolve(process.env.IDAC_REPORT_DIR || "./data/reports");
}

const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

/** 경로 조작을 막기 위해 기간 문자열 형식을 강제한다. */
export function assertValidPeriod(period: string): string {
  if (!PERIOD_PATTERN.test(period)) {
    throw new Error(`잘못된 리포트 기간 형식입니다: ${period} (예: 2026-09)`);
  }
  return period;
}

export async function saveReport(report: Report): Promise<void> {
  assertValidPeriod(report.period);
  const dir = reportDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${report.period}.json`),
    JSON.stringify(report, null, 2),
    "utf8",
  );
}

export async function loadReport(period: string): Promise<Report | null> {
  assertValidPeriod(period);
  try {
    const raw = await fs.readFile(path.join(reportDir(), `${period}.json`), "utf8");
    return JSON.parse(raw) as Report;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function listReports(): Promise<ReportSummary[]> {
  let files: string[];
  try {
    files = await fs.readdir(reportDir());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const summaries: ReportSummary[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const report = await loadReport(file.replace(/\.json$/, "")).catch(() => null);
    if (!report) continue;
    summaries.push({
      period: report.period,
      title: report.title,
      asOf: report.asOf,
      generatedAt: report.generatedAt,
      dataSource: report.dataSource,
      coinCount: report.entries.length,
    });
  }
  // 최신 기간이 위로 오도록 정렬한다.
  return summaries.sort((a, b) => b.period.localeCompare(a.period));
}

export async function deleteReport(period: string): Promise<boolean> {
  assertValidPeriod(period);
  try {
    await fs.unlink(path.join(reportDir(), `${period}.json`));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}
