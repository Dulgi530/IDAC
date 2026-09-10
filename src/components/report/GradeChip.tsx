import type { Grade } from "@/lib/evaluation/types";

/** 등급별 색. A(안정) → E(주의) 로 갈수록 따뜻한 색을 쓴다. */
const GRADE_STYLE: Record<Grade, string> = {
  A: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 print:text-emerald-800",
  B: "bg-sky-500/15 text-sky-300 border-sky-500/30 print:text-sky-800",
  C: "bg-amber-500/15 text-amber-300 border-amber-500/30 print:text-amber-800",
  D: "bg-orange-500/15 text-orange-300 border-orange-500/30 print:text-orange-800",
  E: "bg-rose-500/15 text-rose-300 border-rose-500/30 print:text-rose-800",
};

/** 표 안에서 등급을 한 글자로 보여주는 배지. */
export function GradeChip({ grade }: { grade: Grade | null | undefined }) {
  if (!grade) return <span className="text-neutral-500">—</span>;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold leading-none ${GRADE_STYLE[grade]}`}
    >
      {grade}
    </span>
  );
}
