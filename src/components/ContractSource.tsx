import { createHighlighter, type ShikiTransformer } from "shiki";
import clarityGrammar from "@/lib/clarity.tmLanguage.json";

const lineNumberTransformer: ShikiTransformer = {
  line(node, line) {
    node.properties["data-line"] = line;
  },
};

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: [
        {
          name: "clarity",
          scopeName: "source.clar",
          patterns: clarityGrammar.patterns as never,
          repository: clarityGrammar.repository as never,
        },
      ],
    });
  }
  return highlighterPromise;
}

export default async function ContractSource({ source }: { source: string }) {
  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(source, {
    lang: "clarity",
    theme: "github-dark",
    transformers: [lineNumberTransformer],
  });

  return (
    <div
      className="contract-source overflow-x-auto rounded-lg border border-[#30363d] text-sm [&_pre]:!bg-[#0d1117] [&_pre]:p-4 [&_pre]:pl-0 [&_.line]:pl-14 [&_.line]:relative [&_.line]:before:absolute [&_.line]:before:left-0 [&_.line]:before:w-10 [&_.line]:before:pr-2 [&_.line]:before:text-right [&_.line]:before:text-[#484f58] [&_.line]:before:content-[attr(data-line)] [&_.line]:before:select-none [&_.line]:before:inline-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
