const STYLES: Record<string, string> = {
  critical: "bg-[#f85149] text-white",
  high: "bg-[#f0883e] text-white",
  medium: "bg-[#d29922] text-white",
  low: "bg-[#3fb950] text-white",
  info: "bg-[#58a6ff] text-white",
  informational: "bg-[#58a6ff] text-white",
};

export default function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STYLES[s] || "bg-[#30363d] text-[#c9d1d9]"
      }`}
    >
      {severity.toUpperCase()}
    </span>
  );
}
