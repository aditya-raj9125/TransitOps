import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Bell, Search, Settings, User, LogOut, Moon, Sun, Menu } from 'lucide-react';

export const Header = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6 shrink-0">
      {/* Left: Collapse & Global Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:flex relative max-w-sm w-full items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder='Search vehicles, drivers, trips...'
            className="h-9 w-full rounded-xl border border-input bg-muted/50 pl-9 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background"
          />
          <kbd className="absolute right-3 text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 hidden xl:block">⌘K</kbd>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Bell */}
        <Link to="/notifications"
          className="relative h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
        </Link>

        <div className="w-px h-6 bg-border mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 h-9 px-2 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.[0] ?? 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">{user?.fullName ?? 'User'}</p>
              <p className="text-[10px] text-muted-foreground">{user?.role ?? 'Admin'}</p>
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link to="/profile" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-muted transition-colors">
                    <User className="h-4 w-4 text-muted-foreground" /> My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-muted transition-colors">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                  </Link>
                  <div className="my-1 h-px bg-border" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
