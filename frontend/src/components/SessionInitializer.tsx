import { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';

export const SessionInitializer = () => {
  const { isLoading } = useSession();

  // Initialize session on mount
  useEffect(() => {
    // Session is initialized via useSession hook
  }, []);

  // You can show a loading spinner here if needed
  if (isLoading) {
    return null; // or return a loading spinner
  }

  return null;
};


