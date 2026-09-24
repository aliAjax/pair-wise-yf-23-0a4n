import type { ExecutionConflictCode } from "../types/ExecutionSheet";

export const EXECUTION_CONFLICT_TEXT: Record<ExecutionConflictCode, string> = {
  PROJECT_NOT_FOUND: "演出方案不存在",
  DMX_OVERLAP: "DMX 地址重叠",
  DISABLED_FIXTURE: "引用停用灯具",
  MISSING_FIXTURE: "灯具不存在",
  FIXTURE_NOT_IN_SHOW: "灯具不在演出方案中",
  DUPLICATE_FIXTURE_STATE: "灯具亮度重复配置",
  MISSING_SCENE: "时间轴引用了不存在的场景",
  SCENE_NOT_READY: "时间轴引用了非就绪场景",
  TRACK_NOT_IN_SHOW: "轨道不在演出方案中",
  DUPLICATE_TRACK: "时间轴重复引用同一条轨道",
  INVALID_DMX_RANGE: "DMX 地址或通道数超出 1-512",
  INVALID_BRIGHTNESS: "亮度必须在 0-100 之间"
};
