"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = [
  { type: "explain", label: "Explain", price: 300 },
  { type: "functions", label: "Functions", price: 100 },
  { type: "audit-quick", label: "Quick Audit", price: 500 },
  { type: "audit-full", label: "Full Audit", price: 1000 },
  { type: "post-conditions", label: "Post-Conditions", price: 500 },
];

export default function AuditButton({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRequest(type: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/x402/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, contractId }),
      });
      const data = await res.json();
      if (data.job_id) {
        router.push(`/audit/request/${data.job_id}`);
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#f7931a] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-colors hover:bg-[#f7931a]/90"
      >
        Request Audit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-[#30363d] bg-[#161b22] p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#f0f6fc]">
              Request x402 Audit
            </h3>
            <p className="mb-4 text-sm text-[#8b949e]">
              Select an analysis type. Payment via x402 protocol (sBTC).
            </p>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => handleRequest(t.type)}
                  disabled={loading}
                  className="flex w-full items-center justify-between rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-[#c9d1d9] transition-colors hover:border-[#58a6ff] disabled:opacity-50"
                >
                  <span>{t.label}</span>
                  <span className="text-[#f7931a]">{t.price} sats</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-lg border border-[#30363d] py-2 text-sm text-[#8b949e] hover:text-[#c9d1d9]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
