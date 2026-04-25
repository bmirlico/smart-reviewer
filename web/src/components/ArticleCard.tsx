import { useState } from 'react';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { useAnalyze } from '../hooks/useAnalyze';
import { formatRelativeDate } from '../lib/date';
import type { Article } from '../types';

type Props = { article: Article };

export function ArticleCard({ article }: Props) {
  const analyze = useAnalyze();
  const [imgError, setImgError] = useState(false);
  const [justAnalyzed, setJustAnalyzed] = useState(false);

  async function handleClick() {
    try {
      await analyze.mutateAsync(article);
      setJustAnalyzed(true);
      setTimeout(() => setJustAnalyzed(false), 2500);
    } catch {
      // error surfaces via analyze.error below
    }
  }

  return (
    <article className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden flex">
      <div className="w-40 sm:w-48 shrink-0 bg-gradient-to-br from-indigo-500 to-fuchsia-500">
        {article.image && !imgError ? (
          <img
            src={article.image}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-900 hover:text-indigo-700 line-clamp-2"
        >
          {article.title}
        </a>

        <div className="text-xs text-neutral-500">
          {article.source ?? 'Unknown source'}
          {article.published_at ? (
            <>
              {' · '}
              {formatRelativeDate(article.published_at)}
            </>
          ) : null}
        </div>

        {article.description ? (
          <p className="text-sm text-neutral-600 line-clamp-3">
            {article.description}
          </p>
        ) : null}

        {analyze.isError ? (
          <p className="text-xs text-red-700">
            {(analyze.error as Error)?.message ?? 'Analysis failed'}
          </p>
        ) : null}

        <div className="mt-auto pt-2 flex justify-end">
          <Button
            onClick={handleClick}
            disabled={analyze.isPending}
            variant={justAnalyzed ? 'secondary' : 'primary'}
          >
            {analyze.isPending ? (
              <>
                <Spinner className="h-4 w-4" /> Analyzing…
              </>
            ) : justAnalyzed ? (
              'Analyzed ✓'
            ) : (
              'Analyze'
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
