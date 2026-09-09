#!/usr/bin/env node
/**
 * 리포트 JSON → 단일 HTML 페이지(아티팩트 발행용) 변환기.
 * 30행을 손으로 옮기지 않고 데이터에서 직접 생성해 표기 오류를 없앤다.
 */
import { readFile, writeFile } from "node:fs/promises";

const period = process.argv[2] ?? "2026-09";
const out = process.argv[3] ?? "/tmp/idac-report.html";
const report = JSON.parse(await readFile(`data/reports/${period}.json`, "utf8"));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const nf = new Intl.NumberFormat("ko-KR");
const won = (v) => (v >= 100 ? nf.format(Math.round(v)) : v >= 1 ? v.toFixed(2) : v.toFixed(4));
const feeRatio = (v) => (v === 0 ? "0%" : v < 0.001 ? "<0.001%" : `${v.toFixed(3)}%`);
const amount = (v) =>
  v >= 1 ? nf.format(Number(v.toFixed(4))) : v.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
const members = (v) => (v == null ? "비공개" : v >= 10000 ? `${(v / 10000).toFixed(1)}만` : nf.format(v));

const EX = { upbit: "업비트", bithumb: "빗썸", coinone: "코인원", korbit: "코빗", gopax: "고팍스" };
const EX_KEYS = Object.keys(EX);
const GX = { binance: "바이낸스", coinbase: "코인베이스", okx: "OKX", bybit: "바이비트", kraken: "크라켄" };

const grade = (g) => `<span class="g g-${g}">${g}</span>`;

// 1년 변동률 인라인 바 — 0을 기준으로 왼쪽으로 뻗는다(전 종목 하락).
const worst = Math.min(...report.entries.map((e) => e.volatility.changeRate1yPct));
const changeCell = (v) => {
  const w = Math.abs(v / worst) * 100;
  // 0.1%p 미만은 스테이블코인의 보합으로 보고 방향색을 쓰지 않는다.
  const flat = Math.abs(v) < 0.1;
  const cls = flat ? "flat" : v < 0 ? "down" : "up";
  const text = flat ? "0.0%" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
  return `<div class="chg"><span class="chg-v ${cls}">${text}</span><span class="chg-bar"><i style="width:${w.toFixed(1)}%"></i></span></div>`;
};

const E = report.entries;
const totalCap = E.reduce((s, e) => s + e.scale.marketCapKrw, 0);
const avgChange = E.reduce((s, e) => s + e.volatility.changeRate1yPct, 0) / E.length;
const cheapest = [...E].sort((a, b) => a.fee.medianKrw - b.fee.medianKrw)[0];
const capText = `${nf.format(Math.floor(totalCap / 1e12))}조원`;

const rankRows = E.map((e) => `<tr>
<th scope="row" class="stick rk"><span class="rk-n">${e.rank}</span></th>
<th scope="row" class="stick nm"><span class="nm-ko">${esc(e.nameKo)}</span><span class="nm-sy">${esc(e.symbol)}</span></th>
<td class="n">${won(e.priceKrw)}</td>
<td class="n cap">${esc(e.scale.marketCapKrwText)}</td>
<td class="n dim">${e.scale.cmcRank}</td>
<td class="chg-cell">${changeCell(e.volatility.changeRate1yPct)}</td>
<td class="n dim">${e.volatility.annualizedVolatilityPct.toFixed(1)}%</td>
<td class="n dim">${e.volatility.maxDrawdownPct.toFixed(1)}%</td>
<td class="c">${grade(e.volatility.grade)}</td>
<td class="c">${grade(e.scale.grade)}</td>
<td class="c">${grade(e.community.grade)}</td>
<td class="n">${amount(e.fee.medianAmount)}</td>
<td class="n">${won(e.fee.medianKrw)}</td>
<td class="n em">${feeRatio(e.fee.ratioPct)}</td>
<td class="ex">${EX_KEYS.filter((k) => e.listings[k]).map((k) => `<span class="chip">${EX[k]}</span>`).join("")}</td>
<td class="n dim">${e.scores.usability.toFixed(1)}</td>
<td class="n dim">${e.scores.sustainability.toFixed(1)}</td>
<td class="n em">${e.scores.total.toFixed(1)}</td>
</tr>`).join("\n");

const feeRows = E.map((e) => `<tr>
<th scope="row" class="stick rk"><span class="rk-n">${e.rank}</span></th>
<th scope="row" class="stick nm"><span class="nm-ko">${esc(e.nameKo)}</span><span class="nm-sy">${esc(e.symbol)}</span></th>
<td class="net">${esc(e.fee.network)}</td>
${EX_KEYS.map((k) => `<td class="n ${e.fee.byExchange[k] == null ? "dim" : ""}">${e.fee.byExchange[k] == null ? "—" : amount(e.fee.byExchange[k])}</td>`).join("")}
<td class="n em">${amount(e.fee.medianAmount)}</td>
<td class="n">${won(e.fee.medianKrw)}원</td>
<td class="n">${feeRatio(e.fee.ratioPct)}</td>
</tr>`).join("\n");

const foundRows = E.map((e) => `<tr>
<th scope="row" class="rk"><span class="rk-n">${e.rank}</span></th>
<th scope="row" class="nm"><span class="nm-ko">${esc(e.nameKo)}</span><span class="nm-sy">${esc(e.symbol)}</span></th>
<td class="fn">${esc(e.foundation.name)}<br><a href="${esc(e.foundation.homepage)}" target="_blank" rel="noreferrer">${esc(e.foundation.homepage.replace(/^https?:\/\//, ""))}</a></td>
<td class="prose">${esc(e.foundation.description)}</td>
</tr>`).join("\n");

const wpRows = E.map((e) => `<tr>
<th scope="row" class="rk"><span class="rk-n">${e.rank}</span></th>
<th scope="row" class="nm"><span class="nm-ko">${esc(e.nameKo)}</span><span class="nm-sy">${esc(e.symbol)}</span></th>
<td class="prose">${esc(e.whitepaper.goal)}</td>
<td class="prose">${esc(e.whitepaper.useCases)}</td>
</tr>`).join("\n");

const snsRows = E.map((e) => `<tr>
<th scope="row" class="rk"><span class="rk-n">${e.rank}</span></th>
<th scope="row" class="nm"><span class="nm-ko">${esc(e.nameKo)}</span><span class="nm-sy">${esc(e.symbol)}</span></th>
<td class="sns">${e.community.channels.map((c) => `<a href="${esc(c.url)}" target="_blank" rel="noreferrer"><b>${esc(c.platform)}</b><span>${esc(c.url.replace(/^https?:\/\//, ""))}</span><em>${members(c.members)}</em></a>`).join("")}</td>
<td class="n">${members(e.community.totalMembers)}</td>
<td class="n dim">${e.community.monthlyMessages ? nf.format(e.community.monthlyMessages) : "—"}</td>
<td class="c">${grade(e.community.grade)}</td>
</tr>`).join("\n");

const sumRows = E.map((e) => `<tr>
<th scope="row" class="rk"><span class="rk-n">${e.rank}</span></th>
<th scope="row" class="nm"><span class="nm-ko">${esc(e.nameKo)}</span><span class="nm-sy">${esc(e.symbol)}</span></th>
<td class="n em">${e.scores.total.toFixed(1)}</td>
<td class="prose lead-p">${esc(e.summary)}</td>
</tr>`).join("\n");

const html = await readFile("scripts/page-template.html", "utf8");
const filled = html
  .replace("{{RANK_ROWS}}", rankRows)
  .replace("{{FEE_ROWS}}", feeRows)
  .replace("{{FOUND_ROWS}}", foundRows)
  .replace("{{WP_ROWS}}", wpRows)
  .replace("{{SNS_ROWS}}", snsRows)
  .replace("{{SUM_ROWS}}", sumRows)
  .replace("{{FEE_HEAD}}", EX_KEYS.map((k) => `<th scope="col">${EX[k]}</th>`).join(""))
  .replace("{{NOTICES}}", report.notices.map((n) => `<li>${esc(n)}</li>`).join(""))
  .replace("{{SOURCES}}", report.sources.map((s) => `<li>${esc(s)}</li>`).join(""))
  .replace(/{{COUNT}}/g, String(E.length))
  .replace("{{TOTAL_CAP}}", capText)
  .replace("{{AVG_CHANGE}}", `${avgChange.toFixed(1)}%`)
  .replace("{{CHEAPEST}}", `${esc(cheapest.nameKo)} ${won(cheapest.fee.medianKrw)}원`)
  .replace("{{USDKRW}}", nf.format(report.usdKrw))
  .replace("{{ASOF}}", new Date(report.asOf).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }))
  .replace("{{STAGE_A}}", String(report.universe.stageA));

await writeFile(out, filled);
console.log(`생성 완료: ${out} (${(filled.length / 1024).toFixed(0)}KB, ${E.length}종)`);
