import { useState, type FormEvent } from 'react';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

type Props = {
  onSubmit: (query: string) => void;
  loading?: boolean;
};

export function SearchBar({ onSubmit, loading }: Props) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search news (e.g. AI regulation, climate policy, semiconductors…)"
        className="flex-1 bg-transparent border-0 px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        autoFocus
      />
      <Button type="submit" disabled={loading || value.trim().length === 0}>
        {loading ? (
          <>
            <Spinner className="h-4 w-4" /> Searching…
          </>
        ) : (
          'Search'
        )}
      </Button>
    </form>
  );
}
