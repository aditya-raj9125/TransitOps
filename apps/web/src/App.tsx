import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalLayout } from './components/layout/GlobalLayout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Trips } from './pages/Trips/Trips';
import { TripDetail } from './pages/Trips/TripDetail';
import { Vehicles } from './pages/Vehicles/Vehicles';
import { VehicleDetail } from './pages/Vehicles/VehicleDetail';
import { Drivers } from './pages/Drivers/Drivers';
import { DriverDetail } from './pages/Drivers/DriverDetail';
import { Maintenance } from './pages/Maintenance/Maintenance';
import { FuelExpenses } from './pages/Fuel/FuelExpenses';
import { Reports } from './pages/Reports/Reports';
import { Notifications } from './pages/Notifications/Notifications';
import { AuditLog } from './pages/Audit/AuditLog';
import { Documents } from './pages/Documents/Documents';
import { Settings } from './pages/Settings/Settings';
import { LoginPage } from './pages/Auth/LoginPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage';
import { LandingPage } from './pages/Landing/LandingPage';
import { NewTripForm } from './pages/Trips/NewTripForm';
import { OperationsCalendar } from './pages/Calendar/OperationsCalendar';
import { useAuthStore } from './store/authStore';

// Persist dark mode preference on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-sm text-muted-foreground">This module is coming soon.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<GlobalLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Trips */}
          <Route path="/dispatch" element={<Trips />} />
          <Route path="/dispatch/new" element={<NewTripForm />} />
          <Route path="/trips" element={<Navigate to="/dispatch" replace />} />
          <Route path="/trips/:id" element={<TripDetail />} />

          {/* Vehicles */}
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />

          {/* Drivers */}
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/drivers/:id" element={<DriverDetail />} />

          {/* Operational */}
          <Route path="/calendar" element={<OperationsCalendar />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/fuel" element={<FuelExpenses />} />

          {/* Analytics */}
          <Route path="/reports" element={<Reports />} />

          {/* System */}
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<ComingSoon title="User Profile" />} />

          {/* Root redirect */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
