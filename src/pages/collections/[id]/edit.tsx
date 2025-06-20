import React from 'react';
import { NextPage } from 'next';
import {
  Container, Typography, Box, Grid, Paper, Button, CircularProgress, Alert, Card, CardContent, CardMedia,
  FormControl, InputLabel, Select, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Stack, Pagination, Accordion, AccordionSummary, AccordionDetails, Badge,
} from '@mui/material';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LayoutComponent from '../../loyout/LayoutComponent';
import { useCollectionEdit } from '@/hooks/useCollectionEdit';
import {useConstants} from "@/hooks/useConstantsManager";
import {useDragAndDrop} from "@/hooks/useDragAndDropManager";
import {useDialogs} from "@/hooks/useSaveDialogState";
import DraggableProduct from '@/DraggableProductProps';
import ProductListDropzone from '@/ProductListDropzoneProps';
import DroppableConstantSlot from "@/DroppableConstantSlotProps";


const EditCollection: NextPage = () => {
  const {
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
    updateProductOrder,
    saveCollectionOrder,
    router
  } = useCollectionEdit();

  const {
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
  } = useConstants(selectedCollection, orderedProducts, updateProductOrder, saveCollectionOrder);

  const {
    sensors,
    activeDragProduct,
    handleDragStart,
    handleDragEnd
  } = useDragAndDrop(constantsOrder, setConstantsOrder, isProductAdded);

  const {
    saveDialogOpen,
    setSaveDialogOpen,
    saveLoading,
    filtersExpanded,
    handleSaveOrder,
    handleFiltersToggle
  } = useDialogs();

  const onSaveOrder = () => {
    handleSaveOrder(
        selectedCollection,
        saveCollectionOrder,
        orderedProducts,
        initialOrderRef,
        () => {}
    );
  };

  if (authLoading || loading) {
    return (
        <LayoutComponent>
          <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Container>
        </LayoutComponent>
    );
  }

  if (error) {
    return (
        <LayoutComponent>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Alert severity="error">{error}</Alert>
            <Box sx={{ mt: 2 }}>
              <Button onClick={() => router.back()}>Geri Dön</Button>
            </Box>
          </Container>
        </LayoutComponent>
    );
  }

  if (!selectedCollection) {
    return (
        <LayoutComponent>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Alert severity="info">Koleksiyon bulunamadı</Alert>
            <Box sx={{ mt: 2 }}>
              <Button onClick={() => router.back()}>Geri Dön</Button>
            </Box>
          </Container>
        </LayoutComponent>
    );
  }

  return (
      <LayoutComponent>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.back()}
                  variant="outlined"
              >
                Geri Dön
              </Button>
              <Typography variant="h4" component="h1" color="text.primary">
                {selectedCollection ? `${selectedCollection.info?.name || selectedCollection.id} - Düzenle` : 'Koleksiyon Düzenle'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={orderedProducts.length === 0}
              >
                Sıralamayı Kaydet
              </Button>
            </Box>
          </Box>

          {/* Filters Accordion */}
          <Accordion expanded={filtersExpanded} onChange={handleFiltersToggle} sx={{ mb: 3 }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  }
                }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FilterListIcon />
                <Typography variant="h6">Filtreler</Typography>
                {selectedFilters.length > 0 && (
                    <Badge badgeContent={selectedFilters.length} color="primary">
                      <Typography variant="body2" color="text.secondary">
                        ({selectedFilters.length} aktif)
                      </Typography>
                    </Badge>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Button
                    size="small"
                    onClick={clearFilters}
                    disabled={selectedFilters.length === 0}
                    variant="outlined"
                    color="secondary"
                >
                  Tüm Filtreleri Temizle
                </Button>
              </Box>

              {filters.length > 0 ? (
                  <Grid container spacing={2}>
                    {filters.map((filter) => (
                        <Grid item xs={12} sm={6} md={4} key={filter.id}>
                          <FormControl fullWidth>
                            <InputLabel>{filter.title}</InputLabel>
                            <Select
                                value={getActiveFilterValue(filter.id)}
                                label={filter.title}
                                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                            >
                              <MenuItem value="">Hepsi</MenuItem>
                              {filter.values.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.valueName}
                                  </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                    ))}
                  </Grid>
              ) : (
                  <Typography variant="body2" color="text.secondary">
                    Bu koleksiyon için filtre bulunamadı.
                  </Typography>
              )}

              {selectedFilters.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Aktif Filtreler:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedFilters.map((filter) => {
                        const filterOption = filters.find(f => f.id === filter.id);
                        const valueOption = filterOption?.values.find(v => v.value === filter.value);
                        return (
                            <Chip
                                key={`${filter.id}-${filter.value}`}
                                label={`${filterOption?.title}: ${valueOption?.valueName}`}
                                onDelete={() => removeFilter(filter.id)}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        );
                      })}
                    </Stack>
                  </Box>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Drag & Drop Context */}
          <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Ürünler ({meta.totalCount} toplam)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sayfa {meta.page} / {meta.totalPages}
                    </Typography>
                  </Box>
                  {availableProducts.length === 0 ? (
                      <Alert severity="info">
                        Bu koleksiyonda ürün bulunamadı.
                        {selectedFilters.length > 0 && (
                            <>
                              <br />
                              <Button
                                  onClick={clearFilters}
                                  sx={{ mt: 1 }}
                                  size="small"
                                  variant="outlined"
                              >
                                Filtreleri temizleyip tekrar deneyin
                              </Button>
                            </>
                        )}
                      </Alert>
                  ) : (
                      <>
                        <ProductListDropzone>
                          <Box
                              sx={{
                                minHeight: 400,
                                border: '1px dashed #eee',
                                borderRadius: 2,
                                p: 2,
                                background: '#fafbfc'
                              }}
                          >
                            <Grid container spacing={2}>
                              {availableProducts.map((product) => (
                                  <Grid item xs={12} sm={6} md={4} key={product.productCode}>
                                    <DraggableProduct
                                        product={product}
                                        disabled={isProductAdded(product.productCode)}
                                    />
                                  </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </ProductListDropzone>
                        {meta.totalPages > 1 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                              <Pagination
                                  count={meta.totalPages}
                                  page={meta.page}
                                  onChange={handlePageChange}
                                  color="primary"
                              />
                            </Box>
                        )}
                      </>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Sabitler (Sürükle-Bırak ile ekle/çıkar)
                  </Typography>
                  <Box
                      sx={{
                        minHeight: 400,
                        border: '1px dashed #eee',
                        borderRadius: 2,
                        p: 2,
                        background: '#fafbfc'
                      }}
                  >
                    <Grid container spacing={2}>
                      {Array.from({ length: SABITLER_GRID_SIZE }).map((_, idx) => {
                        const product = constantsOrder[idx];
                        return (
                              <Grid item xs={3} key={idx}>
                                <DroppableConstantSlot slotIndex={idx} product={product} />
                              </Grid>
                              );
                              })}
                            </Grid>
                      </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                              onClick={handleCancelConstants}
                              variant="outlined"
                              color="secondary"
                          >
                            Vazgeç
                          </Button>
                          <Button
                              onClick={handleSaveConstants}
                              variant="contained"
                              disabled={constantsSaveLoading}
                              startIcon={<SaveIcon />}
                          >
                            {constantsSaveLoading ? <CircularProgress size={20} /> : 'Kaydet'}
                          </Button>
                        </Box>
                      </Paper>
                      </Grid>
                      </Grid>

                        {/* Drag Overlay */}
                        <DragOverlay>
                          {activeDragProduct && (
                              <Card sx={{ width: 120, opacity: 0.8 }}>
                                <CardMedia
                                    component="img"
                                    height="120"
                                    image={activeDragProduct.imageUrl || activeDragProduct.images?.[0] || 'https://via.placeholder.com/200'}
                                    alt={activeDragProduct.name}
                                />
                                <CardContent>
                                  <Typography>{activeDragProduct.name}</Typography>
                                </CardContent>
                              </Card>
                          )}
                        </DragOverlay>
                      </DndContext>

                        {/* Save Order Dialog */}
                        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                          <DialogTitle>Sıralamayı Kaydet</DialogTitle>
                          <DialogContent>
                            <DialogContentText>
                              Ürün sıralamasını kaydetmek istediğinizden emin misiniz?
                            </DialogContentText>
                            {changedProducts.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Yerleri değişen ürünler:
                                  </Typography>
                                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {changedProducts.map((p) => (
                                        <li key={p.productCode}>
                                          {p.name || p.productCode}
                                        </li>
                                    ))}
                                  </ul>
                                </Box>
                            )}
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setSaveDialogOpen(false)}>İptal</Button>
                            <Button
                                onClick={onSaveOrder}
                                variant="contained"
                                disabled={saveLoading}
                            >
                              {saveLoading ? <CircularProgress size={20} /> : 'Kaydet'}
                            </Button>
                          </DialogActions>
                        </Dialog>

                        {/* Constants Changes Dialog */}
                        <Dialog open={showConstantsChanges} onClose={() => setShowConstantsChanges(false)}>
                          <DialogTitle>Değişiklikler</DialogTitle>
                          <DialogContent>
                            {constantsChanged.length === 0 ? (
                                <Typography>Değişiklik yok.</Typography>
                            ) : (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Sırası değişen veya eklenen ürünler:
                                  </Typography>
                                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {constantsChanged.map((p) => (
                                        <li key={p.productCode}>
                                          {p.name || p.productCode}
                                        </li>
                                    ))}
                                  </ul>
                                </Box>
                            )}
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setShowConstantsChanges(false)}>Kapat</Button>
                          </DialogActions>
                        </Dialog>
                      </Container>
                      </LayoutComponent>
                      );
                      };

                        export default EditCollection;