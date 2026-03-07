"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent } from "./ui/card";

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
      <Button onClick={() => setOpen(true)}>
        Request Audit
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-semibold text-card-foreground">
                Request x402 Audit
              </h3>
              <p className="text-sm text-muted-foreground">
                Select an analysis type. Payment via x402 protocol (sBTC).
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {TYPES.map((t) => (
                <Button
                  key={t.type}
                  variant="outline"
                  onClick={() => handleRequest(t.type)}
                  disabled={loading}
                  className="flex w-full items-center justify-between"
                >
                  <span>{t.label}</span>
                  <span className="text-primary">{t.price} sats</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="mt-2 w-full text-muted-foreground"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
