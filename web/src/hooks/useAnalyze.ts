import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Article } from '../types';

export function useAnalyze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (article: Article) => api.analyze(article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}
