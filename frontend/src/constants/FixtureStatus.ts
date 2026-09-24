export const FixtureStatus = ["ACTIVE","DISABLED","MAINTENANCE"] as const;
export type FixtureStatus = (typeof FixtureStatus)[number];
export const FixtureStatusText: Record<FixtureStatus, string> = Object.fromEntries(FixtureStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<FixtureStatus, string>;
