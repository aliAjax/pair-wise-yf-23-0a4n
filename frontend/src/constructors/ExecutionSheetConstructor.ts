import type { ExecutionSheet, SheetEntry, SheetFixtureLine } from "../types/ExecutionSheet";

export const createSheetFixtureLine = (overrides: Partial<SheetFixtureLine> = {}): SheetFixtureLine => ({
  fixture_id: 0,
  fixture_code: "",
  dmx_start: 1,
  channel_count: 1,
  dmx_end: 1,
  brightness: 0,
  ...overrides
});

export const createSheetEntry = (overrides: Partial<SheetEntry> = {}): SheetEntry => ({
  track_id: 0,
  scene_id: 0,
  scene_name: "",
  scene_status: "DRAFT",
  order: 0,
  start_ms: 0,
  duration_ms: 0,
  fingerprint: "",
  check_status: "OK",
  conflicts: [],
  fixtures: [],
  generated_at: "",
  ...overrides
});

export const createExecutionSheet = (overrides: Partial<ExecutionSheet> = {}): ExecutionSheet => ({
  id: "",
  project_id: 0,
  project_title: "",
  venue_name: "",
  sheet_status: "READY",
  generation: 0,
  entries: [],
  generated_at: "",
  ...overrides
});

export const createExecutionSheetForm = createExecutionSheet;
export const createExecutionSheetResponse = createExecutionSheet;
