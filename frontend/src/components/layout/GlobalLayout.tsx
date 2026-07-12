import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const GlobalLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen, globalLoading } = useUiStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out border-r border-border hidden md:flex flex-col bg-card`}
      >
        <Sidebar collapsed={!sidebarOpen} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden w-full relative">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
          <div className="mx-auto max-w-7xl relative h-full">
            {globalLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
