import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debtsApi, getSessionId } from '@/services/api';
import { DebtTradeline } from '@/types';

export const useDebts = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['debts'],
    queryFn: debtsApi.getAll,
    enabled: !!getSessionId(),
    retry: 1,
  });

  const addMutation = useMutation({
    mutationFn: (debt: Omit<DebtTradeline, 'id'>) => debtsApi.add(debt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['aggregation'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, debt }: { id: string; debt: Partial<DebtTradeline> }) =>
      debtsApi.update(id, debt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['aggregation'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => debtsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['aggregation'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const uploadCSVMutation = useMutation({
    mutationFn: (file: File) => debtsApi.uploadCSV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['aggregation'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  return {
    debts: data?.debts || [],
    aggregation: data?.aggregation || null,
    isLoading,
    error,
    add: addMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    uploadCSV: uploadCSVMutation.mutate,
    addAsync: addMutation.mutateAsync,
    updateAsync: updateMutation.mutateAsync,
    deleteAsync: deleteMutation.mutateAsync,
    uploadCSVAsync: uploadCSVMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploading: uploadCSVMutation.isPending,
    addError: addMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    uploadError: uploadCSVMutation.error,
  };
};

