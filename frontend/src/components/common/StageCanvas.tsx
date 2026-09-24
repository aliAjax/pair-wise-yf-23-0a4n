import type { CueScene } from "../../types/CueScene";
import type { Fixture } from "../../types/Fixture";

export function StageCanvas({ fixtures, activeCue, projectFixtureIds }: { fixtures: Fixture[]; activeCue?: CueScene; projectFixtureIds: number[] }) {
  return (
    <div className="stage-canvas">
      <div className="stage-label">舞台</div>
      {fixtures.filter((fixture) => projectFixtureIds.includes(fixture.id)).map((fixture) => {
        const state = activeCue?.fixture_states[String(fixture.id)];
        const on = Boolean(state);
        return (
          <div
            key={fixture.id}
            className={`stage-fixture ${on ? "lit" : ""}`}
            style={{ left: `${fixture.position_x}%`, top: `${fixture.position_y}%`, background: state?.color ?? "#334155", opacity: state ? Math.max(0.35, state.brightness / 100) : fixture.active ? 0.35 : 0.16 }}
            title={`${fixture.fixture_code}${state ? ` · ${state.brightness}%` : ""}`}
          >
            {fixture.fixture_code}
          </div>
        );
      })}
    </div>
  );
}
