import type { CueScene } from "../types/CueScene";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 0,
  name: "新场景",
  fixture_states: "{}",
  fade_in_ms: "1000",
  hold_ms: "0",
  priority: "1",
  scene_status: "DRAFT",
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
