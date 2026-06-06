import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ConnectionsPage from './pages/connections/ConnectionsPage';
import NewConnectionPage from './pages/connections/NewConnectionPage';
import ConnectionDetailPage from './pages/connections/ConnectionDetailPage';
import ExplorerPage from './pages/explorer/ExplorerPage';
import TransfersPage from './pages/transfers/TransfersPage';
import NewTransferPage from './pages/transfers/NewTransferPage';
import TransferDetailPage from './pages/transfers/TransferDetailPage';
import MonitoringPage from './pages/monitoring/MonitoringPage';
import SettingsPage from './pages/settings/SettingsPage';
import TransferHistoryPage from './pages/transfers/TransferHistoryPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/connections/new" element={<NewConnectionPage />} />
        <Route path="/connections/:id" element={<ConnectionDetailPage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/transfers" element={<TransfersPage />} />
        <Route path="/transfers/new" element={<NewTransferPage />} />
        <Route path="/transfer-history" element={<TransferHistoryPage />} />
        <Route path="/transfers/:id" element={<TransferDetailPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
      />
    </Routes>
  );
}

export default App;