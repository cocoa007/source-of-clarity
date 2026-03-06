import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Source of Clarity — Clarity, clarified.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0d1117",
          padding: "60px",
        }}
      >
        {/* Diamond */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 48 48"
          fill="none"
          style={{ marginBottom: 24 }}
        >
          <path d="M24 4L6 20L24 44L42 20L24 4Z" fill="#f7931a" opacity="0.9" />
          <path d="M24 4L6 20L24 24L24 4Z" fill="#f7931a" opacity="0.7" />
          <path d="M24 4L42 20L24 24L24 4Z" fill="#f7931a" opacity="1" />
          <path d="M6 20L24 44L24 24L6 20Z" fill="#f7931a" opacity="0.55" />
          <path d="M42 20L24 44L24 24L42 20Z" fill="#f7931a" opacity="0.75" />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            color: "#f0f6fc",
            marginBottom: 16,
          }}
        >
          Source of{" "}
          <span style={{ color: "#f7931a", marginLeft: 14 }}>Clarity</span>
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#8b949e",
            marginBottom: 32,
          }}
        >
          Clarity, clarified.
        </div>

        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 18,
            color: "#58a6ff",
          }}
        >
          <span>100k+ Contracts</span>
          <span style={{ color: "#30363d" }}>|</span>
          <span>Security Audits</span>
          <span style={{ color: "#30363d" }}>|</span>
          <span>Code Comments</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
