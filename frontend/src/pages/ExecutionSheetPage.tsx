import { useEffect, useState } from "react";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { useExecutionSheetStore } from "../stores/ExecutionSheetStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { DmxRangeTag } from "../components/common/DmxRangeTag";
import { BrightnessBar } from "../components/common/BrightnessBar";
import { formatDate, formatMsToClock } from "../utils/formatters";
import type { SheetEntry } from "../types/ExecutionSheet";

function entryRunTag(entry: SheetEntry, sheetProjectId: number, lastRun: { projectId: number; reusedTrackIds: number[]; recomputedTrackIds: number[] } | null) {
  if (!lastRun || lastRun.projectId !== sheetProjectId) return null;
  if (lastRun.recomputedTrackIds.includes(entry.track_id)) return <span className="run-tag recomputed">本场重算</span>;
  if (lastRun.reusedTrackIds.includes(entry.track_id)) return <span className="run-tag reused">保持原样</span>;
  return null;
}

export function ExecutionSheetPage() {
  const projects = useShowProjectStore((state) => state.rows);
  const loadProjects = useShowProjectStore((state) => state.load);
  const sheets = useExecutionSheetStore((state) => state.sheets);
  const lastRun = useExecutionSheetStore((state) => state.lastRun);
  const loading = useExecutionSheetStore((state) => state.loading);
  const loadSheets = useExecutionSheetStore((state) => state.load);
  const generate = useExecutionSheetStore((state) => state.generate);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    loadSheets();
  }, [loadProjects, loadSheets]);

  const selectedId = projectId ?? projects[0]?.id ?? null;
  const project = projects.find((row) => row.id === selectedId) ?? null;
  const sheet = sheets.find((row) => row.project_id === selectedId) ?? null;
  const conflictCount = sheet?.entries.reduce((sum, entry) => sum + entry.conflicts.length, 0) ?? 0;

  const onGenerate = async () => {
    if (selectedId == null) return;
    setError(null);
    try {
      await generate(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">stage-light</p>
        <h1>执行单</h1>
      </div>
      <div className="sheet-actions">
        <select
          value={selectedId ?? ""}
          onChange={(event) => setProjectId(Number(event.target.value))}
        >
          {projects.map((row) => <option key={row.id} value={row.id}>{row.title} · {row.venue_name}</option>)}
        </select>
        <button className="primary" disabled={loading || selectedId == null} onClick={onGenerate}>
          {loading ? "生成中…" : sheet ? "重新生成（仅重算受影响场次）" : "生成执行单"}
        </button>
      </div>
    </section>

    {error && <section className="conflict-panel"><strong>生成失败</strong><p>{error}</p></section>}

    {sheet && <section className="metrics">
      <StatCard label="场次条目" value={sheet.entries.length} />
      <StatCard label="冲突项" value={conflictCount} />
      <StatCard label="生成批次" value={`#${sheet.generation}`} />
    </section>}

    {sheet && sheet.sheet_status === "FAILED" && <section className="conflict-panel">
      <strong>生成失败：请先处理以下冲突</strong>
      <ul>
        {sheet.entries.flatMap((entry) => entry.conflicts.map((conflict, index) => (
          <li key={`${entry.track_id}-${index}`}>
            <span className="conflict-scene">第 {entry.order} 场 · {entry.scene_name}</span>
            <span>{conflict.message}：{conflict.detail}</span>
          </li>
        )))}
      </ul>
      <p className="hint">到「灯具布置」修正 DMX 起址、通道数或灯具状态后，回到本页重新生成；未受影响的场次将保持原样。</p>
    </section>}

    {sheet && <section className="sheet-meta">
      <StatusBadge value={sheet.sheet_status} />
      <span>{sheet.project_title} · {sheet.venue_name}</span>
      <span>最近生成：{formatDate(sheet.generated_at)}</span>
      {lastRun && lastRun.projectId === sheet.project_id && (
        <span>本次重算 {lastRun.recomputedTrackIds.length} 场 · 保持原样 {lastRun.reusedTrackIds.length} 场</span>
      )}
    </section>}

    {!sheet && !error && <EmptyState title={project ? `「${project.title}」尚未生成执行单，点击上方按钮生成` : "暂无演出方案"} />}

    {sheet && <section className="sheet-entries">
      {sheet.entries.map((entry) => (
        <article key={entry.track_id} className={"entry-card" + (entry.check_status === "CONFLICT" ? " has-conflict" : "")}>
          <header>
            <div className="entry-title">
              <strong>第 {entry.order} 场 · {entry.scene_name}</strong>
              <span className="entry-time">{formatMsToClock(entry.start_ms)} 起 · 时长 {formatMsToClock(entry.duration_ms)}</span>
            </div>
            <div className="entry-badges">
              {entryRunTag(entry, sheet.project_id, lastRun)}
              <StatusBadge value={entry.scene_status} />
              <StatusBadge value={entry.check_status} />
            </div>
          </header>
          {entry.conflicts.length > 0 && <ul className="entry-conflicts">
            {entry.conflicts.map((conflict, index) => <li key={index}>{conflict.message}：{conflict.detail}</li>)}
          </ul>}
          {entry.fixtures.length > 0 && <table className="sheet-table">
            <thead>
              <tr><th>灯具</th><th>DMX 起址</th><th>通道数</th><th>占用区间</th><th>亮度</th></tr>
            </thead>
            <tbody>
              {entry.fixtures.map((line) => {
                const conflicted = entry.conflicts.some((conflict) => conflict.fixture_ids.includes(line.fixture_id));
                return <tr key={line.fixture_id} className={conflicted ? "row-conflict" : ""}>
                  <td>{line.fixture_code}</td>
                  <td>{line.dmx_start}</td>
                  <td>{line.channel_count}</td>
                  <td><DmxRangeTag start={line.dmx_start} count={line.channel_count} conflict={conflicted} /></td>
                  <td><BrightnessBar value={line.brightness} /></td>
                </tr>;
              })}
            </tbody>
          </table>}
          <footer>条目生成于 {formatDate(entry.generated_at)} · 指纹 {entry.fingerprint || "—"}</footer>
        </article>
      ))}
    </section>}
  </main>;
}
