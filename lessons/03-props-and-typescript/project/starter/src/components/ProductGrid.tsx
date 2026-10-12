import type { Product } from '../types';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  products: Product[];
  onAddToCart: (id: number) => void;
};

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <section className="grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </section>
  );
}
