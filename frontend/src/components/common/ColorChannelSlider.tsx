export function ColorChannelSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  suffix = "%"
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="channel-slider">
      <span>{label}<b>{value}{suffix}</b></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
