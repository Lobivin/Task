import { useState } from 'react';

export const useDialogs = () => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const handleSaveOrder = async (
    selectedCollection: any,
    saveCollectionOrder: (id: number) => Promise<any>,
    orderedProducts: any[],
    initialOrderRef: React.MutableRefObject<string[]>,
    setChangedProducts: (products: any[]) => void
  ) => {
    if (!selectedCollection) return;
    setSaveLoading(true);
    try {
      const result = await saveCollectionOrder(selectedCollection.id);
      if (result.success) {
        setSaveDialogOpen(false);
        initialOrderRef.current = orderedProducts.map(p => p.productCode);
        setChangedProducts([]);
      }
    } catch (error) {
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFiltersToggle = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setFiltersExpanded(isExpanded);
  };

  return {
    saveDialogOpen,
    setSaveDialogOpen,
    saveLoading,
    filtersExpanded,
    handleSaveOrder,
    handleFiltersToggle
  };
};