import React, { useState, useEffect, useRef } from 'react';
import { CartContext } from './CartContextdef';
import { useUser } from './useUser';

const getInitialCartItems = (userId) => {
  if (!userId) return [];
  try {
    const savedCart = localStorage.getItem(`cart_${userId}`);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Erreur lors du chargement du panier:', error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const userId = user?.uid;
  const prevUserIdRef = useRef(userId);
  const [cartItems, setCartItems] = useState([]);

  // Charger le panier quand l'utilisateur change
  useEffect(() => {
    if (userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;
      // Defer setState to next microtask to avoid synchronous update
      Promise.resolve().then(() => {
        setCartItems(getInitialCartItems(userId || null));
      });
    }
  }, [userId]);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (userId && cartItems.length > 0) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
    }
  }, [cartItems, userId]);

  const addToCart = (book) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === book.id);
      
      if (existingItem) {
        // Si le livre est déjà dans le panier, augmenter la quantité
        return prevItems.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Ajouter le livre avec quantité 1
        return [...prevItems, { ...book, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === bookId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
