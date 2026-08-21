import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const savedUser = localStorage.getItem('erp_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, portal = null) => {
    const res = await api.post('/auth/login', { email, password, portal });
    const { token, user: userData } = res.data;
    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const registerVendor = async (data) => {
    const res = await api.post('/auth/register-vendor', data);
    const { token, user: userData } = res.data;
    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const quickSwitchRole = async (roleKey) => {
    const demoCredentials = {
      admin: { email: 'admin@company.com', pass: 'password123', portal: 'company' },
      procurement_manager: { email: 'pm@company.com', pass: 'password123', portal: 'company' },
      finance_manager: { email: 'finance@company.com', pass: 'password123', portal: 'company' },
      inventory_manager: { email: 'inventory@company.com', pass: 'password123', portal: 'company' },
      customer: { email: 'customer@apex.com', pass: 'password123', portal: 'customer' },
      vendor: { email: 'vendor@apexsolutions.com', pass: 'password123', portal: 'vendor' },
    };

    const creds = demoCredentials[roleKey];
    if (creds) {
      return await login(creds.email, creds.pass, creds.portal);
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    registerVendor,
    quickSwitchRole,
    logout,
    isAdmin: user?.role === 'admin',
    isProcurementManager: user?.role === 'procurement_manager' || user?.role === 'admin',
    isFinanceManager: user?.role === 'finance_manager' || user?.role === 'admin',
    isInventoryManager: user?.role === 'inventory_manager' || user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    isVendor: user?.role === 'vendor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
