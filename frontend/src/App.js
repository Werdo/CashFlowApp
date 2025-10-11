import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout/Layout';
import NotificationContainer from './components/Notifications/NotificationContainer';

// Import legacy CashFlow component (we'll keep it for now)
import CashFlowApp from './CashFlowApp';

// Import new pages
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
      {/* Main route - CashFlow App original (sin Layout porque ya lo tiene) */}
      <Route path="/" element={<CashFlowApp />} />

      {/* New pages with Layout */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
      <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
      <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
      <Route path="/categories" element={<Layout><Categories /></Layout>} />
      <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
      <Route path="/reports" element={<Layout><Reports /></Layout>} />
      <Route path="/documents" element={<Layout><Documents /></Layout>} />
      <Route path="/export" element={<Layout><Export /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/help" element={<Layout><Help /></Layout>} />
      <Route path="/ai-analysis" element={<Layout><AIAnalysis /></Layout>} />
      <Route path="/ai-settings" element={<Layout><AISettings /></Layout>} />
    </Routes>
  );
}

export default App;
