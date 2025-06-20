import { useState } from 'react';
import { Product } from '@/types';

const SABITLER_GRID_SIZE = 16;

export const useConstants = (
  selectedCollection: any,
  orderedProducts: Product[],
  updateProductOrder: (products: Product[]) => void,
  saveCollectionOrder: (id: number) => Promise<any>
) => {
  const [constantsOrder, setConstantsOrder] = useState<(Product | null)[]>(
    Array(SABITLER_GRID_SIZE).fill(null)
  );
  const [constantsSaveLoading, setConstantsSaveLoading] = useState(false);
  const [showConstantsChanges, setShowConstantsChanges] = useState(false);
  const [constantsChanged, setConstantsChanged] = useState<Product[]>([]);

  const isProductAdded = (code: string) =>
    constantsOrder.some((item) => item && item.productCode === code);

  const handleSaveConstants = async () => {
    if (!selectedCollection) return;
    setConstantsSaveLoading(true);
    try {
      const changed = constantsOrder
        .map((p, idx) => (p && (!orderedProducts[idx] || p.productCode !== orderedProducts[idx].productCode) ? p : null))
        .filter(Boolean) as Product[];
      setConstantsChanged(changed);
      setShowConstantsChanges(true);
      updateProductOrder(constantsOrder.filter(Boolean) as Product[]);
      await saveCollectionOrder(selectedCollection.id);
    } catch (error) {
    } finally {
      setConstantsSaveLoading(false);
    }
  };

  const handleCancelConstants = () => {
    setConstantsOrder(Array(SABITLER_GRID_SIZE).fill(null));
  };

  return {
    constantsOrder,
    setConstantsOrder,
    constantsSaveLoading,
    showConstantsChanges,
    setShowConstantsChanges,
    constantsChanged,
    isProductAdded,
    handleSaveConstants,
    handleCancelConstants,
    SABITLER_GRID_SIZE
  };
};