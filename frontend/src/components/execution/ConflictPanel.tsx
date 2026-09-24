import { EXECUTION_CONFLICT_TEXT } from "../../constants/ExecutionConflict";
import type { ExecutionConflict } from "../../types/ExecutionSheet";

export function ConflictPanel({ conflicts, title = "生成失败" }: { conflicts: ExecutionConflict[]; title?: string }) {
  return (
    <section className="panel conflict-panel">
      <div className="panel-title danger">
        <h2>{title}</h2>
        <span className="count-pill danger">{conflicts.length}</span>
      </div>
      <p className="muted">已保留上一版执行单；以下冲突修正后再次生成，只会重算受影响场次。</p>
      <ul className="conflict-list">
        {conflicts.map((conflict, index) => (
          <li key={`${conflict.code}-${conflict.track_id ?? ""}-${conflict.cue_id ?? ""}-${conflict.fixture_id ?? ""}-${index}`}>
            <b>{EXECUTION_CONFLICT_TEXT[conflict.code]}</b>
            <span>{conflict.message}</span>
            <small>
              {[
                conflict.cue_ids?.length ? `场次 ${conflict.cue_ids.join(", ")}` : "",
                conflict.track_ids?.length ? `轨道 ${conflict.track_ids.join(", ")}` : "",
                conflict.cue_id ? `Cue #${conflict.cue_id}` : "",
                conflict.track_id ? `Track #${conflict.track_id}` : "",
                conflict.fixture_id ? `Fixture #${conflict.fixture_id}` : ""
              ].filter(Boolean).join(" · ")}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
