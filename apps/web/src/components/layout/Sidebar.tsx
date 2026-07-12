import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Droplet, FileText, Settings, ShieldCheck, FileBarChart,
  Bell, Calendar, ChevronLeft, ChevronRight, HelpCircle,
  LogOut, User
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/dispatch', icon: Route, label: 'Dispatch Console' },
      { path: '/calendar', icon: Calendar, label: 'Calendar' },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { path: '/vehicles', icon: Truck, label: 'Vehicle Registry' },
      { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
    ],
  },
  {
    label: 'People',
    items: [
      { path: '/drivers', icon: Users, label: 'Driver Roster' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/fuel', icon: Droplet, label: 'Fuel & Expense' },
      { path: '/reports', icon: FileBarChart, label: 'Reports & Analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/documents', icon: FileText, label: 'Documents Vault' },
      { path: '/notifications', icon: Bell, label: 'Notifications' },
      { path: '/audit', icon: ShieldCheck, label: 'Audit Log' },
      { path: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-card border-r border-border text-muted-foreground relative">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-border shrink-0',
        collapsed ? 'justify-center px-2' : 'px-5 gap-3'
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8L8 2L14 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 14V8H11V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="text-foreground font-bold text-lg tracking-tight">FleetPilot</span>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 sidebar-nav-item',
                    isActive
                      ? 'sidebar-nav-active'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-2 space-y-1 shrink-0">
        <NavLink
          to="/profile"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
            {user?.fullName?.[0] ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{user?.fullName ?? 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.role ?? 'Admin'}</p>
            </div>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
};
