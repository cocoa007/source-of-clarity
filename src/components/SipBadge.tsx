export default function SipBadge({ sip }: { sip: string }) {
  return (
    <span className="inline-block rounded border border-[#f7931a]/30 bg-[#f7931a]/10 px-2 py-0.5 text-xs font-medium text-[#f7931a]">
      {sip}
    </span>
  );
}
