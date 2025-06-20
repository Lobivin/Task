import { create } from 'zustand';
import {
  getCollections,
  getCollectionProducts,
  getCollectionFilters,
  saveCollectionConstants
} from '@/lib/api';
import {
  Collection,
  Product,
  FilterOption,
  Filter,
  ProductsRequestParams,
  FilterRequest,
  SaveConstantsRequest,
  ProductsResponse,
  FiltersResponse,
  CollectionsResponse
} from '@/types';

interface CollectionsState {
  collections: Collection[];
  selectedCollection: Collection | null;
  products: Product[];
  filters: FilterOption[];
  activeFilters: Filter[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  selectedFilters: FilterRequest[];
  orderedProducts: Product[];
  page: number;
  pageSize: number;
  totalCount: number;
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  fetchCollections: () => Promise<void>;
  selectCollection: (collectionId: number) => Promise<void>;
  setSelectedCollection: (collection: Collection) => void;
  updateProductOrder: (reorderedProducts: Product[]) => void;
  applyFilters: (filters: FilterRequest[]) => Promise<void>;
  resetFilters: () => Promise<void>;
  saveCollectionOrder: (collectionId: number) => Promise<{success: boolean, message: string}>;
  addFilter: (filter: FilterRequest) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  reorderCollections: (sourceIndex: number, destinationIndex: number) => void;
  fetchCollectionProducts: (collectionId: number, additionalFilters?: FilterRequest[], page?: number, pageSize?: number) => Promise<void>;
  fetchCollectionFilters: (collectionId: number) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  selectedCollection: null,
  products: [],
  orderedProducts: [],
  filters: [],
  activeFilters: [],
  loading: false,
  isLoading: false,
  error: null,
  selectedFilters: [],
  page: 1,
  pageSize: 36,
  totalCount: 0,
  meta: {
    page: 1,
    pageSize: 36,
    totalCount: 0,
    totalPages: 0
  },

  fetchCollections: async () => {
    set({ loading: true, error: null });
    try {
      const response: CollectionsResponse = await getCollections();
      set({
        collections: response.data || [],
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Koleksiyonlar yüklenirken hata oluştu',
        loading: false
      });
    }
  },

  fetchCollectionProducts: async (collectionId: number, additionalFilters = [], page = 1, pageSize = 36) => {
    set({ loading: true, error: null });
    try {
      const params: ProductsRequestParams = {
        additionalFilters,
        page,
        pageSize
      };

      console.log('Fetching products for collection:', collectionId, 'with params:', params);
      const response: ProductsResponse = await getCollectionProducts(collectionId, params);

      if (response.status === 200 && response.data) {
        const { data: productsData, meta } = response.data;

        const productsWithOrder = productsData.map((product: any, index: number) => ({
          id: index + 1,
          productCode: product.productCode,
          colorCode: product.colorCode,
          name: product.name || 'İsimsiz Ürün',
          url: '',
          description: '',
          price: 0,
          discountedPrice: 0,
          currency: 'TL',
          images: product.imageUrl ? [product.imageUrl] : [],
          imageUrl: product.imageUrl,
          isFavorite: false,
          isNew: false,
          inStock: !product.outOfStock,
          outOfStock: product.outOfStock,
          isSaleB2B: product.isSaleB2B,
          order: index + 1,
        }));

        set({
          products: productsWithOrder,
          orderedProducts: productsWithOrder,
          totalCount: meta.totalProduct,
          page: meta.page,
          pageSize: meta.pageSize,
          meta: {
            page: meta.page,
            pageSize: meta.pageSize,
            totalCount: meta.totalProduct,
            totalPages: Math.ceil(meta.totalProduct / meta.pageSize)
          },
          loading: false
        });
      } else {
        throw new Error(response.message || 'Ürünler yüklenemedi');
      }
    } catch (error: any) {
      console.error('Product fetch error:', error);
      set({
        error: error.message || 'Ürünler yüklenirken hata oluştu',
        loading: false
      });
    }
  },

  fetchCollectionFilters: async (collectionId: number) => {
    try {
      console.log('Fetching filters for collection:', collectionId);
      const response: FiltersResponse = await getCollectionFilters(collectionId);

      if (response.status === 200 && response.data) {
        set({ filters: response.data });
        console.log('Filters loaded:', response.data);
      } else {
        console.warn('No filters available for collection:', collectionId);
        set({ filters: [] });
      }
    } catch (error: any) {
      console.error('Filter fetch error:', error);
      set({
        filters: [],
        error: error.message || 'Filtreler yüklenirken hata oluştu'
      });
    }
  },

  selectCollection: async (collectionId: number) => {
    console.log('Selecting collection with ID:', collectionId);
    set({ loading: true, error: null });

    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      set({ selectedCollection: collection });
    } else {
      set({
        selectedCollection: {
          id: collectionId,
          info: {
            id: collectionId,
            name: `Koleksiyon ${collectionId}`,
            description: '',
            url: '',
            langCode: 'tr'
          },
          filters: { useOrLogic: false, filters: [] },
          type: 0,
          salesChannelId: 0,
          products: null
        }
      });
    }

    try {
      await Promise.all([
        get().fetchCollectionProducts(collectionId),
        get().fetchCollectionFilters(collectionId)
      ]);
    } catch (error) {
      console.error('Error loading collection data:', error);
    }
  },

  setSelectedCollection: (collection) => {
    set({ selectedCollection: collection });
  },

  updateProductOrder: (reorderedProducts) => {
    const productsWithNewOrder = reorderedProducts.map((product, index) => ({
      ...product,
      order: index + 1
    }));
    set({ orderedProducts: productsWithNewOrder });
  },

  applyFilters: async (filters) => {
    const { selectedCollection, page, pageSize } = get();
    if (selectedCollection) {
      set({ selectedFilters: filters });
      await get().fetchCollectionProducts(selectedCollection.id, filters, page, pageSize);
    }
  },

  resetFilters: async () => {
    const { selectedCollection, page, pageSize } = get();
    if (selectedCollection) {
      set({ selectedFilters: [] });
      await get().fetchCollectionProducts(selectedCollection.id, [], page, pageSize);
    }
  },

  addFilter: (filter) => {
    const currentFilters = get().selectedFilters;
    const existingIndex = currentFilters.findIndex(f => f.id === filter.id);

    let newFilters: FilterRequest[];
    if (existingIndex !== -1) {
      newFilters = [...currentFilters];
      newFilters[existingIndex] = filter;
    } else {
      newFilters = [...currentFilters, filter];
    }

    get().applyFilters(newFilters);
  },

  removeFilter: (filterId) => {
    const currentFilters = get().selectedFilters.filter(f => f.id !== filterId);
    get().applyFilters(currentFilters);
  },

  clearFilters: () => {
    get().resetFilters();
  },

  setPage: (page) => {
    const { selectedCollection, selectedFilters, pageSize } = get();
    set({ page });
    if (selectedCollection) {
      get().fetchCollectionProducts(selectedCollection.id, selectedFilters, page, pageSize);
    }
  },

  saveCollectionOrder: async (collectionId: number) => {
    try {
      const { orderedProducts, selectedFilters } = get();

      const saveRequest: SaveConstantsRequest = {
        products: orderedProducts.map((product, index) => ({
          productCode: product.productCode,
          colorCode: product.colorCode,
          order: index + 1
        })),
        filters: selectedFilters
      };

      const response = await saveCollectionConstants(collectionId, saveRequest);

      if (response.status === 0 || response.status === 200) {
        return { success: true, message: 'Koleksiyon sırası başarıyla kaydedildi' };
      } else {
        return { success: false, message: response.message || 'Kaydetme işlemi başarısız' };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Kaydetme işlemi sırasında hata oluştu'
      };
    }
  },

  reorderCollections: (sourceIndex, destinationIndex) => {
    const collections = get().collections;
    const newCollections = [...collections];
    const [removed] = newCollections.splice(sourceIndex, 1);
    newCollections.splice(destinationIndex, 0, removed);
    set({ collections: newCollections });
  }
}));