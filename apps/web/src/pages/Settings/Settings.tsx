import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Lock, Bell, Palette, Shield, Building } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'organization', label: 'Organization', icon: Building },
];

export const Settings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(prev => !prev);
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account, organization, and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="flex flex-row md:flex-col gap-1 md:w-48 shrink-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-border">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                    {user?.fullName?.[0] ?? 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.role}</p>
                  </div>
                </div>
                {[
                  { label: 'Full Name', value: user?.fullName, type: 'text' },
                  { label: 'Email Address', value: user?.email, type: 'email' },
                  { label: 'Phone', value: '', type: 'tel' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                    <input defaultValue={f.value || ''} type={f.type}
                      className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                ))}
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                  <div key={l}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{l}</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                ))}
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Update Password</Button>

                <div className="pt-5 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-3">Session Security</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Current Session', when: 'Right now', ip: '192.168.1.1', current: true },
                      { label: 'Previous Login', when: 'Yesterday at 9:32 AM', ip: '192.168.1.1', current: false },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{s.label}</p>
                            {s.current && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Active</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{s.when} · {s.ip}</p>
                        </div>
                        {!s.current && <Button variant="outline" size="sm" className="text-xs text-red-500 border-red-200">Revoke</Button>}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Use dark theme across the entire app</p>
                  </div>
                  <button onClick={toggleDark}
                    className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5.5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-3">Driver Rest Threshold</p>
                  <p className="text-sm text-muted-foreground mb-3">Minimum hours between trips before a safety warning is shown during dispatch.</p>
                  <div className="flex items-center gap-3">
                    <input type="number" defaultValue={2} min={1} max={12}
                      className="w-20 h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <span className="text-sm text-muted-foreground">hours</span>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">Save</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'License Expiry Alerts', desc: 'Get notified 30, 7, and 1 day before driver license expiry' },
                  { label: 'Insurance Expiry Alerts', desc: 'Reminders for vehicle insurance renewal' },
                  { label: 'Maintenance Due', desc: 'Alerts when scheduled maintenance is approaching or overdue' },
                  { label: 'Dispatch Conflicts', desc: 'Warnings when a dispatch rule is overridden' },
                  { label: 'Document Expiry', desc: 'Permit, PUC, and RC expiry notifications' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <label className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-600" />
                      <span className="text-xs text-muted-foreground">In-app</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-600" />
                    </label>
                  </div>
                ))}
                <Button className="bg-orange-500 hover:bg-orange-600 text-white mt-2">Save Preferences</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'organization' && (
            <Card>
              <CardHeader><CardTitle>Organization Settings</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: 'Organization Name', value: 'FleetPilot Org', type: 'text' },
                  { label: 'Timezone', value: 'Asia/Kolkata', type: 'text' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                    <input defaultValue={f.value} type={f.type}
                      className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                ))}
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Save Organization</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
