export const SheetStatus = ["READY","FAILED"] as const;
export type SheetStatus = (typeof SheetStatus)[number];
