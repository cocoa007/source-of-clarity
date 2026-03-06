import { ImageResponse } from "next/og";
import { getContractById, getContractFunctions } from "@/lib/contracts";

export const runtime = "nodejs";
export const alt = "Contract on Source of Clarity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ principal: string; name: string }>;
}) {
  const { principal, name } = await params;
  const contractId = `${principal}.${name}`;

  let contract;
  let functions;
  try {
    [contract, functions] = await Promise.all([
      getContractById(contractId),
      getContractFunctions(contractId),
    ]);
  } catch {
    contract = null;
    functions = [];
  }

  const sourceLines = contract?.source?.split("\n").slice(0, 6) || [];
  const truncatedPrincipal =
    principal.length > 20
      ? principal.slice(0, 8) + "..." + principal.slice(-8)
      : principal;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0d1117",
          padding: "48px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L6 20L24 44L42 20L24 4Z" fill="#f7931a" opacity="0.15" />
            <path d="M24 4L6 20L42 20L24 4Z" fill="#f7931a" opacity="0.95" />
            <path d="M9 22L24 40L17 28L9 22Z" fill="#f7931a" opacity="0.6" />
            <path d="M39 22L24 40L31 28L39 22Z" fill="#f7931a" opacity="0.8" />
            <path d="M17 28L24 40L31 28L24 24L17 28Z" fill="#f7931a" opacity="0.7" />
          </svg>
          <span style={{ fontSize: 16, color: "#8b949e" }}>
            Source of Clarity
          </span>
        </div>

        {/* Contract name */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "#f0f6fc",
            marginBottom: 8,
          }}
        >
          {name}
        </div>

        {/* Deployer */}
        <div
          style={{
            fontSize: 18,
            color: "#58a6ff",
            marginBottom: 24,
          }}
        >
          {truncatedPrincipal}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 24,
            fontSize: 16,
          }}
        >
          <span style={{ color: "#8b949e" }}>
            {functions.length} functions
          </span>
          {contract?.sip009 && (
            <span
              style={{
                backgroundColor: "#f7931a22",
                color: "#f7931a",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              SIP-009
            </span>
          )}
          {contract?.sip010 && (
            <span
              style={{
                backgroundColor: "#f7931a22",
                color: "#f7931a",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              SIP-010
            </span>
          )}
          {contract?.blockHeight && (
            <span style={{ color: "#8b949e" }}>
              Block {contract.blockHeight.toLocaleString()}
            </span>
          )}
        </div>

        {/* Source preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            backgroundColor: "#161b22",
            borderRadius: 8,
            border: "1px solid #30363d",
            padding: "16px 20px",
            overflow: "hidden",
            fontFamily: "monospace",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {sourceLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                color: "#c9d1d9",
                whiteSpace: "pre",
              }}
            >
              <span
                style={{
                  color: "#484f58",
                  width: 32,
                  textAlign: "right",
                  marginRight: 16,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span>{line.length > 80 ? line.slice(0, 77) + "..." : line}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
