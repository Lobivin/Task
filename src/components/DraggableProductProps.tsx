
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardMedia, Typography, Chip as MuiChip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Product } from '@/types';

interface DraggableProductProps {
  product: Product;
  disabled: boolean;
}

const DraggableProduct: React.FC<DraggableProductProps> = ({ product, disabled }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `product-${product.productCode}`,
    data: { type: 'product', product },
    disabled,
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
         style={{ opacity: isDragging ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Card sx={{
        position: 'relative', mb: 2, cursor: disabled ? 'not-allowed' : 'grab',
        opacity: disabled ? 0.5 : 1
      }}>
        <CardMedia
          component="img"
          height="120"
          image={product.imageUrl || product.images?.[0] || 'https://via.placeholder.com/200'}
          alt={product.name || 'Ürün'}
        />
        <CardContent sx={{ p: 1 }}>
          <Typography variant="subtitle2" component="div" noWrap title={product.name}>
            {product.name || 'İsimsiz Ürün'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {product.productCode}
          </Typography>
        </CardContent>
        {disabled && (
          <MuiChip
            icon={<CheckCircleIcon color="success" />}
            label="Eklendi"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              zIndex: 2
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default DraggableProduct;