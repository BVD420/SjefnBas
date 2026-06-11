import { SourceChips } from "./SourceChips";
import type { SourceRef } from "@/lib/types";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
  isStreaming?: boolean;
};

export function MessageBubble({
  role,
  content,
  sources = [],
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] px-1 py-1 text-sm leading-relaxed ${
          isUser ? "text-right" : "text-left"
        }`}
      >
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-left ${
            isUser
              ? "bg-[var(--ea-primary)] text-white"
              : "bg-[var(--ea-surface)] text-[var(--ea-text)] ring-1 ring-[var(--ea-border)]"
          }`}
        >
          <p className="whitespace-pre-wrap">
            {content}
            {isStreaming && !content && (
              <span className="text-[var(--ea-text-muted)]">...</span>
            )}
          </p>
        </div>
        {!isUser && sources.length > 0 && (
          <div className="mt-1 max-w-full">
            <SourceChips sources={sources} />
          </div>
        )}
      </div>
    </div>
  );
}
