"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
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
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={findingId} className="rounded-lg border border-border bg-card">
        <AccordionTrigger className="gap-3 px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 text-left">
            <SeverityBadge severity={severity} />
            <span className="text-xs font-mono text-muted-foreground">{findingId}</span>
            <span className="text-sm font-medium text-card-foreground">{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 space-y-3 text-sm text-foreground">
          {location && (
            <div>
              <span className="font-semibold text-muted-foreground">Location: </span>
              <span className="font-mono">{location}</span>
            </div>
          )}
          {description && <p>{description}</p>}
          {codeSnippet && (
            <pre className="overflow-x-auto rounded border border-border bg-background p-3 text-xs">
              <code>{codeSnippet}</code>
            </pre>
          )}
          {impact && (
            <div>
              <span className="font-semibold text-muted-foreground">Impact: </span>
              {impact}
            </div>
          )}
          {recommendation && (
            <div>
              <span className="font-semibold text-muted-foreground">Recommendation: </span>
              {recommendation}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
