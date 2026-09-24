import { useLoadWorkspace } from "../../hooks/useLoadWorkspace";
import { useWorkspaceSelectionStore } from "../../stores/WorkspaceSelectionStore";

export function ProjectSelector({ compact = false }: { compact?: boolean }) {
  const { projects } = useLoadWorkspace();
  const selectedProjectId = useWorkspaceSelectionStore((state) => state.selectedProjectId);
  const selectProject = useWorkspaceSelectionStore((state) => state.selectProject);
  const project = projects.rows.find((item) => item.id === selectedProjectId) ?? projects.rows[0];

  return (
    <label className={compact ? "project-select compact" : "project-select"}>
      {!compact && <span>演出方案</span>}
      <select value={project?.id ?? ""} onChange={(event) => selectProject(Number(event.target.value))}>
        {projects.rows.map((item) => <option key={item.id} value={item.id}>{item.title}（{item.venue_name}）</option>)}
      </select>
    </label>
  );
}
