import { ProductGrid } from './components/ProductGrid';
import { products } from './data/products';

function handleAddToCart(id: number) {
  console.log('Added product', id);
}

function App() {
  return (
    <main className="page">
      <h1 className="page__title">Shop</h1>
      <ProductGrid products={products} onAddToCart={handleAddToCart} />
    </main>
  );
}

export default App;
