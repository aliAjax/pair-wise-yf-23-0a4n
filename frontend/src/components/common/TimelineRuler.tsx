import { formatClock } from "../../utils/formatters";

export function TimelineRuler({ duration, currentTime }: { duration: number; currentTime?: number }) {
  const marks = Array.from({ length: 6 }, (_, index) => duration * index / 5);
  return (
    <div className="timeline-ruler">
      <div className="ruler-marks">
        {marks.map((mark) => <span key={mark} style={{ left: `${duration ? mark / duration * 100 : 0}%` }}>{formatClock(mark)}</span>)}
      </div>
      {typeof currentTime === "number" && <i className="playhead" style={{ left: `${duration ? currentTime / duration * 100 : 0}%` }} />}
    </div>
  );
}
