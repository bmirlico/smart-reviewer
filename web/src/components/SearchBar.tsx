import { Spinner } from './ui/Spinner';

type Props = {
  value: string;
  onChange: (next: string) => void;
  loading?: boolean;
};

export function SearchBar({ value, onChange, loading }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search news (e.g. AI regulation, climate policy, semiconductors…)"
        className="flex-1 bg-transparent border-0 px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        autoFocus
      />
      {loading && (
        <span className="flex items-center gap-1.5 pr-2 text-xs text-neutral-500">
          <Spinner className="h-4 w-4" /> Searching…
        </span>
      )}
    </div>
  );
}
