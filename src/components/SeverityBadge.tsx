import { Badge } from "./ui/badge";

const STYLES: Record<string, string> = {
  critical: "bg-[#f85149] text-white border-transparent",
  high: "bg-[#f0883e] text-white border-transparent",
  medium: "bg-[#d29922] text-white border-transparent",
  low: "bg-[#3fb950] text-white border-transparent",
  info: "bg-[#58a6ff] text-white border-transparent",
  informational: "bg-[#58a6ff] text-white border-transparent",
};

export default function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  return (
    <Badge className={STYLES[s] || "bg-secondary text-secondary-foreground"}>
      {severity.toUpperCase()}
    </Badge>
  );
}
