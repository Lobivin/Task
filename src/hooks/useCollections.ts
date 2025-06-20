import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCollectionsStore } from '@/store/collectionStore';
import { useAuth } from './useAuth';

export const useCollections = () => {
  const { status } = useSession();
  const { isAuthenticated, accessToken, isHydrated } = useAuth();
  const {
    collections,
    loading,
    error,
    fetchCollections: storeFetchCollections,
    reorderCollections,
  } = useCollectionsStore();

  const fetchAttempted = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCollections = useCallback(() => {
    if (!isMounted.current) return;

    if (isHydrated && (status === 'authenticated' || isAuthenticated)) {
      const hasToken = typeof window !== 'undefined' &&
          (localStorage.getItem('accessToken') || accessToken);

      if (hasToken && !fetchAttempted.current) {
        console.log('useCollections: Fetching collections');
        fetchAttempted.current = true;
        storeFetchCollections();
      }
    }
  }, [status, isAuthenticated, accessToken, isHydrated, storeFetchCollections]);

  useEffect(() => {
    if (!isHydrated) return;

    const currentAuthState = status === 'authenticated' || isAuthenticated;

    if (currentAuthState && !fetchAttempted.current) {
      const hasToken = typeof window !== 'undefined' &&
          (localStorage.getItem('accessToken') || accessToken);

      if (hasToken) {
        const timer = setTimeout(() => {
          if (isMounted.current) {
            console.log('useCollections: Initial fetch triggered');
            fetchCollections();
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }

    if (!currentAuthState) {
      fetchAttempted.current = false;
    }
  }, [status, isAuthenticated, accessToken, isHydrated, fetchCollections]);

  const handleReorder = useCallback((sourceIndex: number, destinationIndex: number) => {
    reorderCollections(sourceIndex, destinationIndex);
  }, [reorderCollections]);

  const refreshCollections = useCallback(() => {
    if (!isMounted.current) return Promise.resolve();

    console.log('useCollections: Manual refresh');
    fetchAttempted.current = false;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (isMounted.current) {
          fetchAttempted.current = true;
          storeFetchCollections().finally(() => resolve());
        } else {
          resolve();
        }
      }, 0);
    });
  }, [storeFetchCollections]);

  return {
    collections,
    loading,
    error,
    handleReorder,
    refreshCollections,
  };
};