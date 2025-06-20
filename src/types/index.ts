export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  status: number;
  message: string | null;
  data: {
    accessToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    refreshToken: string;
    tokenType: string;
    errors?: Record<string, string[]>;
  } | null;
}

export interface ApiResponse<T> {
  status: number;
  message: string | null;
  data: T | null;
}

export interface Meta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductMeta {
  page: number;
  pageSize: number;
  totalProduct: number;
}

export interface FilterValue {
  value: string;
  valueName: string;
}

export interface Filter {
  id: string;
  title: string;
  value: string;
  valueName: string;
  currency: string | null;
  comparisonType: number;
}

export interface FilterOption {
  id: string;
  title: string;
  values: FilterValue[];
  currency: string | null;
  comparisonType: number;
}

export interface FilterRequest {
  id: string;
  value: string;
  comparisonType: number;
}

export interface CollectionInfo {
  id: number;
  name: string;
  description: string;
  url: string;
  langCode: string;
}

export interface CollectionFilters {
  useOrLogic: boolean;
  filters: Filter[];
}

export interface CollectionsResponse {
  meta: Meta;
  data: Collection[];
}

export interface Collection {
  id: number;
  filters: CollectionFilters;
  type: number;
  info: CollectionInfo;
  salesChannelId: number;
  products: Product[] | null;
}

export interface Product {
  outOfStock: boolean;
  id: number;
  productCode: string;
  colorCode: string;
  name: string;
  url: string;
  description: string;
  price: number;
  discountedPrice: number;
  currency: string;
  images: string[];
  isFavorite: boolean;
  isNew: boolean;
  inStock: boolean;
  order?: number;
  imageUrl?: string;
  isSaleB2B: boolean,
}

export interface ProductsRequestParams {
  additionalFilters: FilterRequest[];
  page: number;
  pageSize: number;
}

export interface ProductsResponse {
  status: number;
  message: string;
  data: {
    meta: ProductMeta;
    data: Product[];
  };
}

export interface FiltersResponse {
  status: number;
  message: string;
  data: FilterOption[];
}

export interface SaveConstantsRequest {
  products: {
    productCode: string;
    colorCode: string;
    order: number;
  }[];
  filters: FilterRequest[];
}

