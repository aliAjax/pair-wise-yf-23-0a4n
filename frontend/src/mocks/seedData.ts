import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { ShowProject } from "../types/ShowProject";
import type { TimelineTrack } from "../types/TimelineTrack";

export const seedFixtures: Fixture[] = [
  {
    id: 1,
    fixture_code: "PAR-A01",
    fixture_type: "PAR",
    position_x: 18,
    position_y: 72,
    dmx_address: 1,
    channel_count: 3,
    color_mode: "RGB",
    active: true
  },
  {
    id: 2,
    fixture_code: "WASH-B02",
    fixture_type: "WASH",
    position_x: 38,
    position_y: 30,
    dmx_address: 17,
    channel_count: 4,
    color_mode: "RGBW",
    active: true
  },
  {
    id: 3,
    fixture_code: "BEAM-C03",
    fixture_type: "BEAM",
    position_x: 64,
    position_y: 28,
    dmx_address: 33,
    channel_count: 6,
    color_mode: "MOVING_HEAD",
    active: true
  },
  {
    id: 4,
    fixture_code: "SPOT-D04",
    fixture_type: "SPOT",
    position_x: 82,
    position_y: 70,
    dmx_address: 65,
    channel_count: 5,
    color_mode: "MOVING_HEAD",
    active: true
  },
  {
    id: 5,
    fixture_code: "STROBE-E05",
    fixture_type: "STROBE",
    position_x: 50,
    position_y: 12,
    dmx_address: 81,
    channel_count: 1,
    color_mode: "DIMMER_ONLY",
    active: false
  }
];

export const seedCueScenes: CueScene[] = [
  {
    id: 1,
    name: "开场暖场",
    fixture_states: {
      "1": { brightness: 62, color: "#ffb15a" },
      "2": { brightness: 48, color: "#ffe0a3" }
    },
    fade_in_ms: 2500,
    hold_ms: 6000,
    priority: 10,
    scene_status: "READY"
  },
  {
    id: 2,
    name: "主唱定位",
    fixture_states: {
      "3": { brightness: 88, color: "#ffffff" },
      "4": { brightness: 72, color: "#cfe8ff" }
    },
    fade_in_ms: 800,
    hold_ms: 5000,
    priority: 30,
    scene_status: "READY"
  },
  {
    id: 3,
    name: "全员齐亮",
    fixture_states: {
      "1": { brightness: 92, color: "#ffffff" },
      "2": { brightness: 84, color: "#e8f7ff" },
      "3": { brightness: 76, color: "#ffffff" },
      "4": { brightness: 90, color: "#fff7d6" }
    },
    fade_in_ms: 1200,
    hold_ms: 4500,
    priority: 40,
    scene_status: "READY"
  },
  {
    id: 4,
    name: "检修频闪（停用）",
    fixture_states: {
      "5": { brightness: 35, color: "#ffffff" }
    },
    fade_in_ms: 200,
    hold_ms: 1500,
    priority: 20,
    scene_status: "DISABLED"
  }
];

export const seedTimelineTracks: TimelineTrack[] = [
  { id: 1, cue_scene_id: 1, start_ms: 0, duration_ms: 8500, layer: 1, locked: false },
  { id: 2, cue_scene_id: 2, start_ms: 8500, duration_ms: 5800, layer: 1, locked: true },
  { id: 3, cue_scene_id: 3, start_ms: 14300, duration_ms: 5700, layer: 1, locked: false },
  { id: 4, cue_scene_id: 4, start_ms: 20000, duration_ms: 1700, layer: 2, locked: false }
];

export const seedShowProjects: ShowProject[] = [
  {
    id: 1,
    title: "周末主秀",
    venue_name: "一号实验剧场",
    fixture_ids: [1, 2, 3, 4],
    track_ids: [1, 2, 3],
    updated_at: "2026-09-24T09:00:00.000Z"
  },
  {
    id: 2,
    title: "带停用灯具的备份方案",
    venue_name: "二号黑匣子",
    fixture_ids: [1, 2, 3, 4, 5],
    track_ids: [1, 4],
    updated_at: "2026-09-24T09:30:00.000Z"
  }
];

export const mockData = {
  fixture: seedFixtures,
  cueScene: seedCueScenes,
  timelineTrack: seedTimelineTracks,
  showProject: seedShowProjects
};
