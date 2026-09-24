import type { CueStatus } from "./CueStatus";

export interface FixtureStateValue {
  brightness: number;
  color?: string;
}

export type FixtureStates = Record<string, FixtureStateValue>;

export interface CueScene {
  id: number;
  name: string;
  fixture_states: FixtureStates;
  fade_in_ms: number;
  hold_ms: number;
  priority: number;
  scene_status: CueStatus;
}
