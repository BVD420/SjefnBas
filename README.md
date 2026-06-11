# Erasmus Airways RAG Support Chatbot

RAG-powered customer support chatbot for the Erasmus Airways buildathon case. Answers passenger questions using only retrieved policy documents and live notices, with streaming responses and source citations.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Supabase Postgres + pgvector** for vector storage
- **Voyage AI** (`voyage-3.5-lite`) for embeddings
- **OpenAI** (`gpt-4o-mini`) for streamed answers

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|----------|-----------------|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `VOYAGE_API_KEY` | [voyageai.com](https://www.voyageai.com) (free tier) |
| `DATABASE_URL` | Supabase → Project Settings → Database → **Transaction pooler** (port 6543) |

### 3. Create the database table

In Supabase **SQL Editor**, run the script in [`supabase/schema.sql`](supabase/schema.sql):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chunks (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1024)
);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), expand **Knowledge base**, and click **Load airline knowledge**. Then ask questions in the chat.

## Deploy to Vercel

**Production URL:** [https://sjefn-bas.vercel.app](https://sjefn-bas.vercel.app)

The app is deployed, but you still need to add environment variables in the [Vercel project settings](https://vercel.com/bassievd/sjefn-bas/settings/environment-variables):

- `OPENAI_API_KEY`
- `VOYAGE_API_KEY`
- `DATABASE_URL`

After adding them, redeploy (or trigger a new deploy from the dashboard). Then open the app, click **Load airline knowledge**, and start chatting.

### Run demo validation locally

With `.env.local` configured and `npm run dev` running:

```bash
npm run test:rag
```

This ingests all 12 documents and runs the 4 buildathon test questions.

## Demo questions (from the case)

1. *My flight was delayed 2.5 hours — am I entitled to compensation?*
2. *My Tel Aviv flight was rerouted due to airspace restrictions and arrived 3.5 hours late — do I get EU261 compensation?*
3. *Erasmus Airways cancelled my flight 10 days before departure — what are my options?*
4. *What is Erasmus Airways' policy on bereavement cancellations?* (should answer "I don't know")

## Project structure

```
app/
  api/ingest/   POST — chunk, embed, store all 12 documents
  api/chat/     POST — retrieve chunks, stream GPT answer
components/     Chat UI, message bubbles, source chips
lib/            Database, chunking, Voyage embeddings, document loader
policy files/   6 stable policy documents
live files/     6 time-sensitive notices
```
