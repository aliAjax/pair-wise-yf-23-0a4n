export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PROJECT_NOT_FOUND: "请选择一个已存在的演出方案",
  EXECUTION_CONFLICT: "执行单生成失败：请先修复标出的冲突",
  INDEXED_DB_UNAVAILABLE: "当前浏览器无法使用 IndexedDB"
} as const;
