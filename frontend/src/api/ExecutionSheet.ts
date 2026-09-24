import { listFixture } from "./Fixture";
import { listCueScene } from "./CueScene";
import { listTimelineTrack } from "./TimelineTrack";
import { listShowProject } from "./ShowProject";
import { readLocal, writeLocal } from "../utils/localStore";
import { parseFixtureStates } from "../utils/sceneStates";
import { checkSceneConflicts, dmxRangeOf } from "../utils/dmxConflicts";
import { sceneEntryFingerprint } from "../utils/fingerprint";
import { createExecutionSheet, createSheetEntry, createSheetFixtureLine } from "../constructors/ExecutionSheetConstructor";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ExecutionSheet, SheetEntry } from "../types/ExecutionSheet";
import type { Fixture } from "../types/Fixture";
import type { TimelineTrack } from "../types/TimelineTrack";

const endpoint = "/api/execution-sheet";
const STORAGE_KEY = "stage-light.execution-sheets";

const readSheets = (): Record<string, ExecutionSheet> => readLocal(STORAGE_KEY, {});
const writeSheets = (sheets: Record<string, ExecutionSheet>) => writeLocal(STORAGE_KEY, sheets);

export async function listExecutionSheet(): Promise<ExecutionSheet[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return Object.values(readSheets());
}

export interface GenerationResult {
  sheet: ExecutionSheet;
  reusedTrackIds: number[];
  recomputedTrackIds: number[];
}

export async function generateExecutionSheet(projectId: number): Promise<GenerationResult> {
  const [projects, fixtures, scenes, tracks] = await Promise.all([
    listShowProject(),
    listFixture(),
    listCueScene(),
    listTimelineTrack()
  ]);
  const project = projects.find((row) => row.id === projectId);
  if (!project) throw new Error(ERROR_MESSAGES.VALIDATION_FAILED);

  const sheets = readSheets();
  const previous = sheets[String(projectId)];
  const projectTracks = project.track_ids
    .map((id) => tracks.find((track) => track.id === id))
    .filter((track): track is TimelineTrack => Boolean(track))
    .sort((a, b) => Number(a.start_ms) - Number(b.start_ms));

  const reusedTrackIds: number[] = [];
  const recomputedTrackIds: number[] = [];
  const generatedAt = new Date().toISOString();

  const entries: SheetEntry[] = projectTracks.map((track, index) => {
    const scene = scenes.find((row) => row.id === track.cue_scene_id);
    if (!scene) {
      recomputedTrackIds.push(track.id);
      return createSheetEntry({
        track_id: track.id,
        scene_id: track.cue_scene_id,
        scene_name: `未知场景 #${track.cue_scene_id}`,
        scene_status: "DISABLED",
        order: index + 1,
        start_ms: Number(track.start_ms) || 0,
        duration_ms: Number(track.duration_ms) || 0,
        fingerprint: "",
        check_status: "CONFLICT",
        conflicts: [{
          code: "SCENE_NOT_FOUND",
          message: ERROR_MESSAGES.SCENE_NOT_FOUND,
          scene_id: track.cue_scene_id,
          fixture_ids: [],
          detail: `轨道 #${track.id} 引用的场景 #${track.cue_scene_id} 不存在`
        }],
        generated_at: generatedAt
      });
    }

    const states = parseFixtureStates(scene.fixture_states);
    const participating: Fixture[] = [];
    const missingFixtureIds: number[] = [];
    for (const fixtureId of Object.keys(states).map(Number)) {
      const fixture = fixtures.find((row) => row.id === fixtureId);
      if (fixture) participating.push(fixture);
      else missingFixtureIds.push(fixtureId);
    }

    const fingerprint = sceneEntryFingerprint(track, scene, participating);
    const previousEntry = previous?.entries.find((entry) => entry.track_id === track.id);
    if (previousEntry && previousEntry.fingerprint === fingerprint) {
      // 输入未变化：已生成的场次条目保持原样，不参与重算。
      reusedTrackIds.push(track.id);
      return previousEntry;
    }

    recomputedTrackIds.push(track.id);
    const conflicts = checkSceneConflicts(scene.id, participating, missingFixtureIds);
    return createSheetEntry({
      track_id: track.id,
      scene_id: scene.id,
      scene_name: scene.name,
      scene_status: scene.scene_status,
      order: index + 1,
      start_ms: Number(track.start_ms) || 0,
      duration_ms: Number(track.duration_ms) || 0,
      fingerprint,
      check_status: conflicts.length > 0 ? "CONFLICT" : "OK",
      conflicts,
      fixtures: participating.map((fixture) => {
        const range = dmxRangeOf(fixture);
        return createSheetFixtureLine({
          fixture_id: fixture.id,
          fixture_code: fixture.fixture_code,
          dmx_start: range.start,
          channel_count: Math.max(1, Number(fixture.channel_count) || 1),
          dmx_end: range.end,
          brightness: states[fixture.id] ?? 0
        });
      }),
      generated_at: generatedAt
    });
  });

  const sheet = createExecutionSheet({
    id: `sheet-${project.id}`,
    project_id: project.id,
    project_title: project.title,
    venue_name: project.venue_name,
    sheet_status: entries.some((entry) => entry.check_status === "CONFLICT") ? "FAILED" : "READY",
    generation: (previous?.generation ?? 0) + 1,
    entries,
    generated_at: generatedAt
  });

  sheets[String(project.id)] = sheet;
  writeSheets(sheets);

  const conflictCount = entries.reduce((sum, entry) => sum + entry.conflicts.length, 0);
  console.info(LOG_TEMPLATES.ExecutionSheet[reusedTrackIds.length > 0 ? 1 : 0], {
    projectId: project.id,
    generation: sheet.generation,
    recomputed: recomputedTrackIds.length,
    reused: reusedTrackIds.length
  });
  if (conflictCount > 0) console.warn(LOG_TEMPLATES.ExecutionSheet[2], { projectId: project.id, conflictCount });

  return { sheet, reusedTrackIds, recomputedTrackIds };
}

export async function saveExecutionSheet(payload: ExecutionSheet) {
  const sheets = readSheets();
  sheets[String(payload.project_id)] = payload;
  writeSheets(sheets);
  console.info(LOG_TEMPLATES.ExecutionSheet[3], payload);
  return payload;
}
