import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";

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
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-card">
            <TableHead>Function</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Args</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {functions.map((fn, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono text-card-foreground">{fn.name}</TableCell>
              <TableCell className={ACCESS_COLORS[fn.access] || ""}>
                {fn.access}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {Array.isArray(fn.args)
                  ? (fn.args as { name: string; type: string }[])
                      .map((a) => `${a.name}: ${a.type}`)
                      .join(", ")
                  : "\u2014"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
