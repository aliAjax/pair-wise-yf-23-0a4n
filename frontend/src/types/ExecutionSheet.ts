import type { SheetStatus } from "./SheetStatus";

export type SheetEntryCheckStatus = "OK" | "CONFLICT";

export interface SheetFixtureLine {
  fixture_id: number;
  fixture_code: string;
  dmx_start: number;
  channel_count: number;
  dmx_end: number;
  brightness: number;
}

export interface SheetConflict {
  code: string;
  message: string;
  scene_id: number;
  fixture_ids: number[];
  detail: string;
}

export interface SheetEntry {
  track_id: number;
  scene_id: number;
  scene_name: string;
  scene_status: string;
  order: number;
  start_ms: number;
  duration_ms: number;
  fingerprint: string;
  check_status: SheetEntryCheckStatus;
  conflicts: SheetConflict[];
  fixtures: SheetFixtureLine[];
  generated_at: string;
}

export interface ExecutionSheet {
  id: string;
  project_id: number;
  project_title: string;
  venue_name: string;
  sheet_status: SheetStatus;
  generation: number;
  entries: SheetEntry[];
  generated_at: string;
}
