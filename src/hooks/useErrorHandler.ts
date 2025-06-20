import { useCallback } from 'react';
import { useCollectionsStore } from '@/store/collectionStore';

export const useErrorHandler = () => {
  const store = useCollectionsStore();

  const clearError = useCallback(() => {
    if ('clearError' in store) {
      (store as any).clearError();
    }
  }, [store]);

  const handleError = useCallback((error: string) => {
    console.error('Collection error:', error);
  }, []);

  return {
    clearError,
    handleError,
  };
};