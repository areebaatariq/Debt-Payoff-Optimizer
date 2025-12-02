import { useQuery } from '@tanstack/react-query';
import { recommendationsApi, getSessionId } from '@/services/api';

export const useRecommendations = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: recommendationsApi.getAll,
    enabled: !!getSessionId(),
    retry: 1,
  });

  return {
    recommendations: data?.recommendations || [],
    count: data?.count || 0,
    isLoading,
    error,
    refetch,
  };
};

