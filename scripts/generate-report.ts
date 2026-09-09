#!/usr/bin/env tsx
/**
 * 월간 리포트 생성 CLI.
 *
 *   npx tsx scripts/generate-report.ts --period 2026-09 --mode fixture
 *
 * 서버를 띄우지 않고 리포트를 만들어 data/reports 에 저장한다.
 * 매월 스케줄러(cron, GitHub Actions 등)에서 호출하는 것을 상정한다.
 */
import { generateReport } from "../src/lib/evaluation/pipeline";
import { saveReport } from "../src/lib/storage";
import type { DataSourceMode } from "../src/lib/evaluation/types";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function defaultPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function main() {
  const period = arg("period") ?? defaultPeriod();
  const mode = (arg("mode") ?? process.env.IDAC_DATA_SOURCE ?? "fixture") as DataSourceMode;

  if (mode !== "live" && mode !== "fixture") {
    console.error(`알 수 없는 모드입니다: ${mode} (live 또는 fixture)`);
    process.exit(1);
  }

  console.log(`리포트 생성 시작 — 기간 ${period}, 모드 ${mode}`);

  const report = await generateReport({ period, mode });
  await saveReport(report);

  console.log(`완료: ${report.entries.length}종 평가, data/reports/${period}.json 저장`);
  console.log(`  1차 후보군 ${report.universe.stageA}종 → 최종 ${report.universe.stageB}종`);
  for (const notice of report.notices) console.log(`  [유의] ${notice}`);
  console.log("\n상위 10종");
  for (const entry of report.entries.slice(0, 10)) {
    console.log(
      `  ${String(entry.rank).padStart(2)}. ${entry.symbol.padEnd(6)} ${entry.nameKo.padEnd(12)}` +
        ` 종합 ${entry.scores.total.toFixed(1).padStart(5)}` +
        ` | 변동성 ${entry.volatility.grade} 규모 ${entry.scale.grade} SNS ${entry.community.grade}` +
        ` | 수수료 ${entry.fee.ratioPct.toFixed(3)}%`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
