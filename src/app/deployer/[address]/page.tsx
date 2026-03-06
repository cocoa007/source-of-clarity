import ContractCard from "@/components/ContractCard";
import { getContractsByDeployer } from "@/lib/contracts";

export const revalidate = 3600;

export default async function DeployerPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const contracts = await getContractsByDeployer(address);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[#f0f6fc]">Deployer</h1>
      <p className="mb-6 font-mono text-sm text-[#8b949e]">{address}</p>
      <p className="mb-6 text-sm text-[#8b949e]">{contracts.length} contracts deployed</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contracts.map((c) => (
          <ContractCard
            key={c.contractId}
            contractId={c.contractId}
            principal={c.principal}
            name={c.name}
            blockHeight={c.blockHeight}
            functionCount={c.functionCount}
            sip009={c.sip009}
            sip010={c.sip010}
          />
        ))}
      </div>
    </div>
  );
}
