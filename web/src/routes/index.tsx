import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { ArticleList } from '../components/ArticleList';
import { useArticles } from '../hooks/useArticles';

export const Route = createFileRoute('/')({
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState('');
  const articlesQuery = useArticles(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Search news, analyze with AI
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Search recent articles, run a one-click summary + sentiment analysis, and stash the results.
        </p>
      </div>

      <SearchBar
        onSubmit={setQuery}
        loading={articlesQuery.isFetching && articlesQuery.isFetched}
      />

      <ArticleList
        query={query}
        articles={articlesQuery.data?.articles ?? []}
        isLoading={articlesQuery.isLoading}
        isError={articlesQuery.isError}
        error={articlesQuery.error as Error | null}
        onRetry={() => articlesQuery.refetch()}
      />
    </div>
  );
}
