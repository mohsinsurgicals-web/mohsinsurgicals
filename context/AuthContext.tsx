import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Address } from '../types';
import { getCustomer, loginCustomer, registerCustomer, createAddress, deleteAddress, recoverCustomerPassword, attachCustomerToCart } from '../lib/shopify';

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, first: string, last: string) => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  logout: () => void;
  addNewAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomer = async () => {
      const token = localStorage.getItem('shopify_customer_token');
      if (token) {
        const customerData = await getCustomer(token);
        setCustomer(customerData);
      }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('shopify_customer_token');
      if (token) {
        try {
          await refreshCustomer();
        } catch (e) {
          console.error("Session expired or invalid", e);
          localStorage.removeItem('shopify_customer_token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const token = await loginCustomer(email, pass);
      localStorage.setItem('shopify_customer_token', token);
      // attach customer to existing cart
      const cartId = localStorage.getItem('shopify_cart_id') || localStorage.getItem('cartId');
      if (cartId) {
          await attachCustomerToCart(cartId);
      }

      await refreshCustomer();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, first: string, last: string) => {
    setIsLoading(true);
    try {
      await registerCustomer(email, pass, first, last);
      await login(email, pass);
    } finally {
      setIsLoading(false);
    }
  };

  const recoverPassword = async (email: string) => {
      await recoverCustomerPassword(email);
  };

  const addNewAddress = async (address: Omit<Address, 'id'>) => {
      const token = localStorage.getItem('shopify_customer_token');
      if (!token) return;
      setIsLoading(true);
      try {
        await createAddress(token, address);
        await refreshCustomer();
      } finally {
        setIsLoading(false);
      }
  };

  const removeAddress = async (id: string) => {
      const token = localStorage.getItem('shopify_customer_token');
      if (!token) return;
      setIsLoading(true);
      try {
        await deleteAddress(token, id);
        await refreshCustomer();
      } finally {
        setIsLoading(false);
      }
  };

  const logout = () => {
    localStorage.removeItem('shopify_customer_token');
    setCustomer(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      customer, 
      isAuthenticated: !!customer, 
      isLoading, 
      login, 
      register, 
      recoverPassword,
      logout,
      addNewAddress,
      removeAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};