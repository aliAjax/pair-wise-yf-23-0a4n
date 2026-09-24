import type { CueScene } from "../../types/CueScene";
import { formatDuration } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";

export function CueCard({ cue, sequence, selected = false, onSelect }: { cue: CueScene; sequence?: number; selected?: boolean; onSelect?: () => void }) {
  return (
    <button type="button" className={`cue-card ${selected ? "selected" : ""}`} onClick={onSelect}>
      <span className="cue-card-top">
        <strong>{sequence ? `${sequence}. ${cue.name}` : cue.name}</strong>
        <StatusBadge value={cue.scene_status} />
      </span>
      <span className="cue-card-meta">{Object.keys(cue.fixture_states).length} 盏灯 · 淡入 {formatDuration(cue.fade_in_ms)} · 保持 {formatDuration(cue.hold_ms)}</span>
    </button>
  );
}
