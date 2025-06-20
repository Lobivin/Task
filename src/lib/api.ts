import {
  ApiResponse,
  AuthResponse,
  CollectionsResponse,
  FilterOption,
  ProductsRequestParams,
  ProductsResponse,
  SaveConstantsRequest
} from '@/types';
import api from './axiosHelper';

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post(`/Auth/Login`, {
      username,
      password
    });
    return response.data;
  } catch (error: any) {
    console.error('Login API hatası:', error.message);
    throw error;
  }
};

export const refreshTokenLogin = async (refreshToken: string) => {
  const response = await api.post(`/Auth/RefreshToken`, {
    refreshToken
  });
  return response.data;
};

export const getCollections = async (): Promise<CollectionsResponse> => {
  try {
    const response = await api.get(`/Collection/GetAll`);
    return response.data;
  } catch (error: any) {
    console.error('getCollections API hatası:', error.message);
    if (error.response) {
      console.error('API yanıt detayı:', error.response.status, error.response.data);
    }
    return {
      meta: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false },
      data: []
    };
  }
};

export const getCollectionProducts = async (collectionId: number, params: ProductsRequestParams) => {
  const response = await api.post(`/Collection/${collectionId}/GetProductsForConstants`, params);
  return response.data;
};

export const getCollectionFilters = async (collectionId: number) => {
  try {
    const response = await api.get(`/Collection/${collectionId}/GetFiltersForConstants`);
    return response.data;
  } catch (error) {
    console.error(`Filtreler yüklenirken hata (Collection ID: ${collectionId}):`, error);
    return { data: [], status: 1, message: "Filtreler yüklenemedi" };
  }
};

export const saveCollectionConstants = async (collectionId: number, data: SaveConstantsRequest): Promise<ApiResponse<any>> => {
  const response = await api.post(`/Collection/${collectionId}/SaveConstants`, data);
  return response.data;
};