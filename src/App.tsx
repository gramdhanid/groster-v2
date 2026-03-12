import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Lazy loaded pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const TransactionPage = lazy(() => import('./pages/TransactionPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));

// Loading skeleton/spinner
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<AddProduct />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/transactions/new" element={<TransactionPage />} />
            <Route path="/transactions/payment" element={<PaymentPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

