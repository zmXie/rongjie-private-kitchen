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
  is_recommended: number;
  is_sold_out: number;
  created_at: string;
}

export interface Order {
  id: number;
  status: number;
  remark: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  reject_reason: string | null;
  rating: number | null;
  review: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  dish_id: number | null;
  dish_name: string;
  dish_price: number;
  quantity: number;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}