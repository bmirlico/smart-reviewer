export type Article = {
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  source: string | null;
  published_at: string | null;
};

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type Result = {
  id: string;
  url: string;
  title: string;
  source: string | null;
  published_at: string | null;
  summary: string;
  sentiment: Sentiment;
  created_at: string;
};
