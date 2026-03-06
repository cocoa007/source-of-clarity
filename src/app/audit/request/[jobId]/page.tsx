"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface JobStatus {
  job_id: string;
  type: string;
  status: string;
  result?: unknown;
  results_url?: string;
  error?: string;
}

export default function AuditRequestPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/x402/status/${jobId}`);
        const data = await res.json();
        if (!active) return;
        setJob(data);
        if (data.status !== "complete" && data.status !== "failed") {
          setTimeout(poll, 5000);
        }
      } catch {
        if (active) setError("Failed to check status");
      }
    }
    poll();
    return () => { active = false; };
  }, [jobId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-[#f0f6fc]">Audit Request</h1>
      <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-6">
        <div className="mb-4 text-sm">
          <span className="text-[#8b949e]">Job ID: </span>
          <span className="font-mono text-[#c9d1d9]">{jobId}</span>
        </div>

        {error && <p className="text-sm text-[#f85149]">{error}</p>}

        {!job && !error && (
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#30363d] border-t-[#58a6ff]" />
            <span className="text-sm text-[#8b949e]">Checking status...</span>
          </div>
        )}

        {job && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <StatusIndicator status={job.status} />
              <span className="text-sm capitalize text-[#c9d1d9]">{job.status}</span>
              <span className="rounded bg-[#30363d] px-2 py-0.5 text-xs text-[#8b949e]">
                {job.type}
              </span>
            </div>

            {job.status === "complete" && job.result && (
              <div className="mt-4 rounded border border-[#30363d] bg-[#0d1117] p-4">
                <pre className="overflow-x-auto text-xs text-[#c9d1d9]">
                  {typeof job.result === "string"
                    ? job.result
                    : JSON.stringify(job.result, null, 2)}
                </pre>
              </div>
            )}

            {job.status === "failed" && job.error && (
              <p className="mt-4 text-sm text-[#f85149]">{job.error}</p>
            )}

            {job.results_url && (
              <a
                href={job.results_url}
                className="mt-4 inline-block text-sm text-[#58a6ff] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View full results
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const color =
    status === "complete"
      ? "bg-[#3fb950]"
      : status === "failed"
      ? "bg-[#f85149]"
      : "bg-[#d29922] animate-pulse";
  return <div className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}
