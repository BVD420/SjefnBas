type SourceChipsProps = {
  sources: string[];
};

export function SourceChips({ sources }: SourceChipsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((source) => (
        <span
          key={source}
          className="rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 px-2.5 py-0.5 text-xs font-medium text-[#0a2540]"
        >
          {source.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}
