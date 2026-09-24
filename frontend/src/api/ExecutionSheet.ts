import { ensureSeeded, nextId } from "./bootstrap";
import { idbGetAll, idbPut } from "../utils/indexedDb";
import type { ExecutionSheet } from "../types/ExecutionSheet";

export async function listExecutionSheet(): Promise<ExecutionSheet[]> {
  await ensureSeeded();
  return idbGetAll<ExecutionSheet>("executionSheet");
}

export async function saveExecutionSheet(payload: ExecutionSheet): Promise<ExecutionSheet> {
  await ensureSeeded();
  const next = payload.id === 0 ? { ...payload, id: await nextId("executionSheet") } : payload;
  return idbPut("executionSheet", next);
}
