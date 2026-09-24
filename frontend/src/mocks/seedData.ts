export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-01",
      "fixture_type": "PAR",
      "position_x": "120",
      "position_y": "80",
      "dmx_address": "1",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "ACTIVE"
    },
    {
      "id": 2,
      "fixture_code": "PAR-02",
      "fixture_type": "PAR",
      "position_x": "240",
      "position_y": "80",
      "dmx_address": "5",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "ACTIVE"
    },
    {
      "id": 3,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": "360",
      "position_y": "120",
      "dmx_address": "9",
      "channel_count": 8,
      "color_mode": "MOVING_HEAD",
      "fixture_status": "ACTIVE"
    },
    {
      "id": 4,
      "fixture_code": "WASH-01",
      "fixture_type": "WASH",
      "position_x": "480",
      "position_y": "120",
      "dmx_address": "17",
      "channel_count": 6,
      "color_mode": "RGB",
      "fixture_status": "ACTIVE"
    },
    {
      "id": 5,
      "fixture_code": "BEAM-01",
      "fixture_type": "BEAM",
      "position_x": "600",
      "position_y": "160",
      "dmx_address": "23",
      "channel_count": 6,
      "color_mode": "MOVING_HEAD",
      "fixture_status": "ACTIVE"
    },
    {
      "id": 6,
      "fixture_code": "STR-01",
      "fixture_type": "STROBE",
      "position_x": "720",
      "position_y": "160",
      "dmx_address": "29",
      "channel_count": 2,
      "color_mode": "DIMMER_ONLY",
      "fixture_status": "DISABLED"
    },
    {
      "id": 7,
      "fixture_code": "PAR-03",
      "fixture_type": "PAR",
      "position_x": "840",
      "position_y": "80",
      "dmx_address": "22",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "ACTIVE"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场暖场",
      "fixture_states": "{\"1\":80,\"2\":80,\"4\":60}",
      "fade_in_ms": "1500",
      "hold_ms": "5000",
      "priority": "1",
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "主歌推进",
      "fixture_states": "{\"3\":100,\"5\":90,\"7\":70}",
      "fade_in_ms": "800",
      "hold_ms": "0",
      "priority": "2",
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "副歌爆点",
      "fixture_states": "{\"5\":100,\"6\":100,\"7\":85}",
      "fade_in_ms": "200",
      "hold_ms": "3000",
      "priority": "3",
      "scene_status": "READY"
    },
    {
      "id": 4,
      "name": "谢幕",
      "fixture_states": "{\"1\":40,\"2\":40,\"3\":30}",
      "fade_in_ms": "3000",
      "hold_ms": "8000",
      "priority": "1",
      "scene_status": "DRAFT"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "0",
      "duration_ms": "30000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "30000",
      "duration_ms": "45000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "75000",
      "duration_ms": "20000",
      "layer": "2",
      "locked": "false"
    },
    {
      "id": 4,
      "cue_scene_id": 4,
      "start_ms": "95000",
      "duration_ms": "30000",
      "layer": "1",
      "locked": "true"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "夏夜巡演·上海站",
      "venue_name": "上海音乐厅",
      "fixture_ids": [1, 2, 3, 4, 5, 6, 7],
      "track_ids": [1, 2, 3, 4],
      "updated_at": "2026-09-20T09:00:00Z"
    },
    {
      "id": 2,
      "title": "排练镜像方案",
      "venue_name": "排练厅 B",
      "fixture_ids": [1, 2, 3, 4],
      "track_ids": [1, 4],
      "updated_at": "2026-09-21T09:00:00Z"
    }
  ]
} as const;
