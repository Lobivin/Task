import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { Product } from '@/types';

interface DroppableConstantSlotProps {
  slotIndex: number;
  product: Product | null;
}

const DroppableConstantSlot: React.FC<DroppableConstantSlotProps> = ({ slotIndex, product }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `constant-slot-${slotIndex}`,
    data: { type: 'constant-slot', slotIndex },
  });

  const draggable = useDraggable({
    id: `constant-${slotIndex}`,
    data: { type: 'constant', slotIndex, product },
    disabled: !product,
  });

  return (
    <div ref={setNodeRef}
         style={{
           height: 140,
           border: isOver ? '2px solid #1976d2' : '1px solid #e0e0e0',
           borderRadius: 8,
           background: product ? '#fff' : '#f5f5f5',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           position: 'relative',
           cursor: product ? 'grab' : 'pointer',
           transition: 'border 0.2s'
         }}>
      {product ? (
        <div ref={draggable.setNodeRef} {...draggable.attributes} {...draggable.listeners}
             style={{ width: '100%', height: '100%', cursor: 'grab' }}>
          <Card
            sx={{
              width: '100%',
              height: '100%',
              boxShadow: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab'
            }}
          >
            <CardMedia
              component="img"
              height="70"
              image={product.imageUrl || product.images?.[0] || 'https://via.placeholder.com/200'}
              alt={product.name || 'Ürün'}
              sx={{ objectFit: 'contain', width: 'auto', mx: 'auto', mt: 1 }}
            />
            <CardContent sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="subtitle2" noWrap title={product.name}>
                {product.name || 'İsimsiz Ürün'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {product.productCode}
              </Typography>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Box sx={{ textAlign: 'center', color: '#bdbdbd' }}>
          <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Boş Slot
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default DroppableConstantSlot;