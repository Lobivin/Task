import { useState } from 'react';
import { DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Product } from '@/types';

export const useDragAndDrop = (
  constantsOrder: (Product | null)[],
  setConstantsOrder: (order: (Product | null)[]) => void,
  isProductAdded: (code: string) => boolean
) => {
  const [activeDragProduct, setActiveDragProduct] = useState<Product | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id, event.active.data.current);
    if (event.active.data.current?.product) {
      setActiveDragProduct(event.active.data.current.product);
    }
    if (event.active.data.current?.type === 'constant') {
      setActiveDragProduct(event.active.data.current.product);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag ended:', {
      activeId: event.active.id,
      activeData: event.active.data.current,
      overId: event.over?.id,
      overData: event.over?.data.current
    });

    setActiveDragProduct(null);
    const { active, over } = event;
    if (!over) {
      console.log('No drop target');
      return;
    }

    if (active.data.current?.type === 'product' && over.data.current?.type === 'constant-slot') {
      const product = active.data.current.product as Product;
      const slotIndex = over.data.current?.slotIndex;
      console.log('Product to constant slot:', { product: product.name, slotIndex });

      if (!product || slotIndex === undefined) return;
      if (isProductAdded(product.productCode)) {
        console.log('Product already added');
        return;
      }

      const newConstants = [...constantsOrder];
      newConstants[slotIndex] = product;
      setConstantsOrder(newConstants);
      console.log('Constants updated');
      return;
    }

    if (active.data.current?.type === 'constant' && over.data.current?.type === 'product-list') {
      const slotIndex = active.data.current?.slotIndex;
      console.log('Constant to product list:', { slotIndex });

      if (slotIndex === undefined) return;
      const product = constantsOrder[slotIndex];
      if (!product) return;

      const newConstants = [...constantsOrder];
      newConstants[slotIndex] = null;
      setConstantsOrder(newConstants);
      console.log('Product removed from constants');
      return;
    }

    if (
      active.data.current?.type === 'constant' &&
      over.data.current?.type === 'constant-slot'
    ) {
      const from = active.data.current?.slotIndex;
      const to = over.data.current?.slotIndex;
      console.log('Constant to constant:', { from, to });

      if (from === undefined || to === undefined || from === to) return;
      const newConstants = [...constantsOrder];
      [newConstants[from], newConstants[to]] = [newConstants[to], newConstants[from]];
      setConstantsOrder(newConstants);
      console.log('Constants swapped');
      return;
    }
  };

  return {
    sensors,
    activeDragProduct,
    handleDragStart,
    handleDragEnd
  };
};