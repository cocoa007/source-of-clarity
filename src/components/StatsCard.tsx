"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";

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
    <Card className="text-center transition-transform hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="text-3xl font-bold" style={{ color }}>
          {display.toLocaleString()}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
