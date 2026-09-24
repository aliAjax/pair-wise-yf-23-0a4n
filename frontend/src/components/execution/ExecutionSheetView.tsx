import type { ExecutionSheet } from "../../types/ExecutionSheet";
import { formatClock, formatDate, formatDmxRange, formatPercent } from "../../utils/formatters";

export function ExecutionSheetView({ sheet }: { sheet: ExecutionSheet }) {
  return (
    <section className="panel sheet-panel">
      <div className="panel-title">
        <div>
          <h2>执行单 v{sheet.version}</h2>
          <p className="muted">{formatDate(sheet.generated_at)} 生成 · {sheet.trigger === "INITIAL" ? "完整生成" : sheet.trigger === "FORCED" ? "强制全量" : "增量重算"}</p>
        </div>
        <span className="count-pill success">{sheet.cue_sheets.length} 场</span>
      </div>
      <div className="recalc-note">
        重算场次：{sheet.recalculated_cue_ids.length ? sheet.recalculated_cue_ids.join("、") : "无"}
        {sheet.changed_track_ids.length ? ` · 变化轨道：${sheet.changed_track_ids.join("、")}` : ""}
      </div>
      <div className="cue-sheets">
        {sheet.cue_sheets.map((cue) => {
          const recalculated = sheet.recalculated_cue_ids.includes(cue.cue_id);
          return (
            <article key={cue.track_id} className={`cue-sheet ${recalculated ? "recalculated" : "preserved"}`}>
              <header>
                <div><strong>{cue.sequence}. {cue.cue_name}</strong><span>{formatClock(cue.start_ms)} · {cue.layer} 层 · 优先级 {cue.priority}</span></div>
                <span className={`mini-badge ${recalculated ? "new" : "kept"}`}>{recalculated ? "已重算" : "原样保留"}</span>
              </header>
              <div className="sheet-table-wrap">
                <table className="sheet-table">
                  <thead><tr><th>灯具</th><th>DMX 起址</th><th>通道数</th><th>占用编号</th><th>亮度</th></tr></thead>
                  <tbody>
                    {cue.fixture_rows.map((row) => (
                      <tr key={row.fixture_id}>
                        <td><span className="color-dot" style={{ background: row.color }} />{row.fixture_code}</td>
                        <td>{row.dmx_address}</td>
                        <td>{row.channel_count}</td>
                        <td>{formatDmxRange(row.dmx_address, row.dmx_end_address)}</td>
                        <td>{formatPercent(row.brightness_percent)} <small>DMX {row.dmx_brightness}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
