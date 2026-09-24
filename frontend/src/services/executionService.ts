import { EXECUTION_CONFLICT_TEXT } from "../constants/ExecutionConflict";
import { createEmptyExecutionSheet, createExecutionFailure } from "../constructors/ExecutionSheetConstructor";
import type { CueScene } from "../types/CueScene";
import type {
  ExecutionConflict,
  ExecutionCueSheet,
  ExecutionDataBundle,
  ExecutionFailure,
  ExecutionFixtureRow,
  ExecutionGenerateResult,
  ExecutionSheet
} from "../types/ExecutionSheet";
import type { Fixture } from "../types/Fixture";
import type { ShowProject } from "../types/ShowProject";
import type { TimelineTrack } from "../types/TimelineTrack";
import { stableFingerprint } from "../utils/fingerprint";

const MAX_DMX = 512;

export function fixtureFingerprint(fixture: Fixture) {
  return stableFingerprint({
    id: fixture.id,
    code: fixture.fixture_code,
    type: fixture.fixture_type,
    dmx_address: fixture.dmx_address,
    channel_count: fixture.channel_count,
    color_mode: fixture.color_mode,
    active: fixture.active
  });
}

export function sceneStateFingerprint(cue: CueScene) {
  return stableFingerprint({
    id: cue.id,
    states: Object.fromEntries(Object.entries(cue.fixture_states).sort(([a], [b]) => a.localeCompare(b)))
  });
}

export function sceneFingerprint(cue: CueScene) {
  return stableFingerprint({
    id: cue.id,
    name: cue.name,
    states: Object.fromEntries(Object.entries(cue.fixture_states).sort(([a], [b]) => a.localeCompare(b))),
    fade_in_ms: cue.fade_in_ms,
    hold_ms: cue.hold_ms,
    priority: cue.priority,
    scene_status: cue.scene_status
  });
}

export function trackFingerprint(track: TimelineTrack) {
  return stableFingerprint({
    id: track.id,
    cue_scene_id: track.cue_scene_id,
    start_ms: track.start_ms,
    duration_ms: track.duration_ms,
    layer: track.layer
  });
}

export function projectMembershipFingerprint(project: ShowProject) {
  return stableFingerprint({
    fixture_ids: [...project.fixture_ids].sort((a, b) => a - b),
    track_ids: project.track_ids
  });
}

function conflict(partial: Omit<ExecutionConflict, "message"> & { message?: string }): ExecutionConflict {
  return {
    ...partial,
    message: partial.message ?? EXECUTION_CONFLICT_TEXT[partial.code]
  };
}

function sortedProjectTracks(project: ShowProject, tracks: TimelineTrack[]) {
  return project.track_ids
    .map((trackId, index) => ({ track: tracks.find((item) => item.id === trackId), index }))
    .filter((item): item is { track: TimelineTrack; index: number } => Boolean(item.track))
    .map(({ track, index }) => ({ track, configuredIndex: index }))
    .sort((a, b) => a.track.start_ms - b.track.start_ms || a.track.id - b.track.id || a.configuredIndex - b.configuredIndex);
}

function brightnessDmx(percent: number) {
  return Math.max(0, Math.min(100, percent)) / 100 * 255;
}

function buildFixtureRow(fixture: Fixture | undefined, cue: CueScene, fixtureId: number): ExecutionFixtureRow {
  const state = cue.fixture_states[String(fixtureId)];
  const brightness = Number(state?.brightness);
  const start = Number(fixture?.dmx_address);
  const channels = Number(fixture?.channel_count);
  const safeEnd = start >= 1 && channels >= 1 ? start + channels - 1 : start;
  return {
    fixture_id: fixtureId,
    fixture_code: fixture?.fixture_code ?? `未知灯具 #${fixtureId}`,
    fixture_type: fixture?.fixture_type ?? "UNKNOWN",
    dmx_address: start,
    channel_count: channels,
    dmx_end_address: safeEnd,
    brightness_percent: brightness,
    dmx_brightness: Math.round(brightnessDmx(brightness)),
    color: state?.color ?? "#ffffff",
    active: Boolean(fixture?.active)
  };
}

function validateProject(project: ShowProject | undefined, tracks: TimelineTrack[], conflicts: ExecutionConflict[]) {
  if (!project) {
    conflicts.push(conflict({ code: "PROJECT_NOT_FOUND", scope: "PROJECT", message: "未找到演出方案，无法生成执行单" }));
    return false;
  }
  const uniqueTracks = new Set(project.track_ids);
  if (uniqueTracks.size !== project.track_ids.length) {
    project.track_ids.filter((id, index) => project.track_ids.indexOf(id) !== index).forEach((trackId) => {
      conflicts.push(conflict({ code: "DUPLICATE_TRACK", scope: "PROJECT", track_id: trackId, message: `演出方案重复包含轨道 #${trackId}` }));
    });
  }
  project.track_ids.forEach((trackId) => {
    if (!tracks.some((track) => track.id === trackId)) {
      conflicts.push(conflict({ code: "TRACK_NOT_IN_SHOW", scope: "TRACK", track_id: trackId, message: `轨道 #${trackId} 已不存在，请从方案中移除` }));
    }
  });
  return true;
}

function validateCue(
  cue: CueScene,
  track: TimelineTrack,
  sequence: number,
  project: ShowProject,
  fixtureById: Map<number, Fixture>,
  conflicts: ExecutionConflict[]
): ExecutionCueSheet {
  const fixtureIds = Object.keys(cue.fixture_states).map(Number).sort((a, b) => a - b);
  const checkedFixtureIds = new Set<number>();
  const rows: ExecutionFixtureRow[] = [];

  fixtureIds.forEach((fixtureId) => {
    if (checkedFixtureIds.has(fixtureId)) {
      conflicts.push(conflict({
        code: "DUPLICATE_FIXTURE_STATE",
        scope: "FIXTURE",
        track_id: track.id,
        cue_id: cue.id,
        fixture_id: fixtureId,
        message: `第 ${sequence} 场 ${cue.name} 中灯具 #${fixtureId} 亮度被重复配置`
      }));
      return;
    }
    checkedFixtureIds.add(fixtureId);

    const fixture = fixtureById.get(fixtureId);
    if (!fixture) {
      conflicts.push(conflict({
        code: "MISSING_FIXTURE",
        scope: "FIXTURE",
        track_id: track.id,
        cue_id: cue.id,
        fixture_id: fixtureId,
        message: `第 ${sequence} 场引用了已删除灯具 #${fixtureId}`
      }));
    } else if (!project.fixture_ids.includes(fixtureId)) {
      conflicts.push(conflict({
        code: "FIXTURE_NOT_IN_SHOW",
        scope: "FIXTURE",
        track_id: track.id,
        cue_id: cue.id,
        fixture_id: fixtureId,
        message: `第 ${sequence} 场引用的 ${fixture.fixture_code} 不在当前演出方案灯具清单中`
      }));
    } else if (!fixture.active) {
      conflicts.push(conflict({
        code: "DISABLED_FIXTURE",
        scope: "FIXTURE",
        track_id: track.id,
        cue_id: cue.id,
        fixture_id: fixtureId,
        message: `第 ${sequence} 场引用了停用灯具 ${fixture.fixture_code}`
      }));
    }

    const brightness = Number(cue.fixture_states[String(fixtureId)]?.brightness);
    if (!Number.isFinite(brightness) || brightness < 0 || brightness > 100) {
      conflicts.push(conflict({
        code: "INVALID_BRIGHTNESS",
        scope: "FIXTURE",
        track_id: track.id,
        cue_id: cue.id,
        fixture_id: fixtureId,
        message: `第 ${sequence} 场灯具 #${fixtureId} 的亮度 ${brightness} 超出 0-100%`
      }));
    }

    if (fixture) {
      const start = fixture.dmx_address;
      const end = start + fixture.channel_count - 1;
      if (!Number.isInteger(start) || !Number.isInteger(fixture.channel_count) || start < 1 || end > MAX_DMX || fixture.channel_count < 1) {
        conflicts.push(conflict({
          code: "INVALID_DMX_RANGE",
          scope: "FIXTURE",
          track_id: track.id,
          cue_id: cue.id,
          fixture_id: fixtureId,
          message: `${fixture.fixture_code} 的 DMX 范围 ${start}-${end} 超出 1-512`
        }));
      }
    }
    rows.push(buildFixtureRow(fixture, cue, fixtureId));
  });

  const fixtureFingerprints = Object.fromEntries(rows.map((row) => {
    const rowFixture = fixtureById.get(row.fixture_id);
    return [
      String(row.fixture_id),
      rowFixture
        ? stableFingerprint({ fixture: fixtureFingerprint(rowFixture), state: cue.fixture_states[String(row.fixture_id)] })
        : "missing"
    ];
  }));

  return {
    sequence,
    track_id: track.id,
    cue_id: cue.id,
    cue_name: cue.name,
    start_ms: track.start_ms,
    duration_ms: track.duration_ms,
    fade_in_ms: cue.fade_in_ms,
    hold_ms: cue.hold_ms,
    priority: cue.priority,
    layer: track.layer,
    fixture_fingerprints: fixtureFingerprints,
    scene_fingerprint: sceneFingerprint(cue),
    track_fingerprint: trackFingerprint(track),
    fixture_rows: rows
  };
}

function markOverlapCues(cueSheets: ExecutionCueSheet[], conflicts: ExecutionConflict[]) {
  const overlapPairs = new Map(conflicts
    .filter((item) => item.code === "DMX_OVERLAP" && item.fixture_a_id && item.fixture_b_id)
    .map((item) => [`${item.fixture_a_id}-${item.fixture_b_id}`, item]));

  const byFixture = new Map<number, { cues: number[]; tracks: number[] }>();
  cueSheets.forEach((sheet) => {
    sheet.fixture_rows.forEach((row) => {
      if (row.dmx_address < 1 || row.dmx_end_address > MAX_DMX || row.channel_count < 1 || !row.active) return;
      const current = byFixture.get(row.fixture_id) ?? { cues: [], tracks: [] };
      if (!current.cues.includes(sheet.cue_id)) current.cues.push(sheet.cue_id);
      if (!current.tracks.includes(sheet.track_id)) current.tracks.push(sheet.track_id);
      byFixture.set(row.fixture_id, current);
    });
  });

  overlapPairs.forEach((item, key) => {
    const [aId, bId] = key.split("-").map(Number);
    const a = byFixture.get(aId);
    const b = byFixture.get(bId);
    if (!a || !b) return;
    item.cue_ids = Array.from(new Set([...a.cues, ...b.cues])).sort((left, right) => left - right);
    item.track_ids = Array.from(new Set([...a.tracks, ...b.tracks])).sort((left, right) => left - right);
  });
}

function addProjectFixtureConflicts(data: ExecutionDataBundle, project: ShowProject, conflicts: ExecutionConflict[]) {
  const fixtures = data.fixtures
    .filter((fixture) => project.fixture_ids.includes(fixture.id) && fixture.active)
    .filter((fixture) => fixture.dmx_address >= 1 && fixture.channel_count >= 1 && fixture.dmx_address + fixture.channel_count - 1 <= MAX_DMX)
    .sort((a, b) => a.dmx_address - b.dmx_address || a.id - b.id);

  fixtures.forEach((fixture, index) => {
    for (let nextIndex = index + 1; nextIndex < fixtures.length; nextIndex += 1) {
      const other = fixtures[nextIndex];
      if (other.dmx_address > fixture.dmx_address + fixture.channel_count - 1) break;
      conflicts.push(conflict({
        code: "DMX_OVERLAP",
        scope: "FIXTURE",
        fixture_a_id: fixture.id,
        fixture_b_id: other.id,
        message: `${fixture.fixture_code} DMX ${fixture.dmx_address}-${fixture.dmx_address + fixture.channel_count - 1} 与 ${other.fixture_code} DMX ${other.dmx_address}-${other.dmx_address + other.channel_count - 1} 编号重叠`
      }));
    }
  });
}

export function buildProjectCueSheets(data: ExecutionDataBundle, project: ShowProject): { cueSheets: ExecutionCueSheet[]; conflicts: ExecutionConflict[] } {
  const conflicts: ExecutionConflict[] = [];
  const fixtureById = new Map(data.fixtures.map((fixture) => [fixture.id, fixture]));
  const cueById = new Map(data.cueScenes.map((cue) => [cue.id, cue]));

  validateProject(project, data.timelineTracks, conflicts);
  addProjectFixtureConflicts(data, project, conflicts);

  const cueSheets = sortedProjectTracks(project, data.timelineTracks).map(({ track }, sequenceIndex) => {
    const sequence = sequenceIndex + 1;
    const cue = cueById.get(track.cue_scene_id);
    if (!cue) {
      conflicts.push(conflict({
        code: "MISSING_SCENE",
        scope: "TRACK",
        track_id: track.id,
        cue_id: track.cue_scene_id,
        message: `第 ${sequence} 条轨道引用了不存在的场景 #${track.cue_scene_id}`
      }));
      return {
        sequence,
        track_id: track.id,
        cue_id: track.cue_scene_id,
        cue_name: `缺失场景 #${track.cue_scene_id}`,
        start_ms: track.start_ms,
        duration_ms: track.duration_ms,
        fade_in_ms: 0,
        hold_ms: 0,
        priority: 0,
        layer: track.layer,
        fixture_fingerprints: {},
        scene_fingerprint: "missing",
        track_fingerprint: trackFingerprint(track),
        fixture_rows: []
      };
    }

    if (cue.scene_status !== "READY") {
      conflicts.push(conflict({
        code: "SCENE_NOT_READY",
        scope: "CUE",
        track_id: track.id,
        cue_id: cue.id,
        message: `第 ${sequence} 场 ${cue.name} 当前为 ${cue.scene_status}，只有 READY 场景可生成执行单`
      }));
    }
    return validateCue(cue, track, sequence, project, fixtureById, conflicts);
  });

  markOverlapCues(cueSheets, conflicts);
  return { cueSheets, conflicts };
}

function buildSnapshot(project: ShowProject, cueSheets: ExecutionCueSheet[], data: ExecutionDataBundle) {
  const trackIds = cueSheets.map((sheet) => sheet.track_id);
  const cueIds = cueSheets.map((sheet) => sheet.cue_id);
  const fixtureIds = Array.from(new Set(cueSheets.flatMap((sheet) => sheet.fixture_rows.map((row) => row.fixture_id)))).sort((a, b) => a - b);
  const trackById = new Map(data.timelineTracks.map((track) => [track.id, track]));
  const cueById = new Map(data.cueScenes.map((cue) => [cue.id, cue]));
  const fixtureById = new Map(data.fixtures.map((fixture) => [fixture.id, fixture]));

  return {
    project_fingerprint: projectMembershipFingerprint(project),
    project_fixture_ids: [...project.fixture_ids].sort((a, b) => a - b),
    track_fingerprints: Object.fromEntries(trackIds.map((id) => [String(id), trackById.get(id) ? trackFingerprint(trackById.get(id)!) : "missing"])),
    scene_fingerprints: Object.fromEntries(cueIds.map((id) => [String(id), cueById.get(id) ? sceneFingerprint(cueById.get(id)!) : "missing"])),
    fixture_fingerprints: Object.fromEntries(fixtureIds.map((id) => [String(id), fixtureById.get(id) ? fixtureFingerprint(fixtureById.get(id)!) : "missing"]))
  };
}

export function previewProject(data: ExecutionDataBundle, projectId: number): ExecutionFailure | ExecutionSheet {
  const project = data.showProjects.find((item) => item.id === projectId);
  if (!project) {
    return createExecutionFailure(projectId, [conflict({ code: "PROJECT_NOT_FOUND", scope: "PROJECT" })]);
  }
  const { cueSheets, conflicts } = buildProjectCueSheets(data, project);
  if (conflicts.length > 0) return createExecutionFailure(projectId, conflicts, cueSheets);
  return createEmptyExecutionSheet({
    show_project_id: projectId,
    source_fingerprint: stableFingerprint({ project: buildSnapshot(project, cueSheets, data) }),
    dependency_snapshot: buildSnapshot(project, cueSheets, data),
    cue_sheets: cueSheets
  });
}

function findAffectedCueIds(previous: ExecutionSheet, data: ExecutionDataBundle, project: ShowProject) {
  const { cueSheets } = buildProjectCueSheets(data, project);
  const oldByCue = new Map(previous.cue_sheets.map((sheet) => [sheet.cue_id, sheet]));
  const currentProjectFingerprint = projectMembershipFingerprint(project);
  const cueById = new Map(data.cueScenes.map((cue) => [cue.id, cue]));
  const fixtureById = new Map(data.fixtures.map((fixture) => [fixture.id, fixture]));

  if (currentProjectFingerprint !== previous.dependency_snapshot.project_fingerprint) {
    return { currentCueSheets: cueSheets, affectedCueIds: cueSheets.map((sheet) => sheet.cue_id), changedTrackIds: project.track_ids };
  }

  const affected = new Set<number>();
  const changedTrackIds: number[] = [];

  cueSheets.forEach((sheet) => {
    const old = oldByCue.get(sheet.cue_id);
    const currentTrack = data.timelineTracks.find((track) => track.id === sheet.track_id);
    const oldTrackFingerprint = old?.track_fingerprint;
    const currentTrackFingerprint = currentTrack ? trackFingerprint(currentTrack) : "missing";
    if (!old || oldTrackFingerprint !== currentTrackFingerprint) {
      affected.add(sheet.cue_id);
      changedTrackIds.push(sheet.track_id);
    }

    const currentCue = cueById.get(sheet.cue_id);
    const previousSceneFingerprint = previous.dependency_snapshot.scene_fingerprints[String(sheet.cue_id)];
    if (!old || !currentCue || previousSceneFingerprint !== sceneFingerprint(currentCue)) {
      affected.add(sheet.cue_id);
      changedTrackIds.push(sheet.track_id);
    }

    sheet.fixture_rows.forEach((row) => {
      const fixture = fixtureById.get(row.fixture_id);
      const previousFixtureFingerprint = previous.dependency_snapshot.fixture_fingerprints[String(row.fixture_id)];
      if (!old || !fixture || previousFixtureFingerprint !== fixtureFingerprint(fixture)) {
        affected.add(sheet.cue_id);
        changedTrackIds.push(sheet.track_id);
      }
    });
  });

  previous.cue_sheets.forEach((oldSheet) => {
    if (!cueSheets.some((sheet) => sheet.cue_id === oldSheet.cue_id)) {
      changedTrackIds.push(oldSheet.track_id);
    }
  });

  return {
    currentCueSheets: cueSheets,
    affectedCueIds: cueSheets.filter((sheet) => affected.has(sheet.cue_id)).map((sheet) => sheet.cue_id),
    changedTrackIds: Array.from(new Set(changedTrackIds)).sort((a, b) => a - b)
  };
}

export function generateExecutionSheet(
  data: ExecutionDataBundle,
  projectId: number,
  previous: ExecutionSheet | null,
  force = false
): ExecutionGenerateResult {
  const project = data.showProjects.find((item) => item.id === projectId);
  if (!project) {
    return { ok: false, failure: createExecutionFailure(projectId, [conflict({ code: "PROJECT_NOT_FOUND", scope: "PROJECT" })]) };
  }

  if (!previous || force) {
    const { cueSheets, conflicts } = buildProjectCueSheets(data, project);
    if (conflicts.length > 0) {
      console.warn("执行单生成失败", conflicts);
      return { ok: false, failure: createExecutionFailure(projectId, conflicts, cueSheets) };
    }
    const snapshot = buildSnapshot(project, cueSheets, data);
    const sheet = createEmptyExecutionSheet({
      show_project_id: projectId,
      version: previous ? previous.version + 1 : 1,
      trigger: force && previous ? "FORCED" : "INITIAL",
      changed_track_ids: cueSheets.map((sheet) => sheet.track_id),
      recalculated_cue_ids: cueSheets.map((sheet) => sheet.cue_id),
      source_fingerprint: stableFingerprint({ project: snapshot }),
      dependency_snapshot: snapshot,
      cue_sheets: cueSheets
    });
    return { ok: true, sheet, recalculatedCueIds: sheet.recalculated_cue_ids, existingSheetKept: false };
  }

  const { currentCueSheets, affectedCueIds, changedTrackIds } = findAffectedCueIds(previous, data, project);
  if (affectedCueIds.length === 0 && changedTrackIds.length === 0) {
    return { ok: true, sheet: previous, recalculatedCueIds: [], existingSheetKept: true };
  }

  const { conflicts } = buildProjectCueSheets(data, project);
  if (conflicts.length > 0) {
    console.warn("执行单增量重算失败，旧执行单保留", conflicts);
    return { ok: false, failure: createExecutionFailure(projectId, conflicts, currentCueSheets) };
  }

  const previousByCue = new Map(previous.cue_sheets.map((sheet) => [sheet.cue_id, sheet]));
  const mergedCueSheets = currentCueSheets.map((sheet) =>
    affectedCueIds.includes(sheet.cue_id) ? sheet : { ...(previousByCue.get(sheet.cue_id) ?? sheet), sequence: sheet.sequence }
  );
  const snapshot = buildSnapshot(project, mergedCueSheets, data);
  const sheet: ExecutionSheet = {
    ...previous,
    version: previous.version + 1,
    generated_at: new Date().toISOString(),
    trigger: "INCREMENTAL",
    source_fingerprint: stableFingerprint({ project: snapshot }),
    dependency_snapshot: snapshot,
    changed_track_ids: changedTrackIds,
    recalculated_cue_ids: affectedCueIds,
    cue_sheets: mergedCueSheets
  };
  return { ok: true, sheet, recalculatedCueIds: affectedCueIds, existingSheetKept: false };
}
