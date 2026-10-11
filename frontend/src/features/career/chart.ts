export function recommendationAxisMaximum(confidences: number[]) {
  const highestPercent = Math.max(0, ...confidences.map((value) => value * 100));
  if (highestPercent === 0) return 0.1;
  const roundedWithHeadroom = Math.ceil((highestPercent * 1.2) / 5) * 5;
  return Math.min(100, Math.max(10, roundedWithHeadroom)) / 100;
}

export function formatPercentFraction(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatChartTimestamp(value: number) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTooltipTimestamp(value: number) {
  return new Date(value).toLocaleString();
}
