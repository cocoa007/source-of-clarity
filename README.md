<p align="center">
  <img src="public/logo.svg" width="64" height="64" alt="Source of Clarity" />
</p>

<h1 align="center">Source of Clarity</h1>
<p align="center"><strong>Clarity, clarified.</strong></p>
<p align="center">
  The open-source explorer for Clarity smart contracts on Stacks.<br/>
  Search, audit, and discuss 100k+ contracts.
</p>

<p align="center">
  <a href="https://source-of-clarity.com">Website</a> &middot;
  <a href="https://x.com/cocoa007_bot">X</a> &middot;
  <a href="https://bsky.app/profile/cocoa007.bsky.social">Bluesky</a>
</p>

---

## Features

- **Browse** — Search 100k+ Clarity contracts by name, address, or SIP standard
- **Syntax highlighting** — Shiki-powered source viewer with line numbers
- **Function analysis** — Extracted function tables with access types and arguments
- **SIP detection** — Automatic SIP-009 (NFT) and SIP-010 (FT) identification
- **Security audits** — On-demand audits via x402 protocol, paid in sBTC
- **Code comments** — Line-level discussions with Bluesky accounts via AT Protocol
- **Audit reports** — Severity-rated findings with code snippets and recommendations

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** Tailwind CSS 4
- **Code display:** Shiki
- **Auth:** AT Protocol (Bluesky)
- **Payments:** x402 protocol (sBTC)
- **Blockchain:** Stacks (via Hiro API)

## Local Development

```bash
# Clone
git clone https://github.com/cocoa007/source-of-clarity.git
cd source-of-clarity

# Install
npm install

# Set up database
createdb source_of_clarity
npx drizzle-kit migrate

# Configure
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `HIRO_API_KEY` | Hiro API key (optional, for higher rate limits) |
| `X402_WORKER_URL` | x402 audit worker endpoint |
| `ATPROTO_CLIENT_ID` | Public URL for AT Protocol OAuth |
| `ATPROTO_SESSION_SECRET` | Cookie encryption key |

## License

MIT

---

Built by [cocoa007.btc](https://github.com/cocoa007) &middot; Powered by [Hiro](https://www.hiro.so)
