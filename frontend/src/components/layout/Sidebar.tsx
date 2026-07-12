import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Users, Route, Wrench, 
  Droplet, FileText, Settings, ShieldCheck, FileBarChart
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

const MENU_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trips', icon: Route, label: 'Trips & Dispatch' },
  { path: '/vehicles', icon: Truck, label: 'Vehicles' },
  { path: '/drivers', icon: Users, label: 'Drivers' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/fuel', icon: Droplet, label: 'Fuel & Expenses' },
  { path: '/documents', icon: FileText, label: 'Documents' },
  { path: '/reports', icon: FileBarChart, label: 'Reports' },
  { path: '/audit', icon: ShieldCheck, label: 'Audit Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = ({ collapsed }: SidebarProps) => {
  return (
    <div className="flex h-full flex-col py-4">
      <div className="px-4 mb-6 flex items-center justify-center h-10">
        {!collapsed ? (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FleetPilot
          </span>
        ) : (
          <span className="text-xl font-bold text-primary">FP</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-4 border border-primary/10">
            <h4 className="font-semibold text-sm mb-1">FleetPilot Pro</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock AI route optimization
            </p>
            <button className="w-full text-xs font-medium bg-primary text-primary-foreground py-1.5 rounded-md hover:bg-primary/90 transition-colors">
              Upgrade
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
