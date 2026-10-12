export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  badge?: 'new' | 'sale';
};
