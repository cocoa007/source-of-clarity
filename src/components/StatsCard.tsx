"use client";

import { useEffect, useState } from "react";

export default function StatsCard({
  label,
  value,
  color = "#f0f6fc",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 text-center transition-transform hover:scale-[1.02]">
      <div className="text-3xl font-bold" style={{ color }}>
        {display.toLocaleString()}
      </div>
      <div className="mt-1 text-sm text-[#8b949e]">{label}</div>
    </div>
  );
}
