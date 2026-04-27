import type { z } from 'zod';
import {
  type Article,
  ArticlesResponseSchema,
  ResultSchema,
  ResultsResponseSchema,
} from '../types';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return schema.parse(await res.json());
}

export const api = {
  searchArticles: (q: string) =>
    request(`/api/articles?q=${encodeURIComponent(q)}`, ArticlesResponseSchema),

  analyze: (article: Article) =>
    request(`/api/analyses`, ResultSchema, {
      method: 'POST',
      body: JSON.stringify(article),
    }),

  listResults: () => request(`/api/results`, ResultsResponseSchema),
};
