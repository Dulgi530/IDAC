/** 외부 API 호출 공통 헬퍼. 타임아웃·재시도·에러 정규화를 담당한다. */

export class ProviderError extends Error {
  constructor(
    readonly provider: string,
    message: string,
    readonly status?: number,
  ) {
    super(`[${provider}] ${message}`);
    this.name = "ProviderError";
  }
}

export interface FetchJsonOptions {
  provider: string;
  headers?: Record<string, string>;
  /** 밀리초. 기본 10초. */
  timeoutMs?: number;
  /** 네트워크/5xx 오류 시 재시도 횟수. 기본 2회. */
  retries?: number;
  method?: "GET" | "POST";
  body?: unknown;
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions): Promise<T> {
  const { provider, headers = {}, timeoutMs = 10_000, retries = 2, method = "GET", body } = options;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        headers: { accept: "application/json", ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        // 4xx 는 재시도해도 동일하므로 즉시 중단한다.
        if (response.status < 500) {
          throw new ProviderError(provider, `HTTP ${response.status} ${response.statusText}`, response.status);
        }
        throw new ProviderError(provider, `HTTP ${response.status}`, response.status);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (error instanceof ProviderError && error.status && error.status < 500) throw error;
      if (attempt === retries) break;
      await sleep(2 ** attempt * 500);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new ProviderError(
    provider,
    lastError instanceof Error ? lastError.message : "요청에 실패했습니다.",
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
