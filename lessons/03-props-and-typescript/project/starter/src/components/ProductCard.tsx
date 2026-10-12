import type { Product } from '../types';
import { Button } from './Button';

type ProductCardProps = {
  product: Product;
  onAddToCart: (id: number) => void;
};

const priceFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'EUR',
});

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const className = product.inStock
    ? 'product-card'
    : 'product-card product-card--sold-out';

  return (
    <article className={className}>
      <div className="product-card__media">
        <img
          className="product-card__image"
          src={product.imageUrl}
          alt={product.name}
        />
        {product.badge && (
          <span className={`badge badge-${product.badge}`}>
            {product.badge === 'new' ? 'New' : 'Sale'}
          </span>
        )}
      </div>
      <div className="product-card__body">
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-card__price">
          {priceFormatter.format(product.price)}
        </p>
        {product.inStock ? (
          <Button onClick={() => onAddToCart(product.id)}>Add to cart</Button>
        ) : (
          <p className="product-card__sold-out">Sold out</p>
        )}
      </div>
    </article>
  );
}
