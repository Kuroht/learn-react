import type { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: 'Ceramic Mug',
    price: 12.9,
    imageUrl: '/mug.png',
    inStock: true,
  },
  {
    id: 2,
    name: 'Desk Lamp',
    price: 39.5,
    imageUrl: '/lamp.png',
    inStock: true,
    badge: 'new',
  },
  {
    id: 3,
    name: 'Mechanical Keyboard',
    price: 89,
    imageUrl: '/keyboard.svg',
    inStock: true,
    badge: 'sale',
  },
  {
    id: 4,
    name: 'Notebook',
    price: 6.5,
    imageUrl: '/notebook.png',
    inStock: false,
  },
  {
    id: 5,
    name: 'Backpack',
    price: 54.9,
    imageUrl: '/backpack.png',
    inStock: true,
  },
  {
    id: 6,
    name: 'Wireless Mouse',
    price: 24.9,
    imageUrl: '/mouse.png',
    inStock: false,
    badge: 'sale',
  },
];