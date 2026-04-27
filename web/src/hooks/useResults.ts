import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useResults() {
  return useQuery({
    queryKey: ['results'],
    queryFn: api.listResults,
  });
}
