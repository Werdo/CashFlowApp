import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetsModule from './pages/modules/AssetsModule';
import MaintenanceModule from './pages/modules/MaintenanceModule';
import MovementsModule from './pages/modules/MovementsModule';
import DepositModule from './pages/modules/DepositModule';
import ReportsModule from './pages/modules/ReportsModule';
import InvoicingModule from './pages/modules/InvoicingModule';
import Settings from './pages/Settings';
import Layout from './components/Layout';

// Admin pages
import AdminClients from './pages/admin/AdminClients';
import AdminArticles from './pages/admin/AdminArticles';
import AdminWarehouses from './pages/admin/AdminWarehouses';
import AdminStock from './pages/admin/AdminStock';
import AdminLots from './pages/admin/AdminLots';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/assets/*" element={<AssetsModule />} />
            <Route path="/maintenance/*" element={<MaintenanceModule />} />
            <Route path="/movements/*" element={<MovementsModule />} />
            <Route path="/deposit/*" element={<DepositModule />} />
            <Route path="/reports/*" element={<ReportsModule />} />
            <Route path="/invoicing/*" element={<InvoicingModule />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin routes */}
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/warehouses" element={<AdminWarehouses />} />
            <Route path="/admin/stock" element={<AdminStock />} />
            <Route path="/admin/lots" element={<AdminLots />} />
            <Route path="/admin/users" element={<AdminUsers />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
