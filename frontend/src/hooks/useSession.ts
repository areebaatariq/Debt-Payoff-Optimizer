import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionApi, getSessionId } from '@/services/api';

export const useSession = () => {
  const queryClient = useQueryClient();
  const existingSessionId = getSessionId();

  const { data, isLoading, error } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      // If we have a session ID, verify it's still valid
      if (existingSessionId) {
        try {
          await sessionApi.get(existingSessionId);
          return { sessionId: existingSessionId };
        } catch (err) {
          // Session expired or invalid, create a new one
          const result = await sessionApi.create();
          return result;
        }
      }
      // Create new session
      const result = await sessionApi.create();
      return result;
    },
    staleTime: Infinity, // Session doesn't change until expiry
    retry: 1,
  });

  const refreshSession = async () => {
    await queryClient.invalidateQueries({ queryKey: ['session'] });
  };

  return {
    sessionId: data?.sessionId || existingSessionId,
    isLoading,
    error,
    refreshSession,
  };
};




