type FlowStepProps = {
  number: number;
  title: string;
  description: string;
  badge?: string;
  accent?: "navy" | "blue" | "gold" | "emerald";
};

const accentStyles = {
  navy: "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540]",
  blue: "border-[#1a4d8f] bg-[#1a4d8f]/5 text-[#1a4d8f]",
  gold: "border-[#c9a227] bg-[#c9a227]/10 text-[#7a6318]",
  emerald: "border-emerald-600 bg-emerald-50 text-emerald-800",
};

function FlowStep({
  number,
  title,
  description,
  badge,
  accent = "blue",
}: FlowStepProps) {
  return (
    <div
      className={`relative rounded-2xl border-2 p-4 ${accentStyles[accent]}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {badge && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-6 w-0.5 bg-slate-300" />
      <svg
        className="h-4 w-4 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
      {label && (
        <span className="mt-1 text-xs font-medium text-slate-500">{label}</span>
      )}
    </div>
  );
}

function HorizontalArrow() {
  return (
    <div className="hidden items-center px-1 md:flex">
      <svg
        className="h-5 w-8 text-slate-300"
        viewBox="0 0 32 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 10h24M22 4l8 6-8 6" />
      </svg>
    </div>
  );
}

export function FlowDiagram() {
  return (
    <div className="space-y-8 px-4 py-6">
      <section>
        <h2 className="text-lg font-semibold text-[#0a2540]">
          What is RAG?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          <strong>Retrieval-Augmented Generation</strong> means the chatbot
          never guesses from memory. It searches your airline documents first,
          then GPT writes an answer using only what was found — with source
          citations.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
          Phase 1 — One-time setup
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0a2540]">
          Load knowledge into Supabase
        </h2>

        <div className="mt-5 space-y-0">
          <FlowStep
            number={1}
            title="12 airline documents"
            description="6 stable policies (baggage, refunds, EU261…) and 6 live notices (strikes, Schiphol, Middle East routes)."
            badge="policy files + live files"
            accent="navy"
          />
          <Arrow />
          <FlowStep
            number={2}
            title="Chunk the text"
            description="Each document is split into ~800-character overlapping pieces so retrieval can find the exact relevant paragraph."
            accent="blue"
          />
          <Arrow />
          <FlowStep
            number={3}
            title="Embed with Voyage AI"
            description="Each chunk is turned into a 1,024-number vector (embedding) that captures its meaning. We use Voyage for embeddings (separate from OpenAI chat)."
            badge="Voyage voyage-3.5-lite"
            accent="gold"
          />
          <Arrow />
          <FlowStep
            number={4}
            title="Store in Supabase"
            description="Chunks + vectors are saved in a Postgres table with the pgvector extension. Ready for semantic search."
            badge="Supabase pgvector"
            accent="emerald"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
          Phase 2 — Every question
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0a2540]">
          Answer a passenger question
        </h2>

        <div className="mt-5 md:hidden space-y-0">
          <FlowStep
            number={1}
            title="Passenger asks a question"
            description='e.g. "My flight was delayed 2.5 hours — am I entitled to compensation?"'
            accent="navy"
          />
          <Arrow label="embed question" />
          <FlowStep
            number={2}
            title="Voyage embeds the question"
            description="The question becomes the same kind of vector as the stored chunks."
            badge="Voyage (query mode)"
            accent="gold"
          />
          <Arrow label="cosine similarity" />
          <FlowStep
            number={3}
            title="Find top 4 closest chunks"
            description="Supabase compares the question vector to all stored chunks and returns the most semantically similar passages."
            badge="Supabase vector search"
            accent="emerald"
          />
          <Arrow label="context + question" />
          <FlowStep
            number={4}
            title="GPT generates the answer"
            description={'GPT reads only those chunks and streams a reply. If the answer is not in the context, it says "I don\'t know" instead of hallucinating.'}
            badge="GPT-4o mini"
            accent="blue"
          />
          <Arrow />
          <FlowStep
            number={5}
            title="Answer + source citations"
            description="The UI shows the streamed response with badges naming which documents were used (e.g. eu261_compensation, middle_east_routes)."
            accent="navy"
          />
        </div>

        <div className="mt-5 hidden md:flex md:items-stretch md:gap-0">
          <div className="flex flex-1 flex-col justify-center">
            <FlowStep
              number={1}
              title="Question"
              description="Passenger types a support question in the chat."
              accent="navy"
            />
          </div>
          <HorizontalArrow />
          <div className="flex flex-1 flex-col justify-center">
            <FlowStep
              number={2}
              title="Embed"
              description="Voyage converts the question to a vector."
              badge="Voyage"
              accent="gold"
            />
          </div>
          <HorizontalArrow />
          <div className="flex flex-1 flex-col justify-center">
            <FlowStep
              number={3}
              title="Retrieve"
              description="Supabase returns the 4 closest document chunks."
              badge="pgvector"
              accent="emerald"
            />
          </div>
          <HorizontalArrow />
          <div className="flex flex-1 flex-col justify-center">
            <FlowStep
              number={4}
              title="Generate"
              description="GPT answers from context only, with citations."
              badge="OpenAI"
              accent="blue"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-base font-semibold text-amber-900">
          The planted trap: policies vs live notices
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Half the documents are stable policies; half are time-sensitive live
          notices that can override them (e.g. refunds policy says
          non-refundable, but the Schiphol notice grants refunds for
          airline-initiated rebookings). The bot doesn&apos;t know the
          difference unless retrieval surfaces the right notice — that&apos;s
          why the advanced track tests policy conflicts.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-white p-3 text-sm">
            <p className="font-medium text-slate-800">Policy</p>
            <p className="mt-1 text-slate-600">
              04_refunds — standard fares non-refundable
            </p>
          </div>
          <div className="rounded-xl border border-amber-300 bg-white p-3 text-sm">
            <p className="font-medium text-slate-800">Live notice overrides</p>
            <p className="mt-1 text-slate-600">
              10_schiphol — full refund if rebooked without consent
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-[#0a2540]">Tech stack</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Next.js",
            "Voyage AI",
            "Supabase pgvector",
            "OpenAI GPT",
            "Vercel",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
