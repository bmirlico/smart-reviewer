import { useEffect, useState } from 'react';

// Returns `value` only after it has stayed stable for `delayMs`. Each new
// value resets the timer; if it changes again before the delay elapses,
// the previous timeout is cleared and never fires.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
