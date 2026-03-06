import { Suspense } from "react";
import ContractCard from "@/components/ContractCard";
import SearchInput from "@/components/SearchInput";
import { searchContracts } from "@/lib/contracts";
import Link from "next/link";

export const revalidate = 3600;

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sip009?: string; sip010?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const result = await searchContracts({
    query: params.q,
    sip009: params.sip009 === "1",
    sip010: params.sip010 === "1",
    page,
  });

  const baseParams = new URLSearchParams();
  if (params.q) baseParams.set("q", params.q);
  if (params.sip009) baseParams.set("sip009", params.sip009);
  if (params.sip010) baseParams.set("sip010", params.sip010);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[#f0f6fc]">Contracts</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Suspense>
          <SearchInput basePath="/contracts" placeholder="Search contracts..." />
        </Suspense>
        <div className="flex gap-2">
          <FilterChip label="NFT (SIP-009)" param="sip009" active={params.sip009 === "1"} baseParams={baseParams} />
          <FilterChip label="FT (SIP-010)" param="sip010" active={params.sip010 === "1"} baseParams={baseParams} />
        </div>
      </div>

      <p className="mb-4 text-sm text-[#8b949e]">
        {result.total.toLocaleString()} contracts found
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {result.contracts.map((c) => (
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

      {result.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/contracts?${baseParams.toString()}&page=${page - 1}`}
              className="rounded border border-[#30363d] px-4 py-2 text-sm text-[#c9d1d9] hover:border-[#58a6ff]"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-[#8b949e]">
            Page {page} of {result.totalPages}
          </span>
          {page < result.totalPages && (
            <Link
              href={`/contracts?${baseParams.toString()}&page=${page + 1}`}
              className="rounded border border-[#30363d] px-4 py-2 text-sm text-[#c9d1d9] hover:border-[#58a6ff]"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  param,
  active,
  baseParams,
}: {
  label: string;
  param: string;
  active: boolean;
  baseParams: URLSearchParams;
}) {
  const newParams = new URLSearchParams(baseParams.toString());
  if (active) {
    newParams.delete(param);
  } else {
    newParams.set(param, "1");
  }

  return (
    <Link
      href={`/contracts?${newParams.toString()}`}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-[#f7931a] bg-[#f7931a]/10 text-[#f7931a]"
          : "border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]"
      }`}
    >
      {label}
    </Link>
  );
}
