import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useAuthStore } from './store/auth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerForm } from './pages/customers/CustomerForm';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { ProductList } from './pages/products/ProductList';
import { ProductForm } from './pages/products/ProductForm';
import { ProductDetail } from './pages/products/ProductDetail';
import { ChallanList } from './pages/challans/ChallanList';
import { ChallanCreate } from './pages/challans/ChallanCreate';
import { ChallanDetail } from './pages/challans/ChallanDetail';

function Protected() {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/challans" element={<ChallanList />} />
        <Route path="/challans/new" element={<ChallanCreate />} />
        <Route path="/challans/:id" element={<ChallanDetail />} />
      </Route>
    </Routes>
  );
}
