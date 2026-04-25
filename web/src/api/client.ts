import type { Article, Result } from '../types';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  searchArticles: (q: string) =>
    request<{ articles: Article[] }>(`/api/articles?q=${encodeURIComponent(q)}`),

  analyze: (article: Article) =>
    request<Result>(`/api/analyses`, {
      method: 'POST',
      body: JSON.stringify(article),
    }),

  listResults: () => request<{ results: Result[] }>(`/api/results`),
};
