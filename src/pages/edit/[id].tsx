import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCollectionsStore } from '@/store/collectionStore';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Product } from "@/types";
import LayoutComponent from '../loyout/LayoutComponent';

interface SortableItemProps {
  id: string;
  product: Product;
}

const SortableItem = ({ id, product }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
      <Card
          ref={setNodeRef}
          style={style}
          sx={{ mb: 2, cursor: 'grab' }}
          {...attributes}
          {...listeners}
      >
        <CardMedia
            component="img"
            height="200"
            image={product.imageUrl || product.images?.[0] || 'https://via.placeholder.com/200'}
            alt={product.name}
        />
        <CardContent>
          <Typography variant="h6" component="div" noWrap title={product.name}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ürün Kodu: {product.productCode}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Renk Kodu: {product.colorCode}
          </Typography>
          <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
            {product.price} {product.currency}
          </Typography>
        </CardContent>
      </Card>
  );
};

const EditCollection: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession();
  const {
    selectedCollection,
    products,
    orderedProducts,
    loading,
    filters,
    activeFilters,
    error,
    selectCollection,
    updateProductOrder,
    addFilter,
    removeFilter,
    saveCollectionOrder,
    resetFilters,
  } = useCollectionsStore();

  const [selectedFilterId, setSelectedFilterId] = useState('');
  const [selectedFilterValue, setSelectedFilterValue] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveRequest, setSaveRequest] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{ id: string, value: string, comparisonType: number }[]>([]);

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (status === 'authenticated' && id) {
      selectCollection(Number(id));
    }
  }, [status, id, selectCollection]);

  useEffect(() => {
    if (activeFilters) {
      setAppliedFilters(activeFilters.map(filter => ({
        id: filter.id,
        value: filter.value,
        comparisonType: filter.comparisonType
      })));
    }
  }, [activeFilters]);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loading || !selectedCollection) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
    );
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = orderedProducts.findIndex(product => `${product.productCode}-${product.colorCode}` === active.id);
      const newIndex = orderedProducts.findIndex(product => `${product.productCode}-${product.colorCode}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        updateProductOrder(arrayMove(orderedProducts, oldIndex, newIndex));
      }
    }
  };

  const handleAddFilter = () => {
    if (selectedFilterId && selectedFilterValue) {
      addFilter({
        id: selectedFilterId,
        value: selectedFilterValue,
        comparisonType: 0
      });
      setSelectedFilterId('');
      setSelectedFilterValue('');
    }
  };

  const handleRemoveFilter = (filterId: string) => {
    removeFilter(filterId);
  };

  const handleSave = async () => {
    if (selectedCollection) {
      await saveCollectionOrder(selectedCollection.id);

      const requestData = {
        products: orderedProducts.map((product, index) => ({
          productCode: product.productCode,
          colorCode: product.colorCode,
          order: index + 1
        })),
        filters: activeFilters.map(filter => ({
          id: filter.id,
          value: filter.value,
          comparisonType: filter.comparisonType
        }))
      };

      setSaveRequest(JSON.stringify(requestData, null, 2));
      setShowSaveModal(true);
    }
  };

  const handleBack = () => {
    router.push('/collections');
  };

  const getFilterValues = (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    return filter ? filter.values : [];
  };

  const handleResetFilters = async () => {
    setAppliedFilters([]);
    await resetFilters();
  };

  return (
      <LayoutComponent>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
              Geri
            </Button>
            <Typography variant="h4" component="h1" color="text.primary">
              {selectedCollection.info.name} - Sabitleri Düzenle
            </Typography>
          </Box>

          {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Filtreler
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Filtre Türü</InputLabel>
                    <Select
                        value={selectedFilterId}
                        onChange={(e) => setSelectedFilterId(e.target.value)}
                        label="Filtre Türü"
                    >
                      {filters.map((filter) => (
                          <MenuItem key={filter.id} value={filter.id}>
                            {filter.title}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Filtre Değeri</InputLabel>
                    <Select
                        value={selectedFilterValue}
                        onChange={(e) => setSelectedFilterValue(e.target.value)}
                        label="Filtre Değeri"
                        disabled={!selectedFilterId}
                    >
                      {getFilterValues(selectedFilterId).map((value) => (
                          <MenuItem key={value.value} value={value.value}>
                            {value.valueName}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleAddFilter}
                      disabled={!selectedFilterId || !selectedFilterValue}
                  >
                    Filtre Ekle
                  </Button>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Aktif Filtreler
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {activeFilters.map((filter) => (
                      <Chip
                          key={`${filter.id}-${filter.value}`}
                          label={`${filter.title}: ${filter.valueName}`}
                          onDelete={() => handleRemoveFilter(filter.id)}
                          color="primary"
                          variant="outlined"
                      />
                  ))}
                  {activeFilters.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Aktif filtre yok
                      </Typography>
                  )}
                </Box>

                {activeFilters.length > 0 && (
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleResetFilters}
                        sx={{ mt: 2 }}
                    >
                      Filtreleri Temizle
                    </Button>
                )}
              </Paper>

              <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSave}
                    sx={{ mb: 2 }}
                >
                  Kaydet
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleBack}
                >
                  Vazgeç
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ürünler ({orderedProducts.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ürünleri sürükleyerek sıralayabilirsiniz.
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                        items={orderedProducts.map(product => `${product.productCode}-${product.colorCode}`)}
                        strategy={verticalListSortingStrategy}
                    >
                      <Grid container spacing={2}>
                        {orderedProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} key={`${product.productCode}-${product.colorCode}`}>
                              <SortableItem
                                  id={`${product.productCode}-${product.colorCode}`}
                                  product={product}
                              />
                            </Grid>
                        ))}
                      </Grid>
                    </SortableContext>
                  </DndContext>

                  {orderedProducts.length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>Gösterilecek ürün bulunamadı.</Typography>
                        {appliedFilters.length > 0 && (
                            <Button onClick={handleResetFilters} sx={{ mt: 2 }}>
                              Filtreleri Temizle
                            </Button>
                        )}
                      </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Dialog
              open={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              maxWidth="md"
              fullWidth
          >
            <DialogTitle>Kayıt İsteği</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Aşağıdaki veri sunucuya gönderilecektir:
              </DialogContentText>
              <TextField
                  fullWidth
                  multiline
                  rows={10}
                  value={saveRequest}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowSaveModal(false)} color="primary">
                Kapat
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </LayoutComponent>
  );
};

export default EditCollection;