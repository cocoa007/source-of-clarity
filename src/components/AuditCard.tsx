import Link from "next/link";
import SeverityBar from "./SeverityBar";

interface Props {
  slug: string;
  contractsAudited: string[] | null;
  date: string;
  confidence: string | null;
  criticalCount: number | null;
  highCount: number | null;
  mediumCount: number | null;
  lowCount: number | null;
  infoCount: number | null;
}

export default function AuditCard({
  slug,
  contractsAudited,
  date,
  confidence,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  infoCount,
}: Props) {
  const total =
    (criticalCount || 0) +
    (highCount || 0) +
    (mediumCount || 0) +
    (lowCount || 0) +
    (infoCount || 0);
  const title = contractsAudited?.[0] || slug;

  return (
    <Link
      href={`/audit/${slug}`}
      className="group block rounded-lg border border-[#30363d] bg-[#161b22] p-4 transition-all hover:border-[#58a6ff]/50 hover:scale-[1.01]"
    >
      <div className="mb-1 truncate text-sm font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff]">
        {title}
      </div>
      <div className="mb-3 flex items-center gap-2 text-xs text-[#8b949e]">
        <span>{date}</span>
        {confidence && (
          <span className="rounded bg-[#30363d] px-1.5 py-0.5">{confidence}</span>
        )}
      </div>
      <SeverityBar
        critical={criticalCount || 0}
        high={highCount || 0}
        medium={mediumCount || 0}
        low={lowCount || 0}
        info={infoCount || 0}
      />
      <div className="mt-2 text-xs text-[#8b949e]">{total} findings</div>
    </Link>
  );
}
