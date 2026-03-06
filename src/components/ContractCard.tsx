import Link from "next/link";
import SipBadge from "./SipBadge";

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
    <Link
      href={`/contract/${principal}/${name}`}
      className="group block rounded-lg border border-[#30363d] bg-[#161b22] p-4 transition-all hover:border-[#58a6ff]/50 hover:bg-[#161b22]/80"
    >
      <div className="mb-1 truncate text-sm font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff]">
        {name}
      </div>
      <div className="mb-3 truncate text-xs text-[#8b949e]">
        {principal.slice(0, 8)}...{principal.slice(-4)}
      </div>
      <div className="flex items-center gap-2 text-xs text-[#8b949e]">
        {blockHeight && <span>Block {blockHeight.toLocaleString()}</span>}
        {functionCount != null && <span>{functionCount} functions</span>}
      </div>
      <div className="mt-2 flex gap-1">
        {sip009 && <SipBadge sip="SIP-009" />}
        {sip010 && <SipBadge sip="SIP-010" />}
      </div>
    </Link>
  );
}
