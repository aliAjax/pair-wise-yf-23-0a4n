import { useEffect, useMemo, useState } from "react";
import { ProjectSelector } from "../components/common/ProjectSelector";
import { StatCard } from "../components/common/StatCard";
import { ConflictCuePreview } from "../components/execution/ConflictCuePreview";
import { ConflictPanel } from "../components/execution/ConflictPanel";
import { ExecutionSheetView } from "../components/execution/ExecutionSheetView";
import { ProjectEditor } from "../components/execution/ProjectEditor";
import { useLoadWorkspace } from "../hooks/useLoadWorkspace";
import { generateExecutionSheet } from "../services/executionService";
import { useExecutionSheetStore } from "../stores/ExecutionSheetStore";
import { useWorkspaceSelectionStore } from "../stores/WorkspaceSelectionStore";
import type { ExecutionFailure, ExecutionSheet } from "../types/ExecutionSheet";
import { formatDate } from "../utils/formatters";

export function ExecutionPage() {
  const { fixtures, cues, tracks, projects, sheets } = useLoadWorkspace();
  const saveSheet = useExecutionSheetStore((state) => state.save);
  const selectedProjectId = useWorkspaceSelectionStore((state) => state.selectedProjectId);
  const [failure, setFailure] = useState<ExecutionFailure | null>(null);
  const [notice, setNotice] = useState("");

  const project = projects.rows.find((item) => item.id === selectedProjectId) ?? projects.rows[0];
  const projectSheets = useMemo(() => sheets.rows
    .filter((sheet) => sheet.show_project_id === project?.id)
    .sort((a, b) => b.version - a.version), [sheets.rows, project?.id]);
  const latestSheet = projectSheets[0] ?? null;

  useEffect(() => {
    setFailure(null);
    setNotice("");
  }, [selectedProjectId]);

  const runGeneration = async (force = false) => {
    if (!project) return;
    const result = generateExecutionSheet({
      fixtures: fixtures.rows,
      cueScenes: cues.rows,
      timelineTracks: tracks.rows,
      showProjects: projects.rows
    }, project.id, latestSheet, force);

    if (!result.ok) {
      setFailure(result.failure);
      setNotice("");
      return;
    }

    setFailure(null);
    if (result.existingSheetKept) {
      setNotice("编排没有影响任何场次：未创建新版本，现有执行单保持原样。");
      return;
    }
    await saveSheet(result.sheet);
    setNotice(result.sheet.trigger === "INCREMENTAL"
      ? `增量生成 v${result.sheet.version}：只重算场次 ${result.recalculatedCueIds.join("、")}，其他场次沿用旧版。`
      : `执行单 v${result.sheet.version} 已生成并保存到浏览器。`);
  };

  const selectedCueCount = project?.track_ids.length ?? 0;
  const selectedFixtureCount = project?.fixture_ids.length ?? 0;

  return (
    <main className="page">
      <header className="page-head">
        <div><p className="eyebrow">Executive sheet</p><h1>可交付执行单</h1><p>逐场核对灯具 DMX 起址、通道数和亮度；冲突存在时整单失败并保留旧单。</p></div>
        <ProjectSelector />
      </header>
      <section className="metrics">
        <StatCard label="参与灯具" value={selectedFixtureCount} />
        <StatCard label="参与场次" value={selectedCueCount} />
        <StatCard label="历史执行单" value={projectSheets.length} />
      </section>

      <section className="generation-bar panel">
        <div>
          <h2>{project?.title ?? "请选择演出方案"}</h2>
          <p>{project?.venue_name} · 更新于 {project ? formatDate(project.updated_at) : "--"}</p>
        </div>
        <div className="generation-actions">
          <button type="button" className="primary-button" onClick={() => void runGeneration(false)}>生成 / 修正后增量重算</button>
          <button type="button" className="ghost-button" onClick={() => void runGeneration(true)}>强制全量重算</button>
        </div>
      </section>
      {notice && <div className="inline-alert success">{notice}</div>}
      {failure && <ConflictPanel conflicts={failure.conflicts} />}
      {failure && failure.attempted_cue_sheets.length > 0 && <ConflictCuePreview cueSheets={failure.attempted_cue_sheets} conflicts={failure.conflicts} />}

      <section className="workbench execution-layout">
        <div className="execution-main">
          {latestSheet ? <ExecutionSheetView sheet={latestSheet} /> : <div className="panel empty-state-large">尚未生成执行单。当前数据如有冲突，点击生成后会在此处标出。</div>}
          {projectSheets.length > 1 && (
            <section className="panel history-panel">
              <h2>历史版本（只读，仍保存在 IndexedDB）</h2>
              <div className="history-list">
                {projectSheets.map((sheet: ExecutionSheet) => <span key={sheet.id}>v{sheet.version} · {formatDate(sheet.generated_at)} · {sheet.cue_sheets.length} 场</span>)}
              </div>
            </section>
          )}
        </div>
        <aside className="execution-side">
          <ProjectEditor project={project} fixtureOptions={fixtures.rows.map((fixture) => fixture.id)} trackOptions={tracks.rows.map((track) => track.id)} />
          <section className="panel rules-panel">
            <h2>失败规则</h2>
            <ul>
              <li>两盏启用灯具占用 1-512 内同一编号，整单失败。</li>
              <li>场景引用停用、删除或不在方案中的灯具，整单失败。</li>
              <li>轨道引用缺失或非 READY 场景，整单失败。</li>
              <li>修正后再次生成：只重建受影响场次；未受影响场次保留旧快照。</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
