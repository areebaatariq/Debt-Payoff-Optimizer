import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api';

export const useAIGuidance = () => {
  const guidanceMutation = useMutation({
    mutationFn: (params: { action?: string; scenario?: any }) =>
      aiApi.getGuidance(params),
  });

  return {
    getGuidance: guidanceMutation.mutate,
    getGuidanceAsync: guidanceMutation.mutateAsync,
    guidance: guidanceMutation.data?.guidance || null,
    isLoading: guidanceMutation.isPending,
    error: guidanceMutation.error,
  };
};


