import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SearchBar } from '../components/SearchBar';
import { ArticleList } from '../components/ArticleList';
import { useArticles } from '../hooks/useArticles';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const searchSchema = z.object({
  q: z.string().optional().default(''),
});

export const Route = createFileRoute('/')({
  component: SearchPage,
  validateSearch: searchSchema,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();

  // URL updates per keystroke; debounce protects the fetch from spam.
  const debouncedQ = useDebouncedValue(q, 300);
  const articlesQuery = useArticles(debouncedQ);

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
        value={q}
        onChange={(next) =>
          navigate({ search: { q: next }, replace: true })
        }
        loading={articlesQuery.isFetching && articlesQuery.isFetched}
      />

      <ArticleList
        query={debouncedQ}
        articles={articlesQuery.data?.articles ?? []}
        isLoading={articlesQuery.isLoading}
        isError={articlesQuery.isError}
        error={articlesQuery.error as Error | null}
        onRetry={() => articlesQuery.refetch()}
      />
    </div>
  );
}
