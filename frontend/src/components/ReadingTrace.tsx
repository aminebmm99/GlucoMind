import type { GlucoseReading } from "../types/api";

interface ReadingTraceProps {
  readings: GlucoseReading[];
}

export default function ReadingTrace({ readings }: ReadingTraceProps) {
  const ordered = [...readings].reverse().slice(-24);
  const values = ordered.map((reading) => ({
    reading,
    value: reading.unit === "mmol/L" ? reading.glucoseValue * 18.0182 : reading.glucoseValue,
  }));
  const points = values.map(({ value }, index) => {
    const x = values.length < 2 ? 120 : 18 + (index / (values.length - 1)) * 204;
    const y = 82 - (Math.max(40, Math.min(value, 300)) - 40) / 260 * 64;
    return [x, y] as const;
  });
  const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const summary = values.length === 0
    ? "No glucose readings are recorded in this timeline."
    : `Timeline of ${values.length} recorded glucose readings, from ${values[0].value.toFixed(1)} to ${values.at(-1)!.value.toFixed(1)} mg/dL. Original units remain available in the reading list.`;

  return (
    <div className="reading-trace" role="img" aria-label={summary}>
      <svg viewBox="0 0 240 112" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="reading-trace-line" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#81e3c4" />
            <stop offset="1" stopColor="#d3f6e7" />
          </linearGradient>
          <linearGradient id="reading-trace-area" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#87ddc0" stopOpacity=".22" />
            <stop offset="1" stopColor="#87ddc0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[24, 56, 88].map((y) => <line key={y} x1="10" x2="230" y1={y} y2={y} stroke="rgba(205, 239, 224, .1)" strokeDasharray="2 5" />)}
        {points.length > 1 && <path d={`${path} L224 102 L18 102 Z`} fill="url(#reading-trace-area)" />}
        {points.length > 1 && <path d={path} fill="none" stroke="url(#reading-trace-line)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />}
        {points.map(([x, y], index) => <circle key={`${values[index].reading.id}-${index}`} cx={x} cy={y} r={index === points.length - 1 ? 3.5 : 2.1} fill="#d4f6e8" stroke="#2b7665" strokeWidth="1.4" />)}
      </svg>
      <div className="trace-axis"><span>{values[0] ? new Date(values[0].reading.measuredAt).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}</span><span>RECENT MEASUREMENTS</span><span>{values.at(-1) ? new Date(values.at(-1)!.reading.measuredAt).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}</span></div>
    </div>
  );
}
