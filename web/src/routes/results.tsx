import { createFileRoute } from '@tanstack/react-router';
import { ResultsTable } from '../components/ResultsTable';
import { useResults } from '../hooks/useResults';

export const Route = createFileRoute('/results')({
  component: ResultsPage,
});

function ResultsPage() {
  const { data, isLoading, isError, error, refetch } = useResults();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Stored analyses
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Every article you analyze gets persisted here, newest first.
        </p>
      </div>

      <ResultsTable
        results={data?.results ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
      />
    </div>
  );
}
