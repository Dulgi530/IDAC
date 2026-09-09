#!/usr/bin/env node
/**
 * PDF 내보내기에 쓰는 한글 폰트를 내려받는다.
 *
 * pdfkit 은 한글 글리프를 내장하고 있지 않으므로, 폰트 파일을 직접 임베드해야
 * 한글이 깨지지 않는다. Pretendard 는 SIL Open Font License 1.1 이라 재배포가
 * 가능하다. 저장소에는 폰트를 커밋하지 않고 이 스크립트로 받아 쓴다.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const BASE =
  "https://raw.githubusercontent.com/orioncactus/pretendard/main/packages/pretendard/dist/public/static";

const FONTS = [
  { file: "Pretendard-Regular.otf", url: `${BASE}/Pretendard-Regular.otf` },
  { file: "Pretendard-Bold.otf", url: `${BASE}/Pretendard-Bold.otf` },
];

const outDir = path.resolve("assets/fonts");
await mkdir(outDir, { recursive: true });

for (const font of FONTS) {
  const target = path.join(outDir, font.file);
  try {
    await access(target);
    console.log(`skip  ${font.file} (이미 존재)`);
    continue;
  } catch {
    // 없으면 내려받는다.
  }

  const response = await fetch(font.url);
  if (!response.ok) {
    console.error(`fail  ${font.file}: HTTP ${response.status}`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
  console.log(`fetch ${font.file}`);
}
