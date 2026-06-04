import { cn } from "@/lib/utils";
import type { FileChange } from "@/lib/types";
import { FilePlus, FileMinus, FileEdit, FileX } from "lucide-react";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Go: "bg-cyan-400",
  Python: "bg-green-500",
  YAML: "bg-red-400",
  Markdown: "bg-gray-400",
  Shell: "bg-orange-400",
};

function StatusIcon({ status }: { status: FileChange["status"] }) {
  if (status === "added") return <FilePlus size={12} className="text-emerald-500" />;
  if (status === "deleted") return <FileX size={12} className="text-red-500" />;
  if (status === "modified") return <FileEdit size={12} className="text-blue-500" />;
  return <FileEdit size={12} className="text-muted-foreground" />;
}

export function FileChangeList({ files }: { files: FileChange[] }) {
  return (
    <div className="space-y-0.5">
      {files.map((file) => (
        <div
          key={file.path}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 hover:bg-accent transition-colors group"
        >
          <StatusIcon status={file.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {file.language && (
                <span
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    LANG_COLORS[file.language] ?? "bg-muted-foreground"
                  )}
                />
              )}
              <span className="text-xs font-mono text-foreground truncate">{file.path}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {file.additions > 0 && (
              <span className="text-[10px] font-medium text-emerald-500">+{file.additions}</span>
            )}
            {file.deletions > 0 && (
              <span className="text-[10px] font-medium text-red-500">−{file.deletions}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
