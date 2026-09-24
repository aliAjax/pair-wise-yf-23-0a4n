export const formatDate = (value: string) => new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
}).format(new Date(value));

export const formatStatus = (value: string) =>
  ({ READY: "就绪", DRAFT: "草稿", DISABLED: "停用", ARCHIVED: "归档" }[value] ?? value.replace(/_/g, " "));

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 100) / 10;
  return `${totalSeconds.toFixed(1)}s`;
};

export const formatClock = (ms: number) => {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
};

export const formatPercent = (value: number) => `${Math.round(value)}%`;

export const formatDmxRange = (start: number, end: number) => `${start}–${end}`;
