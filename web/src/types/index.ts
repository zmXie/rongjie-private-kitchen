export interface Category {
  id: number;
  name: string;
  sort: number;
  created_at: string;
}

export interface Dish {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sort: number;
  status: number;
  created_at: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}