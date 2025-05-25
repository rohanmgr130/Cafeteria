import React, { createContext, useContext, useState } from 'react';

// Create context
const CartValueContext = createContext();

// Cart provider component
export const CartValueProvider = ({ children }) => {
  const [cartValue, setCartValue] = useState(0);

  console.log("cv", cartValue)

  return (
    <CartValueContext.Provider value={{ cartValue, setCartValue }}>
      {children}
    </CartValueContext.Provider>
  );
};

// Custom hook to use cart value context
export const useCartValue = () => {
  const context = useContext(CartValueContext);
  if (!context) {
    throw new Error('useCartValue must be used within a CartValueProvider');
  }
  return context;
};