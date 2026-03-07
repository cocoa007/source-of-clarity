import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuditBySlug, getAuditFindings } from "@/lib/audits";
import { parseFindingsFromBodyHtml } from "@/lib/audit-parser";
import SeverityBar from "@/components/SeverityBar";
import SeverityBadge from "@/components/SeverityBadge";
import AuditFinding from "@/components/AuditFinding";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const revalidate = 3600;

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info", "informational"];

export default async function AuditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) notFound();

  const findings = await getAuditFindings(audit.id);

  const displayFindings =
    findings.length === 0 && audit.htmlContent
      ? parseFindingsFromBodyHtml(audit.htmlContent)
      : findings;

  const grouped = SEVERITY_ORDER
    .map((sev) => ({
      severity: sev,
      findings: displayFindings.filter((f) => f.severity.toLowerCase() === sev),
    }))
    .filter((g) => g.findings.length > 0);

  const totalFindings =
    (audit.criticalCount || 0) +
    (audit.highCount || 0) +
    (audit.mediumCount || 0) +
    (audit.lowCount || 0) +
    (audit.infoCount || 0) || displayFindings.length;

  const countFor = (sev: string) =>
    displayFindings.filter((f) => f.severity.toLowerCase() === sev).length;

  const criticalCount = audit.criticalCount || countFor("critical");
  const highCount = audit.highCount || countFor("high");
  const mediumCount = audit.mediumCount || countFor("medium");
  const lowCount = audit.lowCount || countFor("low");
  const infoCount =
    audit.infoCount ||
    countFor("info") + countFor("informational");

  const hasFindings = displayFindings.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4">
        <Link
          href="/audits"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          ← Back to Audits
        </Link>
      </div>
      <div className="lg:flex lg:gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">
            {audit.contractsAudited?.[0] || audit.slug}
          </h1>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{audit.date}</span>
            {audit.confidence && (
              <Badge variant="secondary" className="text-xs">
                {audit.confidence} confidence
              </Badge>
            )}
            {audit.priorityScore && (
              <span className="text-primary">
                Priority: {audit.priorityScore}/3.0
              </span>
            )}
          </div>

          {hasFindings && (
            <>
              {/* Severity summary bar */}
              <div className="mb-6">
                <SeverityBar
                  critical={criticalCount}
                  high={highCount}
                  medium={mediumCount}
                  low={lowCount}
                  info={infoCount}
                />
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  {criticalCount ? <span className="text-[#f85149]">{criticalCount} Critical</span> : null}
                  {highCount ? <span className="text-[#f0883e]">{highCount} High</span> : null}
                  {mediumCount ? <span className="text-[#d29922]">{mediumCount} Medium</span> : null}
                  {lowCount ? <span className="text-[#3fb950]">{lowCount} Low</span> : null}
                  {infoCount ? <span className="text-accent">{infoCount} Info</span> : null}
                </div>
              </div>

              {/* Findings */}
              {grouped.map((group) => (
                <section key={group.severity} className="mb-8">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-card-foreground">
                    <SeverityBadge severity={group.severity} />
                    <span className="capitalize">{group.severity} Findings</span>
                  </h2>
                  <div className="space-y-2">
                    {group.findings.map((f, i) => (
                      <AuditFinding
                        key={f.findingId || i}
                        findingId={f.findingId}
                        severity={f.severity}
                        title={f.title}
                        location={f.location}
                        description={f.description}
                        impact={f.impact}
                        recommendation={f.recommendation}
                        codeSnippet={f.codeSnippet}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}

          {!hasFindings && audit.htmlContent && (
            <div
              className="audit-content prose prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-card-foreground [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-card-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-card-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:text-foreground [&_p]:mb-3 [&_ul]:text-foreground [&_ol]:text-foreground [&_li]:mb-1 [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:text-sm [&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-accent [&_a:hover]:underline [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-card [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-card-foreground [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_hr]:border-border"
              dangerouslySetInnerHTML={{ __html: audit.htmlContent.replace(/href=(["'])\s*\/index(?:\.html)?\s*\1/gi, 'href="/audits"') }}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="mt-8 w-full shrink-0 lg:sticky lg:top-20 lg:mt-0 lg:w-64 lg:self-start">
          <Card>
            <CardHeader className="p-4 pb-0">
              <h3 className="text-sm font-semibold text-card-foreground">Report Info</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Auditor: </span>
                <span className="text-foreground">cocoa007.btc</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Date: </span>
                <span className="text-foreground">{audit.date}</span>
              </div>
              {audit.deployer && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Deployer: </span>
                  <span className="font-mono text-xs text-foreground">
                    {audit.deployer.slice(0, 10)}...
                  </span>
                </div>
              )}
              {audit.blockHeight && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Block: </span>
                  <span className="text-foreground">{audit.blockHeight.toLocaleString()}</span>
                </div>
              )}
              {hasFindings && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Findings: </span>
                  <span className="text-foreground">{totalFindings}</span>
                </div>
              )}
              {!hasFindings && (
                <div className="rounded border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  Full report below
                </div>
              )}
              {audit.contractsAudited && audit.contractsAudited.length > 1 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Contracts: </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {audit.contractsAudited.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {audit.hasExploits && (
                <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Exploit PoC available
                </div>
              )}

              {/* Finding navigation */}
              {grouped.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Navigate</h4>
                    <div className="space-y-1">
                      {grouped.map((g) => (
                        <div key={g.severity} className="text-xs text-muted-foreground">
                          <span className="capitalize">{g.severity}</span>
                          <span className="ml-1">({g.findings.length})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
