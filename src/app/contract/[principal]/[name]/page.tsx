import { notFound } from "next/navigation";
import { getContractById, getContractFunctions } from "@/lib/contracts";
import { getAuditsForContract } from "@/lib/audits";
import { getCommentsByContract, getCommentCountsByLine } from "@/lib/comments";
import ContractSource from "@/components/ContractSource";
import ContractSourceInteractive from "@/components/ContractSourceInteractive";
import FunctionTable from "@/components/FunctionTable";
import AuditButton from "@/components/AuditButton";
import AuditCard from "@/components/AuditCard";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const revalidate = 3600;

export default async function ContractPage({
  params,
}: {
  params: Promise<{ principal: string; name: string }>;
}) {
  const { principal, name } = await params;
  const contractId = `${principal}.${name}`;
  const [contract, functions, audits, comments, commentCounts] = await Promise.all([
    getContractById(contractId),
    getContractFunctions(contractId),
    getAuditsForContract(contractId),
    getCommentsByContract(contractId),
    getCommentCountsByLine(contractId),
  ]);

  if (!contract) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="lg:flex lg:gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">{contract.name}</h1>
              <Link
                href={`/deployer/${contract.principal}`}
                className="text-sm text-accent hover:underline"
              >
                {contract.principal}
              </Link>
            </div>
            <AuditButton contractId={contractId} />
          </div>

          {/* Source */}
          {contract.source && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-card-foreground">Source Code</h2>
              <ContractSourceInteractive
                contractId={contractId}
                principal={principal}
                contractName={name}
                commentCounts={commentCounts}
                initialComments={JSON.parse(JSON.stringify(comments))}
              >
                <ContractSource source={contract.source} />
              </ContractSourceInteractive>
            </section>
          )}

          {/* Functions */}
          {functions.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-card-foreground">
                Functions ({functions.length})
              </h2>
              <FunctionTable functions={functions} />
            </section>
          )}

          {/* Linked Audits */}
          {audits.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-card-foreground">Audit Reports</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {audits.map((a) => (
                  <AuditCard
                    key={a.slug}
                    slug={a.slug}
                    contractsAudited={a.contractsAudited}
                    date={a.date}
                    confidence={a.confidence}
                    criticalCount={a.criticalCount}
                    highCount={a.highCount}
                    mediumCount={a.mediumCount}
                    lowCount={a.lowCount}
                    infoCount={a.infoCount}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="mt-8 w-full shrink-0 lg:mt-0 lg:w-72">
          <Card>
            <CardHeader className="p-4 pb-0">
              <h3 className="text-sm font-semibold text-card-foreground">Metadata</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {contract.blockHeight && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Block: </span>
                  <span className="text-foreground">{contract.blockHeight.toLocaleString()}</span>
                </div>
              )}
              {contract.txId && (
                <div className="text-sm">
                  <span className="text-muted-foreground">TX: </span>
                  <span className="font-mono text-xs text-foreground">
                    {contract.txId.slice(0, 12)}...
                  </span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">Functions: </span>
                <span className="text-foreground">{contract.functionCount}</span>
              </div>
              <div className="flex gap-1">
                {contract.sip009 && <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">SIP-009</Badge>}
                {contract.sip010 && <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">SIP-010</Badge>}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
