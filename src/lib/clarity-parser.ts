export interface ClarityFunction {
  name: string;
  access: "public" | "read-only" | "private";
  args: { name: string; type: string }[];
  returnType: string | null;
}

export interface ParseResult {
  functions: ClarityFunction[];
  sip009: boolean;
  sip010: boolean;
}

const FUNCTION_RE =
  /\(define-(public|read-only|private)\s+\(([a-zA-Z0-9_!?<>-]+)((?:\s+\([^)]+\))*)\)/g;
const ARG_RE = /\(([a-zA-Z0-9_!?<>-]+)\s+([^)]+)\)/g;

const SIP009_MARKERS = [
  "sip009-nft-trait",
  "nft-trait",
  "get-last-token-id",
  "get-token-uri",
  "get-owner",
  "transfer",
];

const SIP010_MARKERS = [
  "sip010-ft-trait",
  "ft-trait",
  "get-name",
  "get-symbol",
  "get-decimals",
  "get-balance",
  "get-total-supply",
  "transfer",
];

function detectSip(source: string, markers: string[], threshold: number): boolean {
  const lower = source.toLowerCase();
  const matches = markers.filter((m) => lower.includes(m));
  return matches.length >= threshold;
}

export function parseClaritySource(source: string): ParseResult {
  const functions: ClarityFunction[] = [];

  let match;
  while ((match = FUNCTION_RE.exec(source)) !== null) {
    const access = match[1] as ClarityFunction["access"];
    const name = match[2];
    const argsRaw = match[3];

    const args: { name: string; type: string }[] = [];
    let argMatch;
    const argRe = new RegExp(ARG_RE.source, "g");
    while ((argMatch = argRe.exec(argsRaw)) !== null) {
      args.push({ name: argMatch[1], type: argMatch[2].trim() });
    }

    functions.push({ name, access, args, returnType: null });
  }

  return {
    functions,
    sip009: detectSip(source, SIP009_MARKERS, 4),
    sip010: detectSip(source, SIP010_MARKERS, 5),
  };
}
