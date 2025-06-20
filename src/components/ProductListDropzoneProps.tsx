import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ProductListDropzoneProps {
  children: React.ReactNode;
}

const ProductListDropzone: React.FC<ProductListDropzoneProps> = ({ children }) => {
  const { setNodeRef } = useDroppable({
    id: 'product-list-dropzone',
    data: { type: 'product-list' },
  });

  return <div ref={setNodeRef}>{children}</div>;
};

export default ProductListDropzone;