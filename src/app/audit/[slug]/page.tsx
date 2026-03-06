import { notFound } from "next/navigation";
import { getAuditBySlug, getAuditFindings } from "@/lib/audits";
import SeverityBar from "@/components/SeverityBar";
import SeverityBadge from "@/components/SeverityBadge";
import AuditFinding from "@/components/AuditFinding";

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
  const grouped = SEVERITY_ORDER
    .map((sev) => ({
      severity: sev,
      findings: findings.filter((f) => f.severity.toLowerCase() === sev),
    }))
    .filter((g) => g.findings.length > 0);

  const totalFindings =
    (audit.criticalCount || 0) +
    (audit.highCount || 0) +
    (audit.mediumCount || 0) +
    (audit.lowCount || 0) +
    (audit.infoCount || 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="lg:flex lg:gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h1 className="mb-2 text-2xl font-bold text-[#f0f6fc]">
            {audit.contractsAudited?.[0] || audit.slug}
          </h1>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[#8b949e]">
            <span>{audit.date}</span>
            {audit.confidence && (
              <span className="rounded bg-[#30363d] px-2 py-0.5 text-xs">
                {audit.confidence} confidence
              </span>
            )}
            {audit.priorityScore && (
              <span className="text-[#f7931a]">
                Priority: {audit.priorityScore}/3.0
              </span>
            )}
          </div>

          {/* Severity summary bar */}
          <div className="mb-6">
            <SeverityBar
              critical={audit.criticalCount || 0}
              high={audit.highCount || 0}
              medium={audit.mediumCount || 0}
              low={audit.lowCount || 0}
              info={audit.infoCount || 0}
            />
            <div className="mt-2 flex gap-4 text-xs text-[#8b949e]">
              {audit.criticalCount ? <span className="text-[#f85149]">{audit.criticalCount} Critical</span> : null}
              {audit.highCount ? <span className="text-[#f0883e]">{audit.highCount} High</span> : null}
              {audit.mediumCount ? <span className="text-[#d29922]">{audit.mediumCount} Medium</span> : null}
              {audit.lowCount ? <span className="text-[#3fb950]">{audit.lowCount} Low</span> : null}
              {audit.infoCount ? <span className="text-[#58a6ff]">{audit.infoCount} Info</span> : null}
            </div>
          </div>

          {/* Findings */}
          {grouped.map((group) => (
            <section key={group.severity} className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#f0f6fc]">
                <SeverityBadge severity={group.severity} />
                <span className="capitalize">{group.severity} Findings</span>
              </h2>
              <div className="space-y-2">
                {group.findings.map((f) => (
                  <AuditFinding
                    key={f.id}
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

          {findings.length === 0 && audit.htmlContent && (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: audit.htmlContent }}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="mt-8 w-full shrink-0 lg:sticky lg:top-20 lg:mt-0 lg:w-64 lg:self-start">
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Report Info</h3>
            <div className="text-sm">
              <span className="text-[#8b949e]">Auditor: </span>
              <span className="text-[#c9d1d9]">cocoa007.btc</span>
            </div>
            <div className="text-sm">
              <span className="text-[#8b949e]">Date: </span>
              <span className="text-[#c9d1d9]">{audit.date}</span>
            </div>
            {audit.deployer && (
              <div className="text-sm">
                <span className="text-[#8b949e]">Deployer: </span>
                <span className="font-mono text-xs text-[#c9d1d9]">
                  {audit.deployer.slice(0, 10)}...
                </span>
              </div>
            )}
            {audit.blockHeight && (
              <div className="text-sm">
                <span className="text-[#8b949e]">Block: </span>
                <span className="text-[#c9d1d9]">{audit.blockHeight.toLocaleString()}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-[#8b949e]">Findings: </span>
              <span className="text-[#c9d1d9]">{totalFindings}</span>
            </div>
            {audit.contractsAudited && audit.contractsAudited.length > 1 && (
              <div className="text-sm">
                <span className="text-[#8b949e]">Contracts: </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {audit.contractsAudited.map((c) => (
                    <span key={c} className="rounded bg-[#30363d] px-1.5 py-0.5 text-xs text-[#c9d1d9]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {audit.hasExploits && (
              <div className="rounded border border-[#f85149]/30 bg-[#f85149]/10 px-3 py-2 text-xs text-[#f85149]">
                Exploit PoC available
              </div>
            )}

            {/* Finding navigation */}
            {grouped.length > 0 && (
              <div className="border-t border-[#30363d] pt-3">
                <h4 className="mb-2 text-xs font-semibold text-[#8b949e]">Navigate</h4>
                <div className="space-y-1">
                  {grouped.map((g) => (
                    <div key={g.severity} className="text-xs text-[#8b949e]">
                      <span className="capitalize">{g.severity}</span>
                      <span className="ml-1">({g.findings.length})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
