import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const listProducts = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (listProducts) {
        setProducts([...JSON.parse(listProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const existProduct = products.find(prod => prod.id === product.id);
      if (existProduct) {
        setProducts(
          products.map(prod =>
            prod.id === product.id
              ? { ...prod, quantity: prod.quantity + 1 }
              : prod,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const existProduct = products.find(prod => prod.id === id);
      if (existProduct) {
        setProducts(
          products.map(prod =>
            prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
          ),
        );
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const existProduct = products.find(prod => prod.id === id);
      if (existProduct) {
        const arrayProducts = products.map(prod =>
          prod.id === id ? { ...prod, quantity: prod.quantity - 1 } : prod,
        );
        const indexToRemove = arrayProducts.findIndex(
          prod => prod.quantity <= 0,
        );
        if (indexToRemove > -1) {
          arrayProducts.splice(indexToRemove, 1);
        }
        setProducts(arrayProducts);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
