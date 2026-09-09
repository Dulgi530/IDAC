export const metadata = { title: "평가 방법 · IDAC" };

/** 평가 기준을 퍼블릭에 공개하는 정적 문서 페이지. */
export default function MethodologyPage() {
  return (
    <>
      <h1>평가 방법</h1>
      <p className="lead">
        IDAC 리포트는 일반 이용자가 안정적으로 활용할 수 있는 디지털자산을 가려내기 위해, 활용성
        (Usability)과 지속가능성(Sustainability) 두 축을 계량 지표로 환산해 평가한다.
      </p>

      <h2>1. 평가 항목</h2>
      <h3>활용성 (Usability)</h3>
      <ul>
        <li>국내 거래소 상장 여부 — 원화로 즉시 현금화할 수 있는지를 본다.</li>
        <li>거래 및 이체 수수료 — 온체인 출금 수수료를 현재가로 환산해 부담률을 계산한다.</li>
        <li>백서상 활용 목표와 활용 분야 — 실제 수요가 있는 용도인지를 검토한다.</li>
      </ul>
      <h3>지속가능성 (Sustainability)</h3>
      <ul>
        <li>가격변동성 — 최근 1년 변동률, 연율 변동성, 최대낙폭을 함께 본다.</li>
        <li>시가총액 및 전체 물량 — 시총 100위 이내를 기본 요건으로 한다.</li>
        <li>재단 유무 및 안정성 — 운영 주체가 명확하고 활동이 지속되는지를 확인한다.</li>
        <li>커뮤니티 및 SNS 채널 — 공식 채널 운영 여부와 활성도를 본다.</li>
      </ul>

      <h2>2. 선정 절차</h2>
      <ol>
        <li>
          <strong>A단계</strong> — 코인마켓캡 시가총액 100위 이내이면서 글로벌 주요 거래소 2곳 이상에
          상장된 종목을 대상으로, 수수료·변동성·규모 조건을 적용해 1차 후보군 60종을 추린다.
          스테이블코인은 성격상 변동성 조건을 적용하지 않고 규모 조건만 적용한다.
        </li>
        <li>
          <strong>B단계</strong> — 국내 5대 거래소(업비트·빗썸·코인원·코빗·고팍스) 중 3곳 이상에
          상장된 종목만 남겨 최종 30종을 확정한다. 원화 즉시 환급 가능성을 담보하기 위한 요건이다.
        </li>
      </ol>

      <h2>3. 배점</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>축</th>
              <th>세부 항목</th>
              <th>배점</th>
            </tr>
          </thead>
          <tbody>
            <tr><td rowSpan={3}>활용성 (100)</td><td>국내 거래소 상장 수</td><td className="num">40</td></tr>
            <tr><td>이체 수수료 부담률</td><td className="num">35</td></tr>
            <tr><td>백서상 활용 분야 성숙도</td><td className="num">25</td></tr>
            <tr><td rowSpan={4}>지속성 (100)</td><td>가격변동성</td><td className="num">35</td></tr>
            <tr><td>시가총액 규모</td><td className="num">25</td></tr>
            <tr><td>재단 안정성</td><td className="num">20</td></tr>
            <tr><td>커뮤니티·SNS 활성도</td><td className="num">20</td></tr>
            <tr><td>종합</td><td>활용성 40% + 지속성 60%</td><td className="num">100</td></tr>
          </tbody>
        </table>
      </div>

      <h2>4. 등급과 정렬</h2>
      <p>
        A~E 등급은 절대 기준이 아니라 <strong>선정된 30종 내 상대평가</strong>다. 각 지표의 순위를
        5분위로 나누어 상위 20%에 A를 부여한다. 최종 순위는 안정성 종합 티어를 1순위 기준으로 하고,
        같은 티어 안에서는 이체 수수료 부담률이 낮은 코인을 앞에 둔다.
      </p>

      <h2>5. 데이터 출처</h2>
      <ul>
        <li>시세·시가총액·유통량 : 코인마켓캡 Pro API</li>
        <li>보안 점수 : CertiK Skynet (API 키가 설정된 경우)</li>
        <li>국내 상장·출금 수수료 : 업비트·빗썸·코인원·코빗·고팍스 API 및 공지</li>
        <li>해외 상장 : 바이낸스·코인베이스·OKX·바이비트·크라켄 공개 API</li>
        <li>재단·백서·SNS : 각 프로젝트 공식 홈페이지, 백서, 공식 SNS 채널</li>
      </ul>

      <h2>6. 한계</h2>
      <p className="footnote">
        본 리포트는 정보 제공을 목적으로 하며 투자 자문이나 특정 자산의 매수·매도 권유가 아니다.
        SNS 참가자 수와 커뮤니티 메시지 수는 조사 시점의 추정치이며, 거래소 출금 수수료는 네트워크
        상황에 따라 수시로 변경된다. 실제 거래 전에는 각 거래소의 최신 공지를 확인해야 한다.
      </p>
    </>
  );
}
