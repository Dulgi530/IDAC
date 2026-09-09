"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_TOKEN_HEADER = "x-idac-admin-token";

function defaultPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** 리포트 생성 폼. 관리자 토큰은 브라우저에 저장하지 않고 요청 헤더로만 전달한다. */
export function GenerateForm() {
  const router = useRouter();
  const [period, setPeriod] = useState(defaultPeriod);
  const [mode, setMode] = useState<"live" | "fixture">("live");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json", [ADMIN_TOKEN_HEADER]: token },
        body: JSON.stringify({ period, mode }),
      });
      const json = await response.json();

      if (!response.ok) {
        setMessage({ kind: "error", text: json.error ?? "리포트 생성에 실패했습니다." });
        return;
      }

      const notices = (json.notices as string[] | undefined) ?? [];
      setMessage({
        kind: "ok",
        text:
          `${json.period} 리포트를 생성했습니다 (${json.coinCount}종).` +
          (notices.length > 0 ? ` 유의사항 ${notices.length}건이 함께 기록되었습니다.` : ""),
      });
      router.refresh();
    } catch (error) {
      setMessage({ kind: "error", text: `요청 중 오류가 발생했습니다: ${(error as Error).message}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>리포트 기간 (YYYY-MM)</span>
        <input
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          pattern="\d{4}-\d{2}"
          placeholder="2026-09"
          required
        />
      </label>

      <label className="field">
        <span>데이터 소스</span>
        <select value={mode} onChange={(e) => setMode(e.target.value as "live" | "fixture")}>
          <option value="live">실시간 집계 (코인마켓캡·거래소 API)</option>
          <option value="fixture">오프라인 스냅샷 (검증·데모용)</option>
        </select>
      </label>

      <label className="field">
        <span>관리자 토큰</span>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="off"
          required
        />
      </label>

      <button className="btn" type="submit" disabled={busy}>
        {busy ? "생성 중…" : "리포트 생성"}
      </button>

      {message && (
        <p
          style={{ marginTop: 12 }}
          className={message.kind === "error" ? "notice" : "footnote"}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
