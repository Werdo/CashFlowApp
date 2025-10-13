import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout/Layout';
import NotificationContainer from './components/Notifications/NotificationContainer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

// Import legacy CashFlow component (with auth built-in)
import CashFlowApp from './CashFlowApp';

// Import pages
import Dashboard from './pages/Dashboard/Dashboard';
import Calendar from './pages/Calendar/Calendar';
import Analytics from './pages/Analytics/Analytics';
import Transactions from './pages/Transactions/Transactions';
import Categories from './pages/Categories/Categories';
import Alerts from './pages/Alerts/Alerts';
import Reports from './pages/Reports/Reports';
import Documents from './pages/Documents/Documents';
import Export from './pages/Export/Export';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import Help from './pages/Help/Help';
import AIAnalysis from './pages/AIAnalysis/AIAnalysis';
import AISettings from './pages/AISettings/AISettings';

// Admin pages
import AdminBackend from './pages/Admin/AdminBackend';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminDatabase from './pages/Admin/AdminDatabase';
import AdminSecurity from './pages/Admin/AdminSecurity';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SidebarProvider>
          <Router>
            <AppContent />
          </Router>
          <NotificationContainer />
        </SidebarProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <Routes>
      {/* Main route - CashFlow App (has auth and Layout built-in) */}
      <Route path="/" element={<CashFlowApp />} />

      {/* Protected routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <Layout><Calendar /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Layout><Analytics /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <PrivateRoute>
            <Layout><Transactions /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <Layout><Categories /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <PrivateRoute>
            <Layout><Alerts /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Layout><Reports /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <Layout><Documents /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/export"
        element={
          <PrivateRoute>
            <Layout><Export /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout><Settings /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout><Profile /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/help"
        element={
          <PrivateRoute>
            <Layout><Help /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ai-analysis"
        element={
          <PrivateRoute>
            <Layout><AIAnalysis /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ai-settings"
        element={
          <PrivateRoute>
            <Layout><AISettings /></Layout>
          </PrivateRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/backend"
        element={
          <PrivateRoute>
            <Layout><AdminBackend /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <Layout><AdminUsers /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/database"
        element={
          <PrivateRoute>
            <Layout><AdminDatabase /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/security"
        element={
          <PrivateRoute>
            <Layout><AdminSecurity /></Layout>
          </PrivateRoute>
        }
      />

      {/* Catch all - redirect to main */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
