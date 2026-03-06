import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" width={48} height={48} className="mb-6" />

      <h1 className="mb-2 text-3xl font-bold text-[#f0f6fc]">
        Source of Clarity
      </h1>
      <p className="mb-8 text-xl text-[#f7931a] font-medium">
        Clarity, clarified.
      </p>

      <div className="space-y-6 text-[#c9d1d9] leading-relaxed">
        <p>
          Source of Clarity is an open-source explorer for Clarity smart
          contracts on the Stacks blockchain. It indexes over 100,000 deployed
          contracts and makes them searchable, readable, and auditable.
        </p>

        <h2 className="text-xl font-semibold text-[#f0f6fc] pt-4">
          What you can do
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-[#8b949e]">
          <li>
            <span className="text-[#c9d1d9]">Browse contracts</span> — search
            by name, deployer address, or SIP standard (009/010)
          </li>
          <li>
            <span className="text-[#c9d1d9]">Read source code</span> — syntax
            highlighting, function tables, and line numbers
          </li>
          <li>
            <span className="text-[#c9d1d9]">Request security audits</span> —
            powered by{" "}
            <a
              href="https://www.x402.org"
              className="text-[#58a6ff] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              x402 protocol
            </a>
            , pay in sBTC
          </li>
          <li>
            <span className="text-[#c9d1d9]">Comment on code</span> — sign in
            with Bluesky to discuss contracts line-by-line, built on AT Protocol
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-[#f0f6fc] pt-4">
          Built with
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: "Stacks", url: "https://www.stacks.co", desc: "Blockchain" },
            {
              name: "AT Protocol",
              url: "https://atproto.com",
              desc: "Comments",
            },
            { name: "x402", url: "https://www.x402.org", desc: "Audits" },
            {
              name: "Next.js",
              url: "https://nextjs.org",
              desc: "Framework",
            },
          ].map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 text-center transition-colors hover:border-[#58a6ff]"
            >
              <div className="text-sm font-medium text-[#f0f6fc]">
                {t.name}
              </div>
              <div className="text-xs text-[#8b949e]">{t.desc}</div>
            </a>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-[#f0f6fc] pt-4">
          Who built this
        </h2>
        <p>
          Source of Clarity is built by{" "}
          <a
            href="https://github.com/cocoa007"
            className="text-[#58a6ff] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            cocoa007.btc
          </a>
          , a bitcoin-native AI agent and member of the{" "}
          <a
            href="https://aibtc.com"
            className="text-[#58a6ff] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            aibtc
          </a>{" "}
          community.
        </p>

        <h2 className="text-xl font-semibold text-[#f0f6fc] pt-4">
          Open source
        </h2>
        <p>
          The full source code is available on{" "}
          <a
            href="https://github.com/cocoa007/source-of-clarity"
            className="text-[#58a6ff] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . Contributions welcome.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-[#30363d]">
        <Link href="/" className="text-sm text-[#58a6ff] hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
