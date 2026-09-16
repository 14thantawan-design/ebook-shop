export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  cover_image: string;
  file_path: string;
  created_at?: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Order {
  id: string;
  book_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: OrderStatus;
  download_token?: string;
  created_at: string;
  updated_at: string;
  book?: Book;
}
