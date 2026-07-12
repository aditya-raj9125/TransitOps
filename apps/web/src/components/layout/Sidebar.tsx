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
    <div className="flex h-full flex-col bg-[#111827] text-gray-300 relative">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-white/10 shrink-0',
        collapsed ? 'justify-center px-2' : 'px-5 gap-3'
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8L8 2L14 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 14V8H11V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight">FleetPilot</span>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
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
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-100',
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

      {/* Help Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-white">Need help?</span>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">Check docs or contact support</p>
          <a
            href="https://github.com/aditya-raj9125/TransitOps"
            target="_blank"
            rel="noreferrer"
            className="block text-center text-[11px] font-medium bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            View Docs
          </a>
        </div>
      )}

      {/* User + Collapse */}
      <div className="border-t border-white/10 p-2 space-y-1 shrink-0">
        <NavLink
          to="/profile"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {user?.fullName?.[0] ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{user?.fullName ?? 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.role ?? 'Admin'}</p>
            </div>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center rounded-lg py-1.5 text-gray-600 hover:text-gray-400 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
