export interface ParsedAudit {
  title: string;
  date: string;
  deployer: string;
  blockHeight: number | null;
  sourceUrl: string;
  contractsAudited: string[];
  confidence: string;
  priorityScore: number | null;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  findings: ParsedFinding[];
  htmlContent: string;
}

export interface ParsedFinding {
  findingId: string;
  severity: string;
  title: string;
  location: string;
  description: string;
  impact: string;
  recommendation: string;
  codeSnippet: string;
}

function extractText(html: string, pattern: RegExp): string {
  const m = html.match(pattern);
  return m ? m[1].trim() : "";
}

function extractCount(html: string, severity: string): number {
  // Match summary cards like: <div class="summary-card critical"><div class="count">2</div>
  const re = new RegExp(
    `summary-card\\s+${severity}[^>]*>\\s*<div[^>]*class="count"[^>]*>(\\d+)</div>`,
    "i"
  );
  const m = html.match(re);
  return m ? parseInt(m[1], 10) : 0;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

export function parseAuditHtml(html: string, slug: string): ParsedAudit {
  const metaBlock = html.match(/<div class="meta">([\s\S]*?)<\/div>/);
  const meta = metaBlock ? metaBlock[1] : "";

  const date = extractText(meta, /Date:<\/strong>\s*(\d{4}-\d{2}-\d{2})/);
  const deployer = extractText(meta, /Deployer:<\/strong>\s*<code>([^<]+)<\/code>/);
  const blockHeightStr = extractText(meta, /block:<\/strong>\s*([\d,]+)/i);
  const blockHeight = blockHeightStr
    ? parseInt(blockHeightStr.replace(/,/g, ""), 10)
    : null;

  const sourceUrlMatch = meta.match(/Source:<\/strong>[^<]*<a href="([^"]+)"/);
  const sourceUrl = sourceUrlMatch ? sourceUrlMatch[1] : "";

  const contractsStr = extractText(meta, /Contracts:<\/strong>\s*([^<]+)/);
  const contractsAudited = contractsStr
    ? contractsStr.split(/\s*[·,]\s*/).map((s) => s.trim()).filter(Boolean)
    : [slug];

  const confidence = extractText(meta, /Confidence:<\/strong>\s*(\w+)/);
  const priorityStr = extractText(meta, /Priority Score:<\/strong>\s*([\d.]+)/);
  const priorityScore = priorityStr ? parseFloat(priorityStr) : null;

  const criticalCount = extractCount(html, "critical");
  const highCount = extractCount(html, "high");
  const mediumCount = extractCount(html, "medium");
  const lowCount = extractCount(html, "low");
  const infoCount = extractCount(html, "info");

  // Parse individual findings
  const findings: ParsedFinding[] = [];
  const findingRegex =
    /<div class="finding">([\s\S]*?)<\/div>\s*(?=<div class="finding">|<h2|$)/g;
  let findingMatch;
  while ((findingMatch = findingRegex.exec(html)) !== null) {
    const block = findingMatch[1];

    const severityMatch = block.match(
      /severity\s+(\w+)"[^>]*>[^<]*<\/span>\s*<strong>([^<]+)<\/strong>/
    );
    if (!severityMatch) continue;

    const severity = severityMatch[1].toLowerCase();
    const fullTitle = severityMatch[2];
    const idMatch = fullTitle.match(/^([A-Z]+-\d+):\s*(.*)/);
    const findingId = idMatch ? idMatch[1] : "";
    const title = idMatch ? idMatch[2] : fullTitle;

    const locationMatch = block.match(
      /Location:<\/strong>\s*([\s\S]*?)(?=<\/p>)/
    );
    const location = locationMatch ? stripTags(locationMatch[1]) : "";

    const impactMatch = block.match(
      /Impact:<\/strong>\s*([\s\S]*?)(?=<\/p>)/
    );
    const impact = impactMatch ? stripTags(impactMatch[1]) : "";

    const recMatch = block.match(
      /Recommendation:<\/strong>\s*([\s\S]*?)(?=<\/p>)/
    );
    const recommendation = recMatch ? stripTags(recMatch[1]) : "";

    const codeMatch = block.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
    const codeSnippet = codeMatch ? codeMatch[1].trim() : "";

    // Description: text after the header that isn't location/impact/rec
    const descParagraphs = block.match(
      /<p>(?!<strong>(?:Location|Impact|Recommendation))([\s\S]*?)<\/p>/g
    );
    const description = descParagraphs
      ? descParagraphs.map((p) => stripTags(p)).join("\n")
      : "";

    findings.push({
      findingId,
      severity,
      title,
      location,
      description,
      impact,
      recommendation,
      codeSnippet,
    });
  }

  // Extract body content (strip <html>, <head>, <style>)
  const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
  const htmlContent = bodyMatch ? bodyMatch[1] : html;

  return {
    title: extractText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/),
    date: date || "2026-01-01",
    deployer,
    blockHeight,
    sourceUrl,
    contractsAudited,
    confidence,
    priorityScore,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    findings,
    htmlContent,
  };
}

export function parseFindingsFromBodyHtml(bodyHtml: string): ParsedFinding[] {
  const findings: ParsedFinding[] = [];
  const findingRegex =
    /<div class="finding">([\s\S]*?)<\/div>\s*(?=<div class="finding">|<h2|$)/g;
  for (const findingMatch of bodyHtml.matchAll(findingRegex)) {
    const block = findingMatch[1];

    const severityMatch = block.match(
      /severity\s+(\w+)"[^>]*>[^<]*<\/span>\s*<strong>([^<]+)<\/strong>/
    );
    if (!severityMatch) continue;

    const severity = severityMatch[1].toLowerCase();
    const fullTitle = severityMatch[2];
    const idMatch = fullTitle.match(/^([A-Z]+-\d+):\s*(.*)/);
    const findingId = idMatch ? idMatch[1] : "";
    const title = idMatch ? idMatch[2] : fullTitle;

    const locationMatch = block.match(
      /Location:<\/strong>\s*([\s\S]*?)(?=<\/p>)/
    );
    const location = locationMatch ? stripTags(locationMatch[1]) : "";

    const impactMatch = block.match(
      /Impact:<\/strong>\s*([\s\S]*?)(?=<\/p>)/
    );
    const impact = impactMatch ? stripTags(impactMatch[1]) : "";

    const recMatch = block.match(
      /Recommendation:<\/strong>\s*([\s\S]*?)(?=<\/p>)/
    );
    const recommendation = recMatch ? stripTags(recMatch[1]) : "";

    const codeMatch = block.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
    const codeSnippet = codeMatch ? codeMatch[1].trim() : "";

    const descParagraphs = block.match(
      /<p>(?!<strong>(?:Location|Impact|Recommendation))([\s\S]*?)<\/p>/g
    );
    const description = descParagraphs
      ? descParagraphs.map((p) => stripTags(p)).join("\n")
      : "";

    findings.push({
      findingId,
      severity,
      title,
      location,
      description,
      impact,
      recommendation,
      codeSnippet,
    });
  }
  return findings;
}
