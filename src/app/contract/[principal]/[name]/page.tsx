import { notFound } from "next/navigation";
import { getContractById, getContractFunctions } from "@/lib/contracts";
import { getAuditsForContract } from "@/lib/audits";
import ContractSource from "@/components/ContractSource";
import FunctionTable from "@/components/FunctionTable";
import AuditButton from "@/components/AuditButton";
import AuditCard from "@/components/AuditCard";
import SipBadge from "@/components/SipBadge";
import Link from "next/link";

export const revalidate = 3600;

export default async function ContractPage({
  params,
}: {
  params: Promise<{ principal: string; name: string }>;
}) {
  const { principal, name } = await params;
  const contractId = `${principal}.${name}`;
  const [contract, functions, audits] = await Promise.all([
    getContractById(contractId),
    getContractFunctions(contractId),
    getAuditsForContract(contractId),
  ]);

  if (!contract) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="lg:flex lg:gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#f0f6fc]">{contract.name}</h1>
              <Link
                href={`/deployer/${contract.principal}`}
                className="text-sm text-[#58a6ff] hover:underline"
              >
                {contract.principal}
              </Link>
            </div>
            <AuditButton contractId={contractId} />
          </div>

          {/* Source */}
          {contract.source && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-[#f0f6fc]">Source Code</h2>
              <ContractSource source={contract.source} />
            </section>
          )}

          {/* Functions */}
          {functions.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-[#f0f6fc]">
                Functions ({functions.length})
              </h2>
              <FunctionTable functions={functions} />
            </section>
          )}

          {/* Linked Audits */}
          {audits.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#f0f6fc]">Audit Reports</h2>
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
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Metadata</h3>
            {contract.blockHeight && (
              <div className="text-sm">
                <span className="text-[#8b949e]">Block: </span>
                <span className="text-[#c9d1d9]">{contract.blockHeight.toLocaleString()}</span>
              </div>
            )}
            {contract.txId && (
              <div className="text-sm">
                <span className="text-[#8b949e]">TX: </span>
                <span className="font-mono text-xs text-[#c9d1d9]">
                  {contract.txId.slice(0, 12)}...
                </span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-[#8b949e]">Functions: </span>
              <span className="text-[#c9d1d9]">{contract.functionCount}</span>
            </div>
            <div className="flex gap-1">
              {contract.sip009 && <SipBadge sip="SIP-009" />}
              {contract.sip010 && <SipBadge sip="SIP-010" />}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
