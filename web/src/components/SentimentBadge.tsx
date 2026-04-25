import type { Sentiment } from '../types';

const styles: Record<Sentiment, string> = {
  positive: 'bg-green-100 text-green-800 ring-green-600/20',
  neutral: 'bg-neutral-100 text-neutral-800 ring-neutral-600/20',
  negative: 'bg-red-100 text-red-800 ring-red-600/20',
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${styles[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}
