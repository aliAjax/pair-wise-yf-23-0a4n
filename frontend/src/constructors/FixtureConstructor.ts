import type { Fixture } from "../types/Fixture";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 0,
  fixture_code: "",
  fixture_type: "SPOT",
  position_x: 50,
  position_y: 50,
  dmx_address: 1,
  channel_count: 4,
  color_mode: "RGB",
  active: true,
  ...overrides
});

export const createFixtureForm = createDefaultFixture;
export const createFixtureResponse = createDefaultFixture;
