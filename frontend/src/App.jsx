import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Import Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import AlertDetailPage from './pages/AlertDetailPage';
import StatisticsPage from './pages/StatisticsPage';

// AI Enterprise Module Pages
import InvestigationPage from './pages/InvestigationPage';
import AttackTimelinePage from './pages/AttackTimelinePage';
import ThreatIntelPage from './pages/ThreatIntelPage';
import IncidentReportsPage from './pages/IncidentReportsPage';

import DashboardLayout from './components/layout/DashboardLayout';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout Injector for Protected Routes
const DashboardLayoutWrapper = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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

            {/* AI Enterprise Security Modules */}
            <Route 
              path="/investigation" 
              element={
                <DashboardLayoutWrapper>
                  <InvestigationPage />
                </DashboardLayoutWrapper>
              } 
            />
            <Route 
              path="/attack-timeline" 
              element={
                <DashboardLayoutWrapper>
                  <AttackTimelinePage />
                </DashboardLayoutWrapper>
              } 
            />
            <Route 
              path="/threat-intel" 
              element={
                <DashboardLayoutWrapper>
                  <ThreatIntelPage />
                </DashboardLayoutWrapper>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <DashboardLayoutWrapper>
                  <IncidentReportsPage />
                </DashboardLayoutWrapper>
              } 
            />

            {/* Fallback Redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
