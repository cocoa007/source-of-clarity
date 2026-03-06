import { codeToHtml } from "shiki";

export default async function ContractSource({ source }: { source: string }) {
  const html = await codeToHtml(source, {
    lang: "lisp",
    theme: "github-dark",
  });

  return (
    <div
      className="overflow-x-auto rounded-lg border border-[#30363d] text-sm [&_pre]:!bg-[#0d1117] [&_pre]:p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
