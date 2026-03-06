const COLORS: Record<string, string> = {
  critical: "#f85149",
  high: "#f0883e",
  medium: "#d29922",
  low: "#3fb950",
  info: "#58a6ff",
};

export default function SeverityBar({
  critical = 0,
  high = 0,
  medium = 0,
  low = 0,
  info = 0,
}: {
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  info?: number;
}) {
  const total = critical + high + medium + low + info;
  if (total === 0) return null;

  const segments = [
    { count: critical, color: COLORS.critical },
    { count: high, color: COLORS.high },
    { count: medium, color: COLORS.medium },
    { count: low, color: COLORS.low },
    { count: info, color: COLORS.info },
  ].filter((s) => s.count > 0);

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#30363d]">
      {segments.map((seg, i) => (
        <div
          key={i}
          className="h-full"
          style={{
            width: `${(seg.count / total) * 100}%`,
            backgroundColor: seg.color,
          }}
        />
      ))}
    </div>
  );
}
