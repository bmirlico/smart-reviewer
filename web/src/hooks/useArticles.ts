import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useArticles(query: string) {
  return useQuery({
    queryKey: ['articles', query],
    queryFn: () => api.searchArticles(query),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });
}
