import { Suspense } from "react";
import Link from "next/link";
import StatsCard from "@/components/StatsCard";
import ContractCard from "@/components/ContractCard";
import AuditCard from "@/components/AuditCard";
import SearchInput from "@/components/SearchInput";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getContractStats, getRecentContracts } from "@/lib/contracts";
import { getAuditStats, getRecentAudits } from "@/lib/audits";

export const revalidate = 3600;

export default async function Home() {
  const [contractStats, auditStats, recentContracts, recentAudits] =
    await Promise.all([
      getContractStats(),
      getAuditStats(),
      getRecentContracts(8),
      getRecentAudits(6),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <section className="animate-fade-in mb-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" width={56} height={56} className="mx-auto mb-4" />
        <h1 className="mb-2 text-4xl font-bold text-card-foreground md:text-5xl">
          Source of <span className="text-primary">Clarity</span>
        </h1>
        <p className="mb-4 text-xl text-primary font-medium tracking-wide">
          Clarity, clarified.
        </p>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Explore, audit, and discuss 100k+ Clarity smart contracts on Stacks.
        </p>
        <div className="flex justify-center mb-10">
          <Suspense>
            <SearchInput basePath="/contracts" placeholder="Search contracts by name or address..." />
          </Suspense>
        </div>

        {/* Feature pillars */}
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          <Card className="text-left">
            <CardContent className="p-4">
              <div className="mb-2 text-lg font-semibold text-card-foreground">Browse</div>
              <p className="text-sm text-muted-foreground">
                Search and explore 100k+ Clarity contracts with syntax highlighting and function analysis.
              </p>
            </CardContent>
          </Card>
          <Card className="text-left">
            <CardContent className="p-4">
              <div className="mb-2 text-lg font-semibold text-card-foreground">Audit</div>
              <p className="text-sm text-muted-foreground">
                Request security audits powered by x402. Pay in sBTC, get findings in minutes.
              </p>
            </CardContent>
          </Card>
          <Card className="text-left">
            <CardContent className="p-4">
              <div className="mb-2 text-lg font-semibold text-card-foreground">Comment</div>
              <p className="text-sm text-muted-foreground">
                Discuss code line-by-line with your Bluesky account. Built on AT Protocol.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="mb-16" />

      {/* Stats */}
      <section className="animate-fade-in animate-fade-in-delay-1 mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="Contracts" value={contractStats?.total || 0} color="#f7931a" />
        <StatsCard label="NFT Contracts" value={contractStats?.nftCount || 0} color="#58a6ff" />
        <StatsCard label="FT Contracts" value={contractStats?.ftCount || 0} color="#3fb950" />
        <StatsCard label="Audit Reports" value={auditStats?.total || 0} color="#f0883e" />
      </section>

      {/* Recent Contracts */}
      <section className="animate-fade-in animate-fade-in-delay-2 mb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground">Recent Deployments</h2>
          <Link href="/contracts" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentContracts.map((c) => (
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
        {recentContracts.length === 0 && (
          <p className="text-center text-muted-foreground">No contracts indexed yet. Run the import script to get started.</p>
        )}
      </section>

      {/* Recent Audits */}
      <section className="animate-fade-in animate-fade-in-delay-3">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground">Recent Audits</h2>
          <Link href="/audits" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentAudits.map((a) => (
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
        {recentAudits.length === 0 && (
          <p className="text-center text-muted-foreground">No audits imported yet. Run the audit import script.</p>
        )}
      </section>
    </div>
  );
}
