import { z } from 'zod';

// Domain schemas — single source of truth for both runtime validation
// (in api/client.ts) and TypeScript types (inferred below).
//
// If the backend ever drifts from this shape, `schema.parse()` throws at the
// network boundary instead of letting `undefined` propagate silently into the UI.

export const SentimentSchema = z.enum(['positive', 'neutral', 'negative']);

export const ArticleSchema = z.object({
  url: z.url(),
  title: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  source: z.string().nullable(),
  published_at: z.string().nullable(),
});

export const ResultSchema = z.object({
  id: z.string(),
  url: z.url(),
  title: z.string(),
  source: z.string().nullable(),
  published_at: z.string().nullable(),
  summary: z.string(),
  sentiment: SentimentSchema,
  created_at: z.string(),
});

// Response envelopes
export const ArticlesResponseSchema = z.object({ articles: z.array(ArticleSchema) });
export const ResultsResponseSchema = z.object({ results: z.array(ResultSchema) });

// Inferred TS types — components keep importing { Article, Result, Sentiment }
// just like before; they don't need to know schemas exist.
export type Sentiment = z.infer<typeof SentimentSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Result = z.infer<typeof ResultSchema>;
