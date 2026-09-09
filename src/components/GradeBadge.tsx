import type { Grade } from "@/lib/evaluation/types";

/** A~E 등급을 색상과 함께 표시한다. */
export function GradeBadge({ grade }: { grade: Grade }) {
  return <span className={`grade grade-${grade}`}>{grade}</span>;
}
