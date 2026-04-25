import { useState } from 'react';
import { SentimentBadge } from './SentimentBadge';
import { Button } from './ui/Button';
import { formatAbsoluteDate } from '../lib/date';
import type { Result } from '../types';

type Props = {
  results: Result[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
};

export function ResultsTable({ results, isLoading, isError, error, onRetry }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 border-b last:border-b-0 border-neutral-100 bg-neutral-100/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between gap-4">
        <span>{error?.message ?? 'Failed to load analyses.'}</span>
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
        <h3 className="font-medium text-neutral-900">No analyses yet</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Search for an article and click <strong>Analyze</strong> — it will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Sentiment</th>
            <th className="px-4 py-3 font-medium">Summary</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Analyzed</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <ResultRow key={r.id} result={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultRow({ result }: { result: Result }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <tr className="border-t border-neutral-100 hover:bg-neutral-50/60 align-top">
      <td className="px-4 py-3 max-w-xs">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-900 hover:text-indigo-700 line-clamp-2"
        >
          {result.title}
        </a>
      </td>
      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
        {result.source ?? '—'}
      </td>
      <td className="px-4 py-3">
        <SentimentBadge sentiment={result.sentiment} />
      </td>
      <td className="px-4 py-3 max-w-md text-neutral-700">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`text-left w-full ${expanded ? '' : 'line-clamp-2'} hover:text-neutral-900`}
          title={expanded ? 'Click to collapse' : 'Click to expand'}
        >
          {result.summary}
        </button>
      </td>
      <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">
        {formatAbsoluteDate(result.created_at)}
      </td>
    </tr>
  );
}
