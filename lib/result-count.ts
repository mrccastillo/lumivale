// Keep the surrounding copy intact, including currencies, ranges and K/M/+ suffixes.
export function formatResultCount(value: string, progress: number): string {
  if (progress >= 1) return value;
  return value.replace(/\d[\d,]*(?:\.\d+)?/g, (number) => {
    const target = Number(number.replaceAll(",", ""));
    if (!Number.isFinite(target)) return number;
    const decimals = number.split(".")[1]?.length ?? 0;
    if (decimals > 20) return number;
    return (target * Math.max(0, progress)).toLocaleString("en-US", {
      useGrouping: number.includes(","),
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  });
}
