import { Suspense } from "react";
import AuditCard from "@/components/AuditCard";
import SearchInput from "@/components/SearchInput";
import { searchAudits } from "@/lib/audits";
import Link from "next/link";

export const revalidate = 3600;

const SEVERITY_FILTERS = ["critical", "high", "medium"];

export default async function AuditsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; severity?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const result = await searchAudits({
    query: params.q,
    severity: params.severity,
    page,
  });

  const baseParams = new URLSearchParams();
  if (params.q) baseParams.set("q", params.q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[#f0f6fc]">Security Audits</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Suspense>
          <SearchInput basePath="/audits" placeholder="Search audits..." />
        </Suspense>
        <div className="flex gap-2">
          {SEVERITY_FILTERS.map((s) => {
            const active = params.severity === s;
            const newParams = new URLSearchParams(baseParams.toString());
            if (active) {
              newParams.delete("severity");
            } else {
              newParams.set("severity", s);
            }
            return (
              <Link
                key={s}
                href={`/audits?${newParams.toString()}`}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                  active
                    ? "border-[#f85149] bg-[#f85149]/10 text-[#f85149]"
                    : "border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]"
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mb-4 text-sm text-[#8b949e]">{result.total} audit reports</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.audits.map((a) => (
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

      {result.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/audits?${baseParams.toString()}&page=${page - 1}`}
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
              href={`/audits?${baseParams.toString()}&page=${page + 1}`}
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
