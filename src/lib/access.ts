import { headers } from "next/headers";

/**
 * ADMIN / 퍼블릭 분리 (요구사항 4).
 *
 *  - 도메인으로 1차 구분한다. `ADMIN_HOST` 와 일치하는 호스트로 들어온 요청만
 *    관리자 화면을 볼 수 있다.
 *  - 리포트를 실제로 생성하는 쓰기 API 는 여기에 더해 `ADMIN_TOKEN` 검증을
 *    요구한다. 도메인만으로는 쓰기를 허용하지 않는다.
 *  - 퍼블릭은 생성된 리포트를 조회만 할 수 있다.
 */

export const ADMIN_TOKEN_HEADER = "x-idac-admin-token";

/** 현재 요청이 관리자 도메인으로 들어왔는지 판별한다. */
export async function isAdminHost(): Promise<boolean> {
  const adminHost = process.env.ADMIN_HOST;
  if (!adminHost) return false;

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  return normalizeHost(host) === normalizeHost(adminHost);
}

export type WriteAuth =
  | { ok: true }
  | { ok: false; status: 401 | 403; message: string };

/**
 * 리포트 생성/삭제 권한 검사.
 * 관리자 도메인 + 유효한 관리자 토큰을 모두 만족해야 통과한다.
 */
export async function authorizeWrite(request: Request): Promise<WriteAuth> {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return {
      ok: false,
      status: 403,
      message: "ADMIN_TOKEN 이 설정되지 않아 리포트 생성이 비활성화되어 있습니다.",
    };
  }

  if (!(await isAdminHost())) {
    return { ok: false, status: 403, message: "관리자 도메인에서만 리포트를 생성할 수 있습니다." };
  }

  const provided = request.headers.get(ADMIN_TOKEN_HEADER) ?? "";
  if (!timingSafeEqual(provided, expected)) {
    return { ok: false, status: 401, message: "관리자 토큰이 올바르지 않습니다." };
  }

  return { ok: true };
}

function normalizeHost(host: string): string {
  return host.trim().toLowerCase();
}

/** 토큰 비교 시 길이/내용에 따른 응답 시간 차이를 줄인다. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
