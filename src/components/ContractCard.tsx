import Link from "next/link";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface Props {
  contractId: string;
  principal: string;
  name: string;
  blockHeight: number | null;
  functionCount: number | null;
  sip009: boolean | null;
  sip010: boolean | null;
}

export default function ContractCard({
  contractId,
  principal,
  name,
  blockHeight,
  functionCount,
  sip009,
  sip010,
}: Props) {
  return (
    <Link href={`/contract/${principal}/${name}`} className="group block">
      <Card className="transition-all hover:border-accent/50 hover:bg-card/80">
        <CardHeader className="p-4 pb-1">
          <div className="truncate text-sm font-semibold text-card-foreground group-hover:text-accent">
            {name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {principal.slice(0, 8)}...{principal.slice(-4)}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {blockHeight && <span>Block {blockHeight.toLocaleString()}</span>}
            {functionCount != null && <span>{functionCount} functions</span>}
          </div>
          <div className="mt-2 flex gap-1">
            {sip009 && <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">SIP-009</Badge>}
            {sip010 && <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">SIP-010</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
