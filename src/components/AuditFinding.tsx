"use client";

import { useState } from "react";
import SeverityBadge from "./SeverityBadge";

interface Props {
  findingId: string;
  severity: string;
  title: string;
  location: string | null;
  description: string | null;
  impact: string | null;
  recommendation: string | null;
  codeSnippet: string | null;
}

export default function AuditFinding({
  findingId,
  severity,
  title,
  location,
  description,
  impact,
  recommendation,
  codeSnippet,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-[#30363d] bg-[#161b22]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <SeverityBadge severity={severity} />
        <span className="text-xs font-mono text-[#8b949e]">{findingId}</span>
        <span className="flex-1 text-sm font-medium text-[#f0f6fc]">{title}</span>
        <span className="text-[#8b949e] transition-transform" style={{ transform: expanded ? "rotate(180deg)" : "" }}>
          &#9662;
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#30363d] px-4 py-4 space-y-3 text-sm text-[#c9d1d9]">
          {location && (
            <div>
              <span className="font-semibold text-[#8b949e]">Location: </span>
              <span className="font-mono">{location}</span>
            </div>
          )}
          {description && <p>{description}</p>}
          {codeSnippet && (
            <pre className="overflow-x-auto rounded border border-[#30363d] bg-[#0d1117] p-3 text-xs">
              <code>{codeSnippet}</code>
            </pre>
          )}
          {impact && (
            <div>
              <span className="font-semibold text-[#8b949e]">Impact: </span>
              {impact}
            </div>
          )}
          {recommendation && (
            <div>
              <span className="font-semibold text-[#8b949e]">Recommendation: </span>
              {recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
