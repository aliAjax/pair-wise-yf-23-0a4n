import type { ExecutionFailure, ExecutionSheet } from "../types/ExecutionSheet";

export function createExecutionFailure(
  showProjectId: number,
  conflicts: ExecutionFailure["conflicts"],
  attemptedCueSheets: ExecutionFailure["attempted_cue_sheets"] = []
): ExecutionFailure {
  return {
    show_project_id: showProjectId,
    attempted_at: new Date().toISOString(),
    can_retry: true,
    conflicts,
    attempted_cue_sheets: attemptedCueSheets
  };
}

export function createEmptyExecutionSheet(overrides: Partial<ExecutionSheet> = {}): ExecutionSheet {
  return {
    id: 0,
    show_project_id: 0,
    version: 1,
    generated_at: new Date().toISOString(),
    trigger: "INITIAL",
    source_fingerprint: "",
    dependency_snapshot: {
      project_fingerprint: "",
      project_fixture_ids: [],
      track_fingerprints: {},
      scene_fingerprints: {},
      fixture_fingerprints: {}
    },
    changed_track_ids: [],
    recalculated_cue_ids: [],
    cue_sheets: [],
    ...overrides
  };
}
