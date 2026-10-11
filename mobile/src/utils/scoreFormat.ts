/** Recommendation confidence is a classifier probability in the API's verified 0..1 range. */
export function modelConfidencePercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value * 100));
}

export function formatModelConfidence(value: number): string {
  const percent = modelConfidencePercent(value);
  return `${percent.toFixed(percent < 10 ? 1 : 0)}%`;
}

/** Resume analysis scores are returned by the API on a 0..100 scale. */
export function formatResumeScore(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}/100`;
}
