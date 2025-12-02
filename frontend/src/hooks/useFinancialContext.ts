import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financialContextApi, getSessionId } from '@/services/api';
import { FinancialContext } from '@/types';

export const useFinancialContext = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['financial-context'],
    queryFn: financialContextApi.get,
    enabled: !!getSessionId(),
    retry: 1,
  });

  const saveMutation = useMutation({
    mutationFn: (context: FinancialContext) => financialContextApi.save(context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-context'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] }); // Aggregation may change
      // Force refetch to ensure immediate update
      queryClient.refetchQueries({ queryKey: ['financial-context'] });
    },
  });

  return {
    financialContext: data?.financialContext || null,
    isLoading,
    error,
    save: saveMutation.mutate,
    saveAsync: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
};

