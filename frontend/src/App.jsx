import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Dedicated Login Pages
import CentralLoginHub from './pages/CentralLoginHub';
import CompanyLoginPage from './pages/CompanyLoginPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Main Application Pages
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import RfqsPage from './pages/RfqsPage';
import RfqDetailPage from './pages/RfqDetailPage';
import VendorComparisonPage from './pages/VendorComparisonPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PoDetailPage from './pages/PoDetailPage';
import InventoryPage from './pages/InventoryPage';
import WarrantyClaimsPage from './pages/WarrantyClaimsPage';
import FinancePage from './pages/FinancePage';
import AuditLogsPage from './pages/AuditLogsPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ERP Application Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">!</div>
            <h2 className="text-xl font-bold font-heading">Session State Reset Required</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'An unexpected session state error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl transition"
            >
              Reset ERP Cache & Return to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">Loading ERP Environment...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Portals */}
          <Route path="/login" element={<CentralLoginHub />} />
          <Route path="/login/company" element={<CompanyLoginPage />} />
          <Route path="/login/customer" element={<CustomerLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/:id" element={<VendorDetailPage />} />
            <Route path="/rfqs" element={<RfqsPage />} />
            <Route path="/rfqs/:id" element={<RfqDetailPage />} />
            <Route path="/rfqs/:id/compare" element={<VendorComparisonPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/:id" element={<PoDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/warranty" element={<WarrantyClaimsPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
  );
}
