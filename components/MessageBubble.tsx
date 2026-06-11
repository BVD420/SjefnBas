import { SourceChips } from "./SourceChips";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
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
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#1a4d8f] text-white"
            : "border border-slate-200 bg-white text-slate-800 shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#1a4d8f]" />
          )}
        </p>
        {!isUser && <SourceChips sources={sources} />}
      </div>
    </div>
  );
}
