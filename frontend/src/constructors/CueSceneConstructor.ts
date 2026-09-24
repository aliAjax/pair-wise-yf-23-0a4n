import type { CueScene } from "../types/CueScene";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 0,
  name: "",
  fixture_states: {},
  fade_in_ms: 1000,
  hold_ms: 3000,
  priority: 10,
  scene_status: "DRAFT",
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
