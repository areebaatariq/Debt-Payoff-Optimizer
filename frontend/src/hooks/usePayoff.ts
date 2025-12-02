import { useMutation } from '@tanstack/react-query';
import { payoffApi } from '@/services/api';

export const usePayoff = () => {
  const simulateMutation = useMutation({
    mutationFn: (params: {
      strategy: 'avalanche' | 'snowball' | 'custom';
      monthlyPayment: number;
    }) => payoffApi.simulate(params),
  });

  return {
    simulate: simulateMutation.mutate,
    simulateAsync: simulateMutation.mutateAsync,
    scenario: simulateMutation.data,
    isSimulating: simulateMutation.isPending,
    simulationError: simulateMutation.error,
  };
};


