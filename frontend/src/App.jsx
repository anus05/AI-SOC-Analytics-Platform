import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import AlertDetailPage from './pages/AlertDetailPage';
import StatisticsPage from './pages/StatisticsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout Injector for Protected Routes
import DashboardLayout from './components/layout/DashboardLayout';
const DashboardLayoutWrapper = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Endpoint */}
          <Route path="/login" element={<LoginPage />} />

          {/* Secure Operator Canvas */}
          <Route 
            path="/" 
            element={
              <DashboardLayoutWrapper>
                <DashboardPage />
              </DashboardLayoutWrapper>
            } 
          />
          <Route 
            path="/alerts" 
            element={
              <DashboardLayoutWrapper>
                <AlertsPage />
              </DashboardLayoutWrapper>
            } 
          />
          <Route 
            path="/alerts/:id" 
            element={
              <DashboardLayoutWrapper>
                <AlertDetailPage />
              </DashboardLayoutWrapper>
            } 
          />
          <Route 
            path="/statistics" 
            element={
              <DashboardLayoutWrapper>
                <StatisticsPage />
              </DashboardLayoutWrapper>
            } 
          />

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
