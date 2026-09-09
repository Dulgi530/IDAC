import { DOMESTIC_EXCHANGES, DOMESTIC_EXCHANGE_LABEL, type ListingMap } from "@/lib/evaluation/types";

/** 국내 5대 거래소 상장 현황을 칩으로 표시한다. 상장된 거래소만 강조한다. */
export function ExchangeChips({ listings }: { listings: ListingMap }) {
  return (
    <>
      {DOMESTIC_EXCHANGES.filter((exchange) => listings[exchange]).map((exchange) => (
        <span key={exchange} className="chip on">
          {DOMESTIC_EXCHANGE_LABEL[exchange]}
        </span>
      ))}
    </>
  );
}
