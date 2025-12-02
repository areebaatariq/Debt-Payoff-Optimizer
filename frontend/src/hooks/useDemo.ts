import { useMutation, useQueryClient } from '@tanstack/react-query';
import { demoApi, sessionApi, getSessionId } from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';
import { useAppContext } from '@/contexts/AppContext';
import { useSession } from './useSession';

export const useDemo = () => {
  const queryClient = useQueryClient();
  const { setFinancialContext } = useAppContext();
  const { sessionId, isLoading: isSessionLoading } = useSession();

  const loadMutation = useMutation({
    mutationFn: async () => {
      // Ensure we have a session before loading demo data
      let currentSessionId = getSessionId();
      
      if (!currentSessionId) {
        // Create a session if one doesn't exist
        const session = await sessionApi.create();
        currentSessionId = session.sessionId;
      }
      
      // Now load the demo data
      return demoApi.load();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial-context'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      // Set financial context to trigger dashboard view
      if (data.financialContext) {
        await setFinancialContext(data.financialContext);
      }
      showSuccess('Demo dataset loaded successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to load demo data';
      console.error('Demo load error:', error);
      showError(errorMessage);
    },
  });

  return {
    loadDemo: loadMutation.mutateAsync,
    isLoading: loadMutation.isPending || isSessionLoading,
    error: loadMutation.error,
  };
};

