export const FixtureStatus = ["ACTIVE","DISABLED","MAINTENANCE"] as const;
export type FixtureStatus = (typeof FixtureStatus)[number];
