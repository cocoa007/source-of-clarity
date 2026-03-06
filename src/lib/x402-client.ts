const WORKER_URL =
  process.env.X402_WORKER_URL || "https://x402-clarity.cocoa007.workers.dev";

export type RequestType =
  | "explain"
  | "functions"
  | "audit-quick"
  | "diff"
  | "audit-full"
  | "post-conditions";

export const AUDIT_TYPES: {
  type: RequestType;
  label: string;
  price: number;
  estimate: string;
}[] = [
  { type: "explain", label: "Explain Contract", price: 300, estimate: "2-5 min" },
  { type: "functions", label: "Function Analysis", price: 100, estimate: "1-2 min" },
  { type: "audit-quick", label: "Quick Audit", price: 500, estimate: "3-8 min" },
  { type: "diff", label: "Contract Diff", price: 500, estimate: "3-5 min" },
  { type: "audit-full", label: "Full Audit", price: 1000, estimate: "10-20 min" },
  { type: "post-conditions", label: "Post-Conditions", price: 500, estimate: "3-5 min" },
];

export async function requestAudit(body: {
  type: RequestType;
  contractId?: string;
  source?: string;
}) {
  const res = await fetch(`${WORKER_URL}/api/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getJobStatus(jobId: string) {
  const res = await fetch(`${WORKER_URL}/api/status/${jobId}`);
  return res.json();
}
