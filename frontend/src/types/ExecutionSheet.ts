export type ExecutionConflictCode =
  | "PROJECT_NOT_FOUND"
  | "DMX_OVERLAP"
  | "DISABLED_FIXTURE"
  | "MISSING_FIXTURE"
  | "FIXTURE_NOT_IN_SHOW"
  | "DUPLICATE_FIXTURE_STATE"
  | "MISSING_SCENE"
  | "SCENE_NOT_READY"
  | "TRACK_NOT_IN_SHOW"
  | "DUPLICATE_TRACK"
  | "INVALID_DMX_RANGE"
  | "INVALID_BRIGHTNESS";

export interface ExecutionConflict {
  code: ExecutionConflictCode;
  scope: "PROJECT" | "TRACK" | "CUE" | "FIXTURE";
  track_id?: number;
  cue_id?: number;
  fixture_id?: number;
  fixture_a_id?: number;
  fixture_b_id?: number;
  cue_ids?: number[];
  track_ids?: number[];
  message: string;
}

export interface ExecutionFixtureRow {
  fixture_id: number;
  fixture_code: string;
  fixture_type: string;
  dmx_address: number;
  channel_count: number;
  dmx_end_address: number;
  brightness_percent: number;
  dmx_brightness: number;
  color: string;
  active: boolean;
}

export interface ExecutionCueSheet {
  sequence: number;
  track_id: number;
  cue_id: number;
  cue_name: string;
  start_ms: number;
  duration_ms: number;
  fade_in_ms: number;
  hold_ms: number;
  priority: number;
  layer: number;
  fixture_fingerprints: Record<string, string>;
  scene_fingerprint: string;
  track_fingerprint: string;
  fixture_rows: ExecutionFixtureRow[];
}

export interface ExecutionDependencySnapshot {
  project_fingerprint: string;
  project_fixture_ids: number[];
  track_fingerprints: Record<string, string>;
  scene_fingerprints: Record<string, string>;
  fixture_fingerprints: Record<string, string>;
}

export interface ExecutionSheet {
  id: number;
  show_project_id: number;
  version: number;
  generated_at: string;
  trigger: "INITIAL" | "INCREMENTAL" | "FORCED";
  source_fingerprint: string;
  dependency_snapshot: ExecutionDependencySnapshot;
  changed_track_ids: number[];
  recalculated_cue_ids: number[];
  cue_sheets: ExecutionCueSheet[];
}

export interface ExecutionFailure {
  show_project_id: number;
  attempted_at: string;
  can_retry: boolean;
  conflicts: ExecutionConflict[];
  attempted_cue_sheets: ExecutionCueSheet[];
}

export interface ExecutionDataBundle {
  fixtures: import("./Fixture").Fixture[];
  cueScenes: import("./CueScene").CueScene[];
  timelineTracks: import("./TimelineTrack").TimelineTrack[];
  showProjects: import("./ShowProject").ShowProject[];
}

export type ExecutionGenerateResult =
  | { ok: true; sheet: ExecutionSheet; recalculatedCueIds: number[]; existingSheetKept: boolean }
  | { ok: false; failure: ExecutionFailure };
