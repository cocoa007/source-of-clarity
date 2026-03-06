interface FnRow {
  name: string;
  access: string;
  args: unknown;
  returnType: string | null;
}

const ACCESS_COLORS: Record<string, string> = {
  public: "text-[#3fb950]",
  "read-only": "text-[#58a6ff]",
  private: "text-[#8b949e]",
};

export default function FunctionTable({ functions }: { functions: FnRow[] }) {
  if (functions.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-[#30363d]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#30363d] bg-[#161b22]">
            <th className="px-4 py-2 text-left font-medium text-[#8b949e]">Function</th>
            <th className="px-4 py-2 text-left font-medium text-[#8b949e]">Access</th>
            <th className="px-4 py-2 text-left font-medium text-[#8b949e]">Args</th>
          </tr>
        </thead>
        <tbody>
          {functions.map((fn, i) => (
            <tr key={i} className="border-b border-[#30363d] last:border-0">
              <td className="px-4 py-2 font-mono text-[#f0f6fc]">{fn.name}</td>
              <td className={`px-4 py-2 ${ACCESS_COLORS[fn.access] || ""}`}>
                {fn.access}
              </td>
              <td className="px-4 py-2 text-[#8b949e]">
                {Array.isArray(fn.args)
                  ? (fn.args as { name: string; type: string }[])
                      .map((a) => `${a.name}: ${a.type}`)
                      .join(", ")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
