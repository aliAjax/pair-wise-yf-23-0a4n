export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatDmxRange = (start: number, count: number) => {
  const safeStart = Math.max(1, Math.round(start));
  const safeCount = Math.max(1, Math.round(count));
  return `DMX ${safeStart}–${safeStart + safeCount - 1}`;
};
export const formatBrightness = (value: number) => `${Math.round(value)}%`;
export const formatMsToClock = (ms: number) => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};
