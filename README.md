# IDAC — 디지털자산 활용성·지속가능성 평가 리포트 플랫폼

국내 5대 거래소에 상장되어 원화로 즉시 현금화할 수 있는 디지털자산을 대상으로,
**활용성(Usability)** 과 **지속가능성(Sustainability)** 을 매월 계량 평가해 30종의
순위 리포트를 생성·공개하는 웹 애플리케이션이다.

## 기능

| 요구사항 | 구현 |
| --- | --- |
| 코인마켓캡 + CertiK Skynet 데이터 집계 API | `GET /api/market/aggregate` |
| 국내 5대 거래소 온체인 송금 수수료 API | `GET /api/fees?symbols=BTC,ETH` |
| PDF · 엑셀 다운로드 | `GET /api/reports/{period}/export/pdf` · `.../export/xlsx` |
| ADMIN / 퍼블릭 도메인 분리 | 관리자 도메인에서만 리포트 생성, 퍼블릭은 조회 전용 |

## 화면

| 경로 | 설명 | 접근 |
| --- | --- | --- |
| `/` | 발행된 리포트 목록 | 퍼블릭 |
| `/reports/{YYYY-MM}` | 리포트 전문 (순위표·수수료·재단·백서·SNS·총평) | 퍼블릭 |
| `/methodology` | 평가 기준과 배점 공개 | 퍼블릭 |
| `/admin` | 리포트 생성 | 관리자 도메인 전용 (그 외에서는 404) |

## 시작하기

```bash
npm install
npm run fetch:fonts          # PDF용 한글 폰트(Pretendard) 준비 — 저장소에 이미 포함
cp .env.example .env.local   # 환경변수 설정
npm run dev
```

리포트를 서버 없이 생성하려면:

```bash
npm run report:generate -- --period 2026-09 --mode fixture
npm run report:generate -- --period 2026-09 --mode live     # 실 API 사용
```

리포트를 단일 HTML 페이지(공유·발행용)로 뽑으려면:

```bash
npm run page:build -- 2026-09 out/idac-2026-09.html
```

`scripts/page-template.html` 이 레이아웃, `scripts/build-page.mjs` 가 리포트 JSON을
표로 채워 넣는다. 표 내용을 손으로 옮기지 않으므로 표기 오류가 생기지 않는다.

## 환경변수

| 변수 | 설명 |
| --- | --- |
| `IDAC_DATA_SOURCE` | `live`(실 API) 또는 `fixture`(오프라인 스냅샷). 기본 `fixture` |
| `COINMARKETCAP_API_KEY` | 코인마켓캡 Pro API 키. `live` 모드 필수 |
| `SKYNET_API_KEY` | CertiK Skynet 파트너 키. 없으면 보안 점수 항목이 제외된다 |
| `ADMIN_HOST` | 관리자 도메인 (예: `admin.idac.example.com`) |
| `ADMIN_TOKEN` | 리포트 생성 API 토큰. 미설정 시 생성 기능이 잠긴다 |
| `IDAC_REPORT_DIR` | 리포트 JSON 저장 경로. 기본 `./data/reports` |

## 권한 모델

리포트 **생성/삭제**는 두 조건을 모두 만족해야 한다.

1. 요청 호스트가 `ADMIN_HOST` 와 일치할 것
2. `x-idac-admin-token` 헤더가 `ADMIN_TOKEN` 과 일치할 것 (상수 시간 비교)

퍼블릭 도메인에서는 `/admin` 이 404 를 반환해 존재 자체가 드러나지 않는다.
조회·다운로드 API는 인증 없이 열려 있다.

## 데이터 소스와 신뢰도

| 항목 | 출처 | 취득 방식 |
| --- | --- | --- |
| 시세·시가총액·유통량 | 코인마켓캡 Pro API | 실시간 |
| 1년 변동률·변동성·최대낙폭 | 코인마켓캡 일봉 OHLCV | 실시간 계산 |
| 보안 점수 | CertiK Skynet | 파트너 키 필요 |
| 국내 상장 여부 | 업비트·빗썸·코인원·코빗·고팍스 | 공개 API |
| 출금 수수료 | 코인원·코빗·고팍스 | 공개 API |
| 출금 수수료 | 업비트·빗썸 | **인증 API 필요** — 미설정 시 수동 테이블 폴백 |
| 재단·백서·SNS | 공식 홈페이지·백서·SNS | `src/data/profiles.ts` 정성 데이터 |

`GET /api/fees` 응답의 `capability` 필드가 각 거래소 수수료 값이 실시간 조회인지
수동 테이블인지 알려준다. `src/data/withdrawal-fees.ts` 의 값은 **검증이 필요한
참고 기준값**이며, 발행용 리포트에서는 실 API 값으로 대체해야 한다.

## 평가 로직

```
A단계  시총 100위 이내 + 글로벌 2개 이상 거래소 상장 + 변동성 조건 → 후보 60종
       (스테이블코인은 규모 조건만 적용)
B단계  국내 5대 거래소 중 3곳 이상 상장 → 최종 30종
등급   선정 30종 내 상대평가 5분위 (상위 20% = A)
점수   활용성 = 국내상장 40 + 이체수수료 35 + 활용분야 25
       지속성 = 가격변동성 35 + 시가총액 25 + 재단 20 + 커뮤니티 20
       종합   = 활용성 40% + 지속성 60%
정렬   안정성 티어(A→E) → 이체 수수료 낮은 순 → 종합점수 높은 순
```

이체 수수료 부담률은 **100만원을 이체할 때** 수수료가 차지하는 비중이다.
코인마다 1개 단가가 크게 다르므로 같은 금액 기준으로 환산해야 비교가 성립한다.

자세한 규격은 [`docs/EVALUATION_SPEC.md`](docs/EVALUATION_SPEC.md) 참고.

## 배포 시 유의사항

리포트는 파일 시스템(`data/reports/*.json`)에 저장된다. Vercel 등 서버리스
환경에서는 런타임 파일 쓰기가 유지되지 않으므로, 다음 중 하나를 택해야 한다.

- **커밋 기반 발행** (권장) — `npm run report:generate` 로 생성한 JSON 을 커밋해
  배포한다. 퍼블릭은 항상 커밋된 리포트를 본다.
- **외부 스토리지** — `src/lib/storage.ts` 의 인터페이스를 Vercel Blob 이나 KV
  구현으로 교체한다.

## 한계

- 본 리포트는 정보 제공 목적이며 투자 자문이 아니다.
- SNS 참가자 수와 월간 메시지 수는 조사 시점 **추정치**다.
- 거래소 출금 수수료는 네트워크 상황에 따라 수시로 변경된다.
