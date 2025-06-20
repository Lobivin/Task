import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCollectionsStore } from '@/store/collectionStore';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';

export const useCollectionEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { status } = useSession();

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [changedProducts, setChangedProducts] = useState<Product[]>([]);
  const initialOrderRef = useRef<string[]>([]);

  const {
    selectedCollection,
    orderedProducts,
    filters,
    selectedFilters,
    loading,
    error,
    meta,
    fetchCollections,
    selectCollection,
    addFilter,
    removeFilter,
    clearFilters,
    updateProductOrder,
    saveCollectionOrder,
    setPage
  } = useCollectionsStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated && status !== 'authenticated') {
      router.push('/login');
      return;
    }
    if (isAuthenticated || status === 'authenticated') {
      fetchCollections();
    }
  }, [isAuthenticated, status, authLoading, fetchCollections, router]);

  useEffect(() => {
    if (id && (isAuthenticated || status === 'authenticated')) {
      const collectionId = parseInt(id as string, 10);
      if (!isNaN(collectionId)) {
        selectCollection(collectionId);
      }
    }
  }, [id, isAuthenticated, status, selectCollection]);

  useEffect(() => {
    if (orderedProducts.length > 0 && initialOrderRef.current.length === 0) {
      initialOrderRef.current = orderedProducts.map(p => p.productCode);
      setAvailableProducts(orderedProducts);
    }
  }, [orderedProducts]);

  useEffect(() => {
    if (initialOrderRef.current.length === 0) return;
    const prevOrder = initialOrderRef.current;
    const currOrder = orderedProducts.map(p => p.productCode);
    const changedCodes = currOrder.filter((code, idx) => code !== prevOrder[idx]);
    const changed = orderedProducts.filter(p => changedCodes.includes(p.productCode));
    setChangedProducts(changed);
  }, [orderedProducts]);

  const handleFilterChange = (filterId: string, value: string) => {
    if (value) {
      addFilter({ id: filterId, value, comparisonType: 0 });
    } else {
      removeFilter(filterId);
    }
  };

  const getActiveFilterValue = (filterId: string) => {
    const activeFilter = selectedFilters.find(f => f.id === filterId);
    return activeFilter?.value || '';
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return {
    availableProducts,
    changedProducts,
    authLoading,
    loading,
    error,
    selectedCollection,
    orderedProducts,
    filters,
    selectedFilters,
    meta,
    initialOrderRef,
    
    handleFilterChange,
    getActiveFilterValue,
    handlePageChange,
    clearFilters,
    removeFilter,
    addFilter,
    updateProductOrder,
    saveCollectionOrder,
    router
  };
};