export const SheetStatus = ["READY","FAILED"] as const;
export type SheetStatus = (typeof SheetStatus)[number];
export const SheetStatusText: Record<SheetStatus, string> = Object.fromEntries(SheetStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<SheetStatus, string>;
