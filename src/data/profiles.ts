import type { SnsChannel } from "../lib/evaluation/types";

/**
 * 코인별 정성 프로필.
 *
 *  - foundation  : C 항목 (2.3 재단 유무 및 재단 안정성)
 *  - whitepaper  : D 항목 (1.3 백서를 통한 활용 목표 및 활용 분야)
 *  - sns         : E 항목 (2.4 커뮤니티 및 SNS 소통채널)
 *
 * 재단·백서 정보는 공식 홈페이지와 백서를 근거로 한 정성 데이터이므로 월별로
 * 크게 바뀌지 않는다. 반면 `members` 는 조사 시점의 **추정치**이며, 실제 값은
 * 각 채널 공개 지표로 매월 재확인해야 한다(리포트에 추정치임을 명시한다).
 */
export interface CoinProfile {
  symbol: string;
  name: string;
  nameKo: string;
  isStablecoin: boolean;
  /** 이체 수수료 산정 기준 네트워크. */
  network: string;
  foundation: { name: string; homepage: string; description: string };
  whitepaper: { goal: string; useCases: string };
  sns: SnsChannel[];
  /** 커뮤니티 월간 게시물/메시지 추정치. */
  monthlyMessages: number | null;
  /** 재단 정보 명확성과 운영 지속성 (0~100). 2.3 평가 결과. */
  foundationScore: number;
  /** 백서상 활용 분야의 구체성과 실사용 성숙도 (0~100). 1.3 평가 결과. */
  useCaseScore: number;
}

export const COIN_PROFILES: CoinProfile[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    nameKo: "비트코인",
    isStablecoin: false,
    network: "Bitcoin",
    foundation: {
      name: "Bitcoin Core 개발 커뮤니티 / Brink · HRF 등 후원 조직",
      homepage: "https://bitcoin.org",
      description:
        "비트코인은 단일 재단이 없는 완전 탈중앙 프로젝트로, Bitcoin Core 개발자 그룹이 합의 기반으로 유지보수를 담당한다. Brink, Chaincode Labs, HRF 등이 개발자 급여를 후원하며 15년 이상 무중단 운영과 코드 감사를 지속해 왔다.",
    },
    whitepaper: {
      goal:
        "사토시 나카모토의 백서는 신뢰받는 제3자 없이 개인 간 직접 전자화폐 이체를 실현하는 것을 목표로 한다. 작업증명 기반 타임스탬프 체인으로 이중지불을 차단하고, 2,100만 개 발행 한도로 통화 희소성을 보장한다.",
      useCases:
        "가치저장 수단(디지털 금)과 국가 간 대체 송금 수단이 핵심 용도다. 현물 ETF 승인 이후 기관 자산배분 편입이 확대되었고, 라이트닝 네트워크를 통한 소액결제와 기업 재무 준비자산 활용도 병행되고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/bitcoin", members: 7_600_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/Bitcoin/", members: 6_900_000 },
      { platform: "GitHub", url: "https://github.com/bitcoin/bitcoin", members: 84_000 },
      { platform: "Telegram", url: "https://t.me/bitcoin", members: 60_000 },
    ],
    monthlyMessages: 420_000,
    foundationScore: 88,
    useCaseScore: 92,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    nameKo: "이더리움",
    isStablecoin: false,
    network: "Ethereum(ERC-20)",
    foundation: {
      name: "Ethereum Foundation (이더리움 재단)",
      homepage: "https://ethereum.foundation",
      description:
        "2014년 스위스 추크에 설립된 비영리 재단으로, 프로토콜 연구·클라이언트 개발·생태계 보조금을 집행한다. 재무 현황과 지출 내역을 정기 보고서로 공개하며 머지·덴쿤 등 대형 업그레이드를 예정대로 완수해 왔다.",
    },
    whitepaper: {
      goal:
        "비탈릭 부테린의 백서는 튜링 완전한 스크립트를 실행하는 범용 블록체인을 제시한다. 스마트컨트랙트로 임의의 신뢰 규칙을 코드화해, 결제에 국한되지 않는 탈중앙 애플리케이션 플랫폼을 구축하는 것이 목표다.",
      useCases:
        "디파이·NFT·스테이블코인 발행·실물자산 토큰화의 기반 결제 계층으로 쓰인다. 레이어2 롤업의 데이터 가용성 계층 역할을 하며, 스테이킹을 통한 네트워크 보안 제공과 수수료 지불 수단으로도 사용된다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/ethereum", members: 3_800_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/ethereum/", members: 3_400_000 },
      { platform: "Discord", url: "https://discord.gg/ethereum-org", members: 90_000 },
      { platform: "GitHub", url: "https://github.com/ethereum/go-ethereum", members: 48_000 },
    ],
    monthlyMessages: 380_000,
    foundationScore: 95,
    useCaseScore: 96,
  },
  {
    symbol: "XRP",
    name: "XRP",
    nameKo: "엑스알피(리플)",
    isStablecoin: false,
    network: "XRP Ledger",
    foundation: {
      name: "XRP Ledger Foundation / Ripple Labs",
      homepage: "https://foundation.xrpl.org",
      description:
        "XRPL 재단은 원장의 중립적 운영과 오픈소스 유지보수를 담당하고, Ripple Labs가 기업용 결제 사업을 전개한다. 2023년 미 증권성 소송의 핵심 쟁점이 정리되면서 제도적 불확실성이 크게 완화되었다.",
    },
    whitepaper: {
      goal:
        "은행 간 국제송금의 결제 지연과 사전예치(노스트로) 비용을 없애는 것이 목표다. 합의 프로토콜로 3~5초 내 최종성을 확보하고, XRP를 브리지 통화로 써 통화쌍 유동성 문제를 해결하도록 설계됐다.",
      useCases:
        "국가 간 송금과 기업 결제망(ODL)이 주된 활용 분야다. 최근에는 XRPL 상의 스테이블코인 발행, 실물자산 토큰화, 중앙은행 디지털화폐(CBDC) 시범 사업 플랫폼으로 영역을 넓히고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Ripple", members: 2_900_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/XRP/", members: 400_000 },
      { platform: "Telegram", url: "https://t.me/Ripple", members: 120_000 },
      { platform: "GitHub", url: "https://github.com/XRPLF/rippled", members: 4_600 },
    ],
    monthlyMessages: 260_000,
    foundationScore: 84,
    useCaseScore: 86,
  },
  {
    symbol: "USDT",
    name: "Tether",
    nameKo: "테더",
    isStablecoin: true,
    network: "Tron(TRC-20)",
    foundation: {
      name: "Tether Operations Limited",
      homepage: "https://tether.to",
      description:
        "엘살바도르에 본사를 둔 발행사로 세계 최대 규모의 달러 연동 스테이블코인을 운영한다. 분기별 준비금 보증보고서를 공개하며 준비자산의 대부분을 미 국채로 보유한다. 재단형 비영리 조직이 아닌 영리 법인 구조다.",
    },
    whitepaper: {
      goal:
        "법정화폐 1달러를 1토큰에 연동해 블록체인 위에서 가격 변동 없는 결제·정산 수단을 제공하는 것이 목표다. 준비자산을 1:1로 적립하고 상시 상환을 보장해 암호자산 시장의 기축 통화 역할을 수행한다.",
      useCases:
        "거래소 간 기축 결제쌍, 디파이 담보·유동성 공급, 신흥국 달러 접근 수단으로 광범위하게 쓰인다. 국가 간 무역결제와 송금 대체 수단으로도 활용도가 빠르게 늘고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Tether_to", members: 480_000 },
      { platform: "Telegram", url: "https://t.me/OfficialTether", members: 70_000 },
      { platform: "GitHub", url: "https://github.com/tetherto", members: 1_200 },
    ],
    monthlyMessages: 45_000,
    foundationScore: 72,
    useCaseScore: 90,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    nameKo: "유에스디코인",
    isStablecoin: true,
    network: "Ethereum(ERC-20)",
    foundation: {
      name: "Circle Internet Financial",
      homepage: "https://www.circle.com",
      description:
        "미국 소재 규제 준수형 발행사로 뉴욕주 신탁업 인가와 EU MiCA 라이선스를 보유한다. 준비자산 전액을 미 국채와 현금으로 운용하며 대형 회계법인의 월간 검증보고서를 공개한다. 2024년 뉴욕증시에 상장했다.",
    },
    whitepaper: {
      goal:
        "완전 준비·규제 준수·상시 감사를 원칙으로 하는 달러 연동 토큰을 발행해, 기관과 기업이 안심하고 쓸 수 있는 온체인 결제 인프라를 제공하는 것이 목표다. 다중 체인 네이티브 발행으로 유동성 분절을 해소한다.",
      useCases:
        "기업 간 결제와 급여 지급, 디파이 담보, 거래소 정산에 쓰인다. CCTP 기반 크로스체인 전송과 실물자산 토큰화 펀드의 정산 통화로도 채택이 확대되고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/circle", members: 1_100_000 },
      { platform: "Discord", url: "https://discord.com/invite/buildoncircle", members: 30_000 },
      { platform: "GitHub", url: "https://github.com/circlefin", members: 1_800 },
    ],
    monthlyMessages: 38_000,
    foundationScore: 93,
    useCaseScore: 88,
  },
  {
    symbol: "SOL",
    name: "Solana",
    nameKo: "솔라나",
    isStablecoin: false,
    network: "Solana",
    foundation: {
      name: "Solana Foundation (솔라나 재단)",
      homepage: "https://solana.org",
      description:
        "스위스에 등록된 비영리 재단으로 검증인 분산화, 개발자 보조금, 해커톤을 운영한다. 2022년 FTX 사태 여파를 극복하고 네트워크 가동률과 검증인 수를 회복했으며 연차 보고서로 자금 집행을 공개한다.",
    },
    whitepaper: {
      goal:
        "역사증명(PoH)을 도입해 합의 이전에 시간 순서를 확정함으로써 초당 수만 건 처리와 초저비용 수수료를 달성하는 것이 목표다. 샤딩 없이 단일 상태 계층에서 고성능을 내는 구조를 지향한다.",
      useCases:
        "고빈도 탈중앙거래소, 결제, 소비자용 디앱, NFT 시장에서 강점을 보인다. 최근에는 스테이블코인 결제망과 탈중앙 물리 인프라(DePIN) 프로젝트의 기반 체인으로 활용도가 확대되고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/solana", members: 3_300_000 },
      { platform: "Discord", url: "https://discord.gg/solana", members: 130_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/solana/", members: 350_000 },
      { platform: "GitHub", url: "https://github.com/solana-labs/solana", members: 13_000 },
    ],
    monthlyMessages: 310_000,
    foundationScore: 87,
    useCaseScore: 90,
  },
  {
    symbol: "ADA",
    name: "Cardano",
    nameKo: "에이다",
    isStablecoin: false,
    network: "Cardano",
    foundation: {
      name: "Cardano Foundation (카르다노 재단)",
      homepage: "https://cardanofoundation.org",
      description:
        "스위스 추크에 등록된 비영리 재단으로 표준화, 규제 대응, 생태계 확산을 담당한다. IOG·EMURGO와 3축 거버넌스를 이루며, 감사받은 연차보고서를 공개하고 온체인 투표(볼테르) 체제로 국고 집행을 이관했다.",
    },
    whitepaper: {
      goal:
        "동료평가를 거친 학술 연구를 기반으로 검증 가능한 지분증명 블록체인을 만드는 것이 목표다. 우로보로스 합의로 에너지 효율과 안전성을 확보하고, 형식 검증으로 금융 등급 신뢰성을 달성하고자 한다.",
      useCases:
        "신원 인증(아탈라 프리즘), 공급망 추적, 개발도상국 금융 포용 사업에 활용된다. 하이드라·미드나이트 등 확장 계층과 디파이·스테이블코인 생태계도 함께 구축되고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Cardano", members: 1_500_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/cardano/", members: 750_000 },
      { platform: "Discord", url: "https://discord.gg/cardano", members: 45_000 },
      { platform: "GitHub", url: "https://github.com/IntersectMBO/cardano-node", members: 3_200 },
    ],
    monthlyMessages: 180_000,
    foundationScore: 90,
    useCaseScore: 78,
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    nameKo: "도지코인",
    isStablecoin: false,
    network: "Dogecoin",
    foundation: {
      name: "Dogecoin Foundation",
      homepage: "https://foundation.dogecoin.com",
      description:
        "2014년 설립 후 휴면 상태였다가 2021년 재출범한 비영리 재단으로, 코어 개발 지원과 상표 보호를 맡는다. 상근 조직 규모가 작고 자금 기반이 기부에 의존해, 대형 재단 대비 운영 지속성 근거는 상대적으로 얕다.",
    },
    whitepaper: {
      goal:
        "별도의 정식 백서 없이 라이트코인 코드를 포크해 만든 결제용 통화다. 진입장벽이 낮은 소액 팁·기부 문화를 목표로 하며, 무한 발행(연 50억 개 고정)으로 낮은 인플레이션율을 유지하도록 설계됐다.",
      useCases:
        "온라인 팁·기부·소액결제와 일부 커머스 결제 수단으로 쓰인다. 기술적 확장보다 브랜드 인지도와 커뮤니티 결속에 기반한 활용이 중심이며, 결제 게이트웨이 지원 범위는 꾸준히 늘고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/dogecoin", members: 4_100_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/dogecoin/", members: 2_400_000 },
      { platform: "GitHub", url: "https://github.com/dogecoin/dogecoin", members: 14_000 },
    ],
    monthlyMessages: 210_000,
    foundationScore: 58,
    useCaseScore: 52,
  },
  {
    symbol: "TRX",
    name: "TRON",
    nameKo: "트론",
    isStablecoin: false,
    network: "Tron(TRC-20)",
    foundation: {
      name: "TRON DAO Reserve / TRON Foundation",
      homepage: "https://trondao.org",
      description:
        "싱가포르에서 출발해 현재 DAO 체제로 전환한 조직으로, 슈퍼대표 27인이 온체인 거버넌스를 수행한다. 준비금 운용과 생태계 펀드를 공개하지만 창업자 개인 영향력이 크다는 지적이 반복적으로 제기된다.",
    },
    whitepaper: {
      goal:
        "콘텐츠 창작자가 중개 플랫폼 없이 직접 수익을 얻는 탈중앙 콘텐츠 네트워크 구축이 백서상 목표다. 위임지분증명으로 높은 처리량과 사실상 무료에 가까운 수수료를 제공하는 것을 지향한다.",
      useCases:
        "실질 활용은 스테이블코인 송금망에 집중되어 있으며, USDT 유통량의 상당 부분이 트론 네트워크에서 이동한다. 그 외 디파이, 게임, 콘텐츠 배포 디앱이 생태계를 구성한다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/trondao", members: 1_600_000 },
      { platform: "Telegram", url: "https://t.me/tronnetworkEN", members: 200_000 },
      { platform: "Discord", url: "https://discord.gg/tron-official", members: 40_000 },
      { platform: "GitHub", url: "https://github.com/tronprotocol/java-tron", members: 3_800 },
    ],
    monthlyMessages: 150_000,
    foundationScore: 66,
    useCaseScore: 80,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    nameKo: "체인링크",
    isStablecoin: false,
    network: "Ethereum(ERC-20)",
    foundation: {
      name: "Chainlink Labs / Chainlink Foundation",
      homepage: "https://chain.link",
      description:
        "오라클 네트워크 개발을 담당하는 Chainlink Labs와 생태계 보조금을 집행하는 재단이 병존한다. SWIFT, DTCC, 주요 은행과 공동 실증을 수행하며 기업 파트너십 이력이 업계에서 가장 두텁다.",
    },
    whitepaper: {
      goal:
        "스마트컨트랙트가 외부 데이터에 안전하게 접근하지 못하는 '오라클 문제' 해결이 목표다. 탈중앙 노드 네트워크가 데이터를 집계·검증해 체인 위에 전달하고, LINK로 노드 보상과 담보를 처리한다.",
      useCases:
        "디파이 가격 피드, 검증 가능한 난수(VRF), 자동화 실행, 크로스체인 전송 프로토콜(CCIP)에 쓰인다. 최근에는 전통 금융기관의 실물자산 토큰화 데이터 계층으로 채택이 늘고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/chainlink", members: 1_200_000 },
      { platform: "Discord", url: "https://discord.gg/chainlink", members: 55_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/Chainlink/", members: 130_000 },
      { platform: "GitHub", url: "https://github.com/smartcontractkit/chainlink", members: 7_300 },
    ],
    monthlyMessages: 120_000,
    foundationScore: 85,
    useCaseScore: 91,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    nameKo: "아발란체",
    isStablecoin: false,
    network: "Avalanche C-Chain",
    foundation: {
      name: "Avalanche Foundation / Ava Labs",
      homepage: "https://www.avax.network",
      description:
        "Ava Labs가 프로토콜을 개발하고 재단이 생태계 펀드를 집행한다. 기관용 서브넷 사업과 문화·금융 분야 파트너십을 지속 확대하고 있으며, 자금 집행 내역과 로드맵을 정기적으로 공개한다.",
    },
    whitepaper: {
      goal:
        "눈사태(Snow) 계열 합의 프로토콜로 1초 내 최종성과 높은 확장성을 확보하는 것이 목표다. 용도별 독립 체인(서브넷)을 무제한 생성해 각자의 규칙과 수수료 정책을 갖도록 설계했다.",
      useCases:
        "디파이, 게임, 기관용 프라이빗 서브넷, 실물자산 토큰화에 활용된다. 규제 준수가 필요한 금융기관이 허가형 체인을 별도로 구성할 수 있다는 점이 주요 채택 요인이다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/avax", members: 1_400_000 },
      { platform: "Discord", url: "https://discord.gg/avax", members: 70_000 },
      { platform: "Telegram", url: "https://t.me/avalancheavax", members: 65_000 },
      { platform: "GitHub", url: "https://github.com/ava-labs/avalanchego", members: 2_300 },
    ],
    monthlyMessages: 95_000,
    foundationScore: 83,
    useCaseScore: 82,
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    nameKo: "폴카닷",
    isStablecoin: false,
    network: "Polkadot",
    foundation: {
      name: "Web3 Foundation (웹3 재단)",
      homepage: "https://web3.foundation",
      description:
        "스위스 추크의 비영리 재단으로 탈중앙 웹 기술 연구와 보조금을 담당한다. Parity Technologies가 구현을 맡으며, 국고 지출 전 과정을 온체인 거버넌스(OpenGov)로 공개 집행한다는 점이 특징이다.",
    },
    whitepaper: {
      goal:
        "서로 다른 블록체인이 신뢰 없이 메시지와 자산을 주고받는 이종 체인 상호운용 네트워크 구축이 목표다. 중계 체인이 공유 보안을 제공하고, 파라체인이 각자의 용도에 맞게 병렬 실행된다.",
      useCases:
        "파라체인 기반 디파이, 신원, 게임, 기업용 프라이빗 체인 구축에 쓰인다. JAM 업그레이드를 통해 범용 연산 계층으로 확장하려는 로드맵을 추진 중이다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Polkadot", members: 1_800_000 },
      { platform: "Discord", url: "https://discord.gg/polkadot", members: 55_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/Polkadot/", members: 90_000 },
      { platform: "GitHub", url: "https://github.com/paritytech/polkadot-sdk", members: 2_100 },
    ],
    monthlyMessages: 85_000,
    foundationScore: 89,
    useCaseScore: 76,
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    nameKo: "라이트코인",
    isStablecoin: false,
    network: "Litecoin",
    foundation: {
      name: "Litecoin Foundation",
      homepage: "https://litecoin.org",
      description:
        "2017년 싱가포르에 설립된 비영리 재단으로 창시자 찰리 리가 이사로 참여한다. 연간 재무보고서를 공개하고 결제 가맹점 확대와 코어 개발 후원을 지속해 왔으며, 14년 이상 무중단 가동 이력을 보유한다.",
    },
    whitepaper: {
      goal:
        "비트코인을 포크해 블록 생성 주기를 2.5분으로 단축하고 스크립트 해시 알고리즘을 채택했다. '은(silver)에 해당하는 결제용 통화'로서 빠르고 저렴한 일상 결제를 처리하는 것이 목표다.",
      useCases:
        "소액 결제와 거래소 간 저비용 송금이 주된 용도다. 밈블윔블 확장 블록으로 선택적 익명 전송을 지원하며, 결제 게이트웨이와 직불카드 연동에서 오랜 채택 실적을 갖고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/litecoin", members: 1_300_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/litecoin/", members: 450_000 },
      { platform: "Telegram", url: "https://t.me/litecoin", members: 30_000 },
      { platform: "GitHub", url: "https://github.com/litecoin-project/litecoin", members: 4_600 },
    ],
    monthlyMessages: 70_000,
    foundationScore: 76,
    useCaseScore: 70,
  },
  {
    symbol: "BCH",
    name: "Bitcoin Cash",
    nameKo: "비트코인캐시",
    isStablecoin: false,
    network: "Bitcoin Cash",
    foundation: {
      name: "Bitcoin Cash Node 개발 그룹 (분산 조직)",
      homepage: "https://bitcoincashnode.org",
      description:
        "단일 법인 재단이 없으며 BCHN 등 복수의 독립 개발팀이 클라이언트를 유지한다. 자금은 커뮤니티 기부와 후원에 의존해 조직 안정성 근거가 상대적으로 약하지만, 연 2회 업그레이드 일정은 꾸준히 지켜지고 있다.",
    },
    whitepaper: {
      goal:
        "비트코인 백서의 '개인 간 전자화폐' 원칙을 온체인 확장으로 계승한다는 것이 목표다. 블록 크기를 32MB로 키워 수수료를 낮추고, 결제 수단으로서의 실사용성을 우선한다.",
      useCases:
        "저비용 소액 결제와 가맹점 결제가 핵심 용도다. 캐시토큰 규격으로 토큰 발행과 간단한 디파이를 지원하며, 일부 신흥국 커뮤니티 결제망에서 실사용 사례가 유지되고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/BitcoinCash", members: 200_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/btc/", members: 400_000 },
      { platform: "Telegram", url: "https://t.me/bitcoincash", members: 15_000 },
      { platform: "GitHub", url: "https://github.com/bitcoin-cash-node/bitcoin-cash-node", members: 400 },
    ],
    monthlyMessages: 40_000,
    foundationScore: 55,
    useCaseScore: 62,
  },
  {
    symbol: "ETC",
    name: "Ethereum Classic",
    nameKo: "이더리움클래식",
    isStablecoin: false,
    network: "Ethereum Classic",
    foundation: {
      name: "Ethereum Classic Cooperative (ETC Coop)",
      homepage: "https://etccooperative.org",
      description:
        "미국 비영리 법인으로 클라이언트 유지보수와 개발자 지원을 담당한다. 재무 규모가 크지 않고 상근 인력이 제한적이며, 과거 51% 공격을 수차례 겪은 이력이 있어 보안 측면의 검토가 필요하다.",
    },
    whitepaper: {
      goal:
        "'코드는 곧 법'이라는 불변성 원칙을 지키기 위해 DAO 해킹 롤백을 거부하고 원래 체인을 유지한 프로젝트다. 작업증명을 존속시켜 변경 불가능한 스마트컨트랙트 플랫폼을 제공하는 것이 목표다.",
      useCases:
        "불변성을 중시하는 스마트컨트랙트 배포와 작업증명 채굴 자산으로 활용된다. 이더리움 지분증명 전환 이후 GPU 채굴 수요를 흡수했으나, 디앱 생태계 규모는 제한적이다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/eth_classic", members: 200_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/EthereumClassic/", members: 70_000 },
      { platform: "Discord", url: "https://discord.gg/ethereumclassic", members: 8_000 },
      { platform: "GitHub", url: "https://github.com/etclabscore", members: 600 },
    ],
    monthlyMessages: 12_000,
    foundationScore: 54,
    useCaseScore: 48,
  },
  {
    symbol: "XLM",
    name: "Stellar",
    nameKo: "스텔라루멘",
    isStablecoin: false,
    network: "Stellar",
    foundation: {
      name: "Stellar Development Foundation (SDF)",
      homepage: "https://stellar.org",
      description:
        "2014년 설립된 미국 비영리 재단으로 프로토콜 개발과 금융 포용 사업을 주도한다. 보유 물량과 지출 계획을 공개하고 2019년 초과 물량을 소각했으며, UN기구·글로벌 송금사와 협업 실적이 축적되어 있다.",
    },
    whitepaper: {
      goal:
        "은행 계좌가 없는 인구까지 포함해 저비용으로 국경 간 가치 이동을 가능하게 하는 것이 목표다. 연합 비잔틴 합의로 수 초 내 정산하며, 수수료를 극히 낮게 유지하도록 설계됐다.",
      useCases:
        "해외 송금, 스테이블코인 발행 및 상환 통로(앵커), 개발도상국 원조 자금 배분에 활용된다. 최근에는 규제 준수형 실물자산 토큰화와 CBDC 시범 사업 기반으로도 채택되고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/StellarOrg", members: 700_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/Stellar/", members: 130_000 },
      { platform: "Discord", url: "https://discord.gg/stellardev", members: 25_000 },
      { platform: "GitHub", url: "https://github.com/stellar/stellar-core", members: 3_200 },
    ],
    monthlyMessages: 45_000,
    foundationScore: 88,
    useCaseScore: 79,
  },
  {
    symbol: "ATOM",
    name: "Cosmos Hub",
    nameKo: "코스모스",
    isStablecoin: false,
    network: "Cosmos Hub",
    foundation: {
      name: "Interchain Foundation (ICF)",
      homepage: "https://interchain.io",
      description:
        "스위스 비영리 재단으로 코스모스 SDK와 IBC 프로토콜 개발을 후원한다. 온체인 국고 거버넌스로 예산을 집행하며, 재단과 개발사 간 역할 조정 문제로 조직 개편을 여러 차례 겪은 이력이 있다.",
    },
    whitepaper: {
      goal:
        "독립된 주권 블록체인들이 IBC로 연결되는 '블록체인 인터넷' 구현이 목표다. 텐더민트 합의와 SDK를 제공해 누구나 목적에 맞는 체인을 손쉽게 만들 수 있도록 설계됐다.",
      useCases:
        "앱체인 구축 프레임워크로 널리 쓰이며 dYdX, Celestia 등 다수 프로젝트가 채택했다. ATOM은 허브 보안 스테이킹과 인터체인 보안 제공, 거버넌스 투표에 활용된다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/cosmoshub", members: 500_000 },
      { platform: "Discord", url: "https://discord.gg/cosmosnetwork", members: 45_000 },
      { platform: "Telegram", url: "https://t.me/cosmosproject", members: 30_000 },
      { platform: "GitHub", url: "https://github.com/cosmos/cosmos-sdk", members: 6_400 },
    ],
    monthlyMessages: 55_000,
    foundationScore: 74,
    useCaseScore: 80,
  },
  {
    symbol: "HBAR",
    name: "Hedera",
    nameKo: "헤데라",
    isStablecoin: false,
    network: "Hedera",
    foundation: {
      name: "Hedera Council / HBAR Foundation",
      homepage: "https://hedera.com",
      description:
        "구글, IBM, 도이체텔레콤 등 글로벌 기업으로 구성된 최대 39개 기관의 협의회가 거버넌스를 수행한다. 임기 제한과 공동 운영 원칙이 명문화되어 있어 기업 거버넌스 투명성이 높은 편이다.",
    },
    whitepaper: {
      goal:
        "블록체인이 아닌 해시그래프 합의를 채택해 비동기 비잔틴 내결함성과 즉시 최종성, 예측 가능한 저수수료를 제공하는 것이 목표다. 기업이 규제 환경에서 쓸 수 있는 공공 원장을 지향한다.",
      useCases:
        "탄소배출권 등록, 공급망 추적, 결제 정산, 실물자산 토큰화에 활용된다. 수수료가 달러 기준 고정이라 비용 예측이 필요한 기업 서비스에 적합하다는 점이 채택 근거로 꼽힌다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/hedera", members: 400_000 },
      { platform: "Discord", url: "https://discord.gg/hedera", members: 25_000 },
      { platform: "Telegram", url: "https://t.me/hederahashgraph", members: 20_000 },
      { platform: "GitHub", url: "https://github.com/hashgraph/hedera-services", members: 500 },
    ],
    monthlyMessages: 30_000,
    foundationScore: 91,
    useCaseScore: 81,
  },
  {
    symbol: "ALGO",
    name: "Algorand",
    nameKo: "알고랜드",
    isStablecoin: false,
    network: "Algorand",
    foundation: {
      name: "Algorand Foundation (알고랜드 재단)",
      homepage: "https://algorand.foundation",
      description:
        "싱가포르에 등록된 비영리 재단으로 토큰 유통 계획과 재무 현황을 분기별로 공개한다. MIT 실비오 미칼리 교수의 연구를 기반으로 하며, 각국 정부·중앙은행과의 공공 프로젝트 참여 실적이 있다.",
    },
    whitepaper: {
      goal:
        "탈중앙성·보안성·확장성의 트릴레마를 순수 지분증명으로 해결하는 것이 목표다. 무작위 위원회 추첨으로 블록을 생성해 포크 없는 즉시 최종성을 보장하고 저수수료를 유지한다.",
      useCases:
        "정부 발행 문서 인증, CBDC 시범, 실물자산 토큰화, 탄소중립 결제망에 활용된다. 탄소 네거티브를 표방해 ESG 요건이 있는 공공·기업 사업에서 채택되는 경우가 많다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Algorand", members: 550_000 },
      { platform: "Discord", url: "https://discord.gg/algorand", members: 30_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/AlgorandOfficial/", members: 100_000 },
      { platform: "GitHub", url: "https://github.com/algorand/go-algorand", members: 1_800 },
    ],
    monthlyMessages: 28_000,
    foundationScore: 86,
    useCaseScore: 72,
  },
  {
    symbol: "POL",
    name: "Polygon",
    nameKo: "폴리곤",
    isStablecoin: false,
    network: "Polygon PoS",
    foundation: {
      name: "Polygon Foundation / Polygon Labs",
      homepage: "https://polygon.technology",
      description:
        "인도에서 출발해 현재는 글로벌 조직으로 전환한 개발사와 재단이 생태계를 운영한다. 스타벅스·나이키·리브랜딩 등 대기업 협업 이력이 있으며, MATIC에서 POL로의 토큰 전환을 계획대로 완료했다.",
    },
    whitepaper: {
      goal:
        "이더리움의 높은 수수료와 처리 한계를 보완하는 확장 계층을 제공하는 것이 목표다. 영지식 증명 기반 롤업과 크로스체인 정산 계층(AggLayer)으로 다수 체인의 유동성을 통합하려 한다.",
      useCases:
        "대규모 소비자 서비스의 결제·NFT·로열티 프로그램에 널리 쓰인다. 기업 브랜드의 웹3 진입 경로로 채택되는 사례가 많고, 게임과 디파이 디앱 생태계도 두텁게 형성되어 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/0xPolygon", members: 2_100_000 },
      { platform: "Discord", url: "https://discord.gg/polygon", members: 75_000 },
      { platform: "Telegram", url: "https://t.me/polygonofficial", members: 45_000 },
      { platform: "GitHub", url: "https://github.com/0xPolygon", members: 2_400 },
    ],
    monthlyMessages: 90_000,
    foundationScore: 80,
    useCaseScore: 85,
  },
  {
    symbol: "NEAR",
    name: "NEAR Protocol",
    nameKo: "니어프로토콜",
    isStablecoin: false,
    network: "NEAR",
    foundation: {
      name: "NEAR Foundation",
      homepage: "https://near.foundation",
      description:
        "스위스에 등록된 비영리 재단으로 생태계 보조금과 거버넌스를 담당한다. 연차 투명성 보고서를 발간하며, 인공지능과 블록체인 결합 전략으로 방향을 재정비해 개발자 유입을 유지하고 있다.",
    },
    whitepaper: {
      goal:
        "샤딩(나이트셰이드)으로 수요에 따라 처리 용량이 늘어나는 확장형 체인을 만드는 것이 목표다. 사람이 읽을 수 있는 계정명과 가스비 대납 등 사용자 경험 개선을 핵심 설계 원칙으로 삼는다.",
      useCases:
        "체인 추상화 기반 지갑, 인공지능 에이전트 결제, 소셜·게임 디앱에 활용된다. 계정 추상화가 기본 제공되어 일반 사용자를 겨냥한 소비자용 서비스 구축에 유리하다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/NEARProtocol", members: 1_500_000 },
      { platform: "Discord", url: "https://discord.gg/nearprotocol", members: 40_000 },
      { platform: "Telegram", url: "https://t.me/cryptonear", members: 30_000 },
      { platform: "GitHub", url: "https://github.com/near/nearcore", members: 2_400 },
    ],
    monthlyMessages: 60_000,
    foundationScore: 82,
    useCaseScore: 76,
  },
  {
    symbol: "APT",
    name: "Aptos",
    nameKo: "앱토스",
    isStablecoin: false,
    network: "Aptos",
    foundation: {
      name: "Aptos Foundation",
      homepage: "https://aptosfoundation.org",
      description:
        "메타의 디엠(리브라) 개발진이 설립한 재단으로 미국·싱가포르를 거점으로 한다. 토큰 배분 계획과 생태계 보조금 집행 내역을 공개하며, 대형 벤처캐피털의 초기 투자로 재무 기반이 비교적 탄탄하다.",
    },
    whitepaper: {
      goal:
        "Move 언어와 병렬 실행 엔진(Block-STM)으로 안전성과 처리 성능을 동시에 확보하는 것이 목표다. 자산의 소유권을 언어 차원에서 보장해 스마트컨트랙트 취약점을 구조적으로 줄이고자 한다.",
      useCases:
        "결제, 디파이, 게임과 대규모 사용자 대상 소비자 서비스에 활용된다. 아시아권 결제 기업 및 실물자산 토큰화 파트너십을 확대하며 기관용 인프라로 자리를 넓히고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Aptos", members: 900_000 },
      { platform: "Discord", url: "https://discord.gg/aptosnetwork", members: 60_000 },
      { platform: "Telegram", url: "https://t.me/aptos_official", members: 25_000 },
      { platform: "GitHub", url: "https://github.com/aptos-labs/aptos-core", members: 6_100 },
    ],
    monthlyMessages: 50_000,
    foundationScore: 79,
    useCaseScore: 74,
  },
  {
    symbol: "SUI",
    name: "Sui",
    nameKo: "수이",
    isStablecoin: false,
    network: "Sui",
    foundation: {
      name: "Sui Foundation",
      homepage: "https://sui.io",
      description:
        "Mysten Labs가 개발하고 재단이 생태계 지원과 검증인 분산화를 담당한다. 토큰 언락 일정과 보조금 프로그램을 공개하며, 게임·소비자 앱 중심의 파트너십 확보에 집중하고 있다.",
    },
    whitepaper: {
      goal:
        "객체 중심 데이터 모델로 서로 의존하지 않는 거래를 병렬 처리해 지연 없는 확장성을 달성하는 것이 목표다. 단순 전송은 합의를 우회해 즉시 처리하도록 설계된 점이 특징이다.",
      useCases:
        "게임, NFT, 소셜 애플리케이션과 고빈도 디파이에 활용된다. zkLogin으로 기존 소셜 계정 로그인을 지원해 지갑 진입장벽을 낮춘 소비자용 서비스 구축에 강점이 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/SuiNetwork", members: 1_000_000 },
      { platform: "Discord", url: "https://discord.gg/sui", members: 90_000 },
      { platform: "Telegram", url: "https://t.me/sui_network", members: 40_000 },
      { platform: "GitHub", url: "https://github.com/MystenLabs/sui", members: 6_500 },
    ],
    monthlyMessages: 70_000,
    foundationScore: 78,
    useCaseScore: 75,
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    nameKo: "아비트럼",
    isStablecoin: false,
    network: "Arbitrum One",
    foundation: {
      name: "Arbitrum Foundation / Offchain Labs",
      homepage: "https://arbitrum.foundation",
      description:
        "케이맨 제도에 설립된 재단이 DAO 결정을 집행하고 Offchain Labs가 기술을 개발한다. 국고 규모가 크고 지출이 온체인 투표로 통제되지만, 초기 거버넌스 논란 이후 절차 정비를 거쳤다.",
    },
    whitepaper: {
      goal:
        "낙관적 롤업으로 이더리움의 보안을 상속하면서 실행을 오프체인으로 옮겨 수수료를 크게 낮추는 것이 목표다. 다자간 사기 증명으로 분쟁 비용을 최소화하는 구조를 채택했다.",
      useCases:
        "레이어2 디파이의 최대 유동성 거점으로 파생상품·대출·탈중앙거래소가 집중되어 있다. Orbit 체인으로 게임·기업 전용 체인을 파생시키는 사업도 확대되고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/arbitrum", members: 1_100_000 },
      { platform: "Discord", url: "https://discord.gg/arbitrum", members: 250_000 },
      { platform: "Telegram", url: "https://t.me/arbitrum", members: 30_000 },
      { platform: "GitHub", url: "https://github.com/OffchainLabs/nitro", members: 800 },
    ],
    monthlyMessages: 65_000,
    foundationScore: 77,
    useCaseScore: 83,
  },
  {
    symbol: "OP",
    name: "Optimism",
    nameKo: "옵티미즘",
    isStablecoin: false,
    network: "OP Mainnet",
    foundation: {
      name: "Optimism Foundation",
      homepage: "https://www.optimism.io",
      description:
        "토큰 하우스와 시티즌 하우스로 구성된 이원 거버넌스를 운영하는 재단이다. 공공재 금융(RetroPGF)을 통해 생태계 기여자에게 자금을 재분배하는 실험을 매 시즌 공개적으로 집행해 왔다.",
    },
    whitepaper: {
      goal:
        "OP 스택이라는 공용 오픈소스 규격으로 누구나 롤업을 만들 수 있게 하고, 이들이 보안과 통신을 공유하는 슈퍼체인을 구성하는 것이 목표다. 공공재 자금 조달을 프로토콜 차원에 내재화한다.",
      useCases:
        "코인베이스 Base, 월드체인 등 주요 체인이 OP 스택으로 구축되어 있다. 디파이와 소비자 앱의 저비용 실행 계층이자 슈퍼체인 거버넌스 참여 수단으로 활용된다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Optimism", members: 1_000_000 },
      { platform: "Discord", url: "https://discord.gg/optimism", members: 90_000 },
      { platform: "GitHub", url: "https://github.com/ethereum-optimism/optimism", members: 1_400 },
    ],
    monthlyMessages: 48_000,
    foundationScore: 81,
    useCaseScore: 80,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    nameKo: "유니스왑",
    isStablecoin: false,
    network: "Ethereum(ERC-20)",
    foundation: {
      name: "Uniswap Foundation / Uniswap Labs",
      homepage: "https://www.uniswapfoundation.org",
      description:
        "프로토콜 거버넌스를 지원하는 비영리 재단과 인터페이스를 운영하는 Uniswap Labs가 분리되어 있다. 재단은 보조금 집행 내역을 공개하며, 거래 수수료 배분을 둘러싼 거버넌스 논의가 장기간 이어지고 있다.",
    },
    whitepaper: {
      goal:
        "호가창 없이 자동화된 시장조성 수식(x*y=k)만으로 누구나 유동성을 공급하고 토큰을 교환할 수 있게 하는 것이 목표다. 허가 없는 상장과 무신뢰 거래를 표준화했다.",
      useCases:
        "탈중앙거래소 유동성 공급과 토큰 교환의 사실상 표준으로 쓰인다. v4 훅으로 맞춤형 유동성 전략을 구성할 수 있으며, UNI는 프로토콜 거버넌스 투표권으로 기능한다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Uniswap", members: 1_300_000 },
      { platform: "Discord", url: "https://discord.gg/uniswap", members: 80_000 },
      { platform: "Reddit", url: "https://www.reddit.com/r/Uniswap/", members: 90_000 },
      { platform: "GitHub", url: "https://github.com/Uniswap", members: 5_600 },
    ],
    monthlyMessages: 55_000,
    foundationScore: 76,
    useCaseScore: 84,
  },
  {
    symbol: "AAVE",
    name: "Aave",
    nameKo: "에이브",
    isStablecoin: false,
    network: "Ethereum(ERC-20)",
    foundation: {
      name: "Aave DAO / Aave Labs",
      homepage: "https://aave.com",
      description:
        "온체인 DAO가 프로토콜 파라미터와 국고를 직접 통제하고 Aave Labs가 개발을 수행한다. 다수의 외부 감사와 버그바운티를 상시 운영하며, 대형 사고 없이 장기간 예치 자산을 관리해 온 이력이 있다.",
    },
    whitepaper: {
      goal:
        "중개 기관 없이 알고리즘이 정한 금리로 자산을 예치·대출할 수 있는 유동성 프로토콜을 만드는 것이 목표다. 과담보 방식과 청산 메커니즘으로 상환 불능 위험을 통제한다.",
      useCases:
        "디파이 대출·차입, 이자 농사, 담보 기반 레버리지에 활용된다. 자체 스테이블코인 GHO를 발행하고, 기관용 허가형 시장을 별도로 운영해 규제 요건이 있는 참여자도 수용한다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/aave", members: 600_000 },
      { platform: "Discord", url: "https://discord.gg/aave", members: 30_000 },
      { platform: "Telegram", url: "https://t.me/Aavesome", members: 15_000 },
      { platform: "GitHub", url: "https://github.com/aave", members: 3_500 },
    ],
    monthlyMessages: 32_000,
    foundationScore: 80,
    useCaseScore: 82,
  },
  {
    symbol: "SAND",
    name: "The Sandbox",
    nameKo: "샌드박스",
    isStablecoin: false,
    network: "Ethereum(ERC-20)",
    foundation: {
      name: "Sandbox / Animoca Brands 계열",
      homepage: "https://www.sandbox.game",
      description:
        "홍콩 애니모카 브랜즈 산하 법인이 운영하는 영리 기업 구조로, 별도의 독립 재단은 없다. 대형 지식재산권 제휴 실적은 풍부하나 메타버스 수요 둔화로 사업 지속성에 대한 검증이 필요한 단계다.",
    },
    whitepaper: {
      goal:
        "이용자가 직접 제작한 복셀 콘텐츠와 게임을 소유하고 거래하는 탈중앙 메타버스 플랫폼 구축이 목표다. 창작물의 소유권을 NFT로 보장하고 SAND를 플랫폼 기축 통화로 사용한다.",
      useCases:
        "가상 토지 거래, 게임 제작·플레이 보상, 브랜드 마케팅 공간 운영에 쓰인다. 국내외 엔터테인먼트 지식재산권과 결합한 캠페인 사례가 다수 존재한다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/TheSandboxGame", members: 1_100_000 },
      { platform: "Discord", url: "https://discord.gg/thesandbox", members: 200_000 },
      { platform: "Telegram", url: "https://t.me/sandboxgame", members: 40_000 },
    ],
    monthlyMessages: 40_000,
    foundationScore: 58,
    useCaseScore: 58,
  },
  {
    symbol: "IMX",
    name: "Immutable",
    nameKo: "이뮤터블엑스",
    isStablecoin: false,
    network: "Ethereum(ERC-20)",
    foundation: {
      name: "Immutable Pty Ltd",
      homepage: "https://www.immutable.com",
      description:
        "호주 시드니에 본사를 둔 영리 기업이 개발과 생태계 운영을 함께 담당한다. 상장 게임사와의 파트너십이 활발하고 자금 조달 이력이 명확하나, 비영리 재단 형태의 견제 구조는 갖추고 있지 않다.",
    },
    whitepaper: {
      goal:
        "영지식 롤업으로 NFT 발행과 거래의 가스비를 없애 게임에 적합한 확장성을 제공하는 것이 목표다. 이더리움 보안을 유지하면서 게임사가 대규모 이용자를 수용할 수 있게 한다.",
      useCases:
        "웹3 게임의 아이템 발행·거래와 게임 전용 체인 구축에 활용된다. IMX는 거래 수수료 지불과 스테이킹, 거버넌스에 사용되며 게임 퍼블리싱 생태계의 기축 토큰 역할을 한다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Immutable", members: 400_000 },
      { platform: "Discord", url: "https://discord.gg/immutable", members: 90_000 },
      { platform: "Telegram", url: "https://t.me/immutablex", members: 20_000 },
      { platform: "GitHub", url: "https://github.com/immutable", members: 400 },
    ],
    monthlyMessages: 25_000,
    foundationScore: 62,
    useCaseScore: 68,
  },
  {
    symbol: "STX",
    name: "Stacks",
    nameKo: "스택스",
    isStablecoin: false,
    network: "Stacks",
    foundation: {
      name: "Stacks Foundation",
      homepage: "https://stacks.org",
      description:
        "비영리 재단이 생태계 보조금과 탈중앙화 로드맵을 관리한다. 미국 증권거래위원회에 Reg A+ 방식으로 토큰을 등록한 최초 사례로 규제 대응 이력이 명확하며, 개발 조직과 재단이 분리되어 있다.",
    },
    whitepaper: {
      goal:
        "비트코인의 보안과 자본을 그대로 활용하는 스마트컨트랙트 계층을 만드는 것이 목표다. 전송증명 합의로 비트코인 블록에 상태를 고정하고, Clarity 언어로 예측 가능한 계약 실행을 보장한다.",
      useCases:
        "비트코인 기반 디파이, 대출, NFT에 활용된다. sBTC로 비트코인을 신뢰 최소화 방식으로 옮겨 운용할 수 있어, 비트코인 보유자의 수익 창출 수단으로 주목받고 있다.",
    },
    sns: [
      { platform: "X", url: "https://x.com/Stacks", members: 300_000 },
      { platform: "Discord", url: "https://discord.gg/stacks", members: 25_000 },
      { platform: "GitHub", url: "https://github.com/stacks-network/stacks-core", members: 3_100 },
    ],
    monthlyMessages: 18_000,
    foundationScore: 75,
    useCaseScore: 70,
  },
];
