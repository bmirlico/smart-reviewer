import { ArticleCard } from './ArticleCard';
import { Button } from './ui/Button';
import type { Article } from '../types';

type Props = {
  query: string;
  articles: Article[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
};

export function ArticleList({
  query,
  articles,
  isLoading,
  isError,
  error,
  onRetry,
}: Props) {
  if (query.trim().length === 0) {
    return (
      <EmptyState
        title="Search for articles to get started"
        body="Type a topic above and hit search. The most recent ten matching articles will show up here."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg bg-neutral-200/70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between gap-4">
        <span>{error?.message ?? 'Something went wrong while fetching articles.'}</span>
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        title="No articles found"
        body={`We couldn't find any results for "${query}". Try a different search term.`}
      />
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((a) => (
        <ArticleCard key={a.url} article={a} />
      ))}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
      <h3 className="font-medium text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{body}</p>
    </div>
  );
}
