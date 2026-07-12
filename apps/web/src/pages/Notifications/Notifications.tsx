import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Shield, Wrench, FileText, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import apiClient from '../../api/client';

const TABS = ['All', 'Unread', 'License', 'Maintenance', 'Documents', 'Dispatch'];

const TYPE_ICON: Record<string, any> = {
  license_expiry: Shield, insurance_expiry: FileText, maintenance_due: Wrench,
  dispatch_conflict: Route, document_expiry: FileText,
};

const TYPE_COLOR: Record<string, string> = {
  license_expiry: 'text-orange-500 bg-orange-50',
  insurance_expiry: 'text-red-500 bg-red-50',
  maintenance_due: 'text-purple-500 bg-purple-50',
  dispatch_conflict: 'text-blue-500 bg-blue-50',
  document_expiry: 'text-yellow-500 bg-yellow-50',
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications?pageSize=30');
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.isRead;
    if (activeTab === 'License') return n.type === 'license_expiry';
    if (activeTab === 'Maintenance') return n.type === 'maintenance_due';
    if (activeTab === 'Documents') return n.type === 'insurance_expiry' || n.type === 'document_expiry';
    if (activeTab === 'Dispatch') return n.type === 'dispatch_conflict';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Notifications & Alerts
            {unreadCount > 0 && (
              <span className="text-sm bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">License expiries, maintenance reminders, and dispatch alerts</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead} className="text-xs">
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab}
            {tab === 'Unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-4">
              <CheckCheck className="h-8 w-8 text-green-400" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              {activeTab === 'Unread' ? 'All caught up!' : 'No notifications'}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'Unread' ? 'You have no unread notifications.' : 'No notifications match this filter.'}
            </p>
          </div>
        ) : (
          filtered.map((n: any) => {
            const Icon = TYPE_ICON[n.type] || Bell;
            const colorCls = TYPE_COLOR[n.type] || 'text-gray-500 bg-gray-50';
            return (
              <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${!n.isRead ? 'bg-card border-indigo-100 shadow-sm' : 'bg-muted/20 border-transparent'}`}>
                <div className={`p-2.5 rounded-xl shrink-0 ${colorCls}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n.id)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-indigo-50 text-muted-foreground hover:text-indigo-600 transition-colors" title="Mark as read">
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
