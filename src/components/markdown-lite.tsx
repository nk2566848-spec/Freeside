import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-medium">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={index} className="rounded-sm bg-subtle px-1 font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function Prose({ text }: { text: string }) {
  const lines = text.replace(/\n$/, "").split("\n");
  const blocks: ReactNode[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  function flush() {
    if (!list) return;
    const items = list.items;
    const type = list.type;
    blocks.push(
      type === "ul" ? (
        <ul key={blocks.length} className="list-disc space-y-1 pl-5">
          {items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      ) : (
        <ol key={blocks.length} className="list-decimal space-y-1 pl-5">
          {items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ol>
      ),
    );
    list = null;
  }

  for (const line of lines) {
    const bullet = /^(?:[-*])\s+(.*)/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)/.exec(line);
    if (bullet) {
      if (list?.type !== "ul") {
        flush();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1] ?? "");
      continue;
    }
    if (numbered) {
      if (list?.type !== "ol") {
        flush();
        list = { type: "ol", items: [] };
      }
      list.items.push(numbered[1] ?? "");
      continue;
    }
    flush();
    if (!line.trim()) continue;
    blocks.push(
      <p key={blocks.length} className="text-pretty">
        {renderInline(line)}
      </p>,
    );
  }
  flush();

  return <div className="space-y-3">{blocks}</div>;
}

export function MarkdownLite({ text }: { text: string }) {
  const pieces = text.split("```");
  return (
    <div className="space-y-3 text-base leading-relaxed">
      {pieces.map((piece, index) => {
        if (index % 2 === 1) {
          const newline = piece.indexOf("\n");
          const code = newline === -1 ? piece : piece.slice(newline + 1);
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-lg bg-subtle p-3 font-mono text-sm leading-relaxed"
            >
              <code>{code.replace(/\n$/, "")}</code>
            </pre>
          );
        }
        if (!piece.trim()) return null;
        return <Prose key={index} text={piece} />;
      })}
    </div>
  );
}
