import Link from "next/link";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
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
    <Link href={`/audit/${slug}`} className="group block">
      <Card className="transition-all hover:border-accent/50 hover:scale-[1.01]">
        <CardHeader className="p-4 pb-1">
          <div className="truncate text-sm font-semibold text-card-foreground group-hover:text-accent">
            {title}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{date}</span>
            {confidence && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{confidence}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <SeverityBar
            critical={criticalCount || 0}
            high={highCount || 0}
            medium={mediumCount || 0}
            low={lowCount || 0}
            info={infoCount || 0}
          />
          <div className="mt-2 text-xs text-muted-foreground">{total} findings</div>
        </CardContent>
      </Card>
    </Link>
  );
}
