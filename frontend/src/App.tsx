import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalLayout } from './components/layout/GlobalLayout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Trips } from './pages/Trips/Trips';
import { Vehicles } from './pages/Vehicles/Vehicles';
import { Drivers } from './pages/Drivers/Drivers';
import { FuelExpenses, Maintenance } from './pages/Placeholders';
import { useAuthStore } from './store/authStore';

const Login = () => {
  const { setAuth } = useAuthStore();
  
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FleetPilot</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          // Mock login for scaffold
          setAuth({ id: '1', email: 'admin@fleetpilot.dev', fullName: 'System Admin', role: 'Admin', orgId: 'org_1', themePreference: 'light' }, 'mock_token');
        }}>
          <div>
            <label className="text-sm font-medium leading-none mb-1.5 block">Email</label>
            <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="admin@fleetpilot.dev" required />
          </div>
          <div>
            <label className="text-sm font-medium leading-none mb-1.5 block">Password</label>
            <input type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="••••••••" required />
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-6">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/fuel" element={<FuelExpenses />} />
          <Route path="/maintenance" element={<Maintenance />} />
          {/* Placeholders for other routes */}
          <Route path="*" element={<div className="p-8 text-center text-muted-foreground">Module coming soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
