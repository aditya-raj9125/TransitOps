import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Truck, Users, Wrench, Route, Clock, TrendingUp,
  AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Activity, IndianRupee, Percent, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import apiClient from '../../api/client';

const COLORS = ['#4F46E5', '#F97316', '#A855F7', '#10B981'];

const utilizationData: any[] = [];
const costData: any[] = [];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.value}{p.name === 'utilization' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="h-4 bg-muted rounded w-24 mb-3" />
      <div className="h-8 bg-muted rounded w-16" />
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes, tripsRes, notifRes] = await Promise.all([
          apiClient.get('/vehicles?pageSize=100').catch(() => ({ data: { data: [] } })),
          apiClient.get('/drivers?pageSize=100').catch(() => ({ data: { data: [] } })),
          apiClient.get('/trips?pageSize=8&sortBy=createdAt&sortOrder=desc').catch(() => ({ data: { data: [] } })),
          apiClient.get('/notifications?pageSize=5').catch(() => ({ data: { data: [] } })),
        ]);

        const vehicles = vehiclesRes.data?.data || [];
        const drivers = driversRes.data?.data || [];
        const tripsData = tripsRes.data?.data || [];

        const activeVehicles = vehicles.filter((v: any) => v.status !== 'Retired').length;
        const availableVehicles = vehicles.filter((v: any) => v.status === 'Available').length;
        const inMaintenance = vehicles.filter((v: any) => v.status === 'InShop').length;
        const activeTrips = vehicles.filter((v: any) => v.status === 'OnTrip').length;
        const driversOnDuty = drivers.filter((d: any) => d.status === 'OnTrip').length;
        const utilization = activeVehicles > 0 ? Math.round((activeTrips / activeVehicles) * 100) : 0;

        setStats({ activeVehicles, availableVehicles, inMaintenance, activeTrips, driversOnDuty, utilization });
        setTrips(tripsData);
        setAlerts(notifRes.data?.data || []);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = stats ? [
    { label: 'Active Vehicles', value: stats.activeVehicles, icon: Truck, color: 'bg-indigo-50 text-indigo-600', delta: '+2' },
    { label: 'Available', value: stats.availableVehicles, icon: CheckCircle2, color: 'bg-green-50 text-green-600', delta: null },
    { label: 'In Maintenance', value: stats.inMaintenance, icon: Wrench, color: 'bg-purple-50 text-purple-600', delta: null },
    { label: 'Active Trips', value: stats.activeTrips, icon: Route, color: 'bg-blue-50 text-blue-600', delta: '+3' },
    { label: 'Pending Trips', value: trips.filter(t => t.status === 'Draft').length, icon: Clock, color: 'bg-orange-50 text-orange-600', delta: null },
    { label: 'Drivers On Duty', value: stats.driversOnDuty, icon: Users, color: 'bg-pink-50 text-pink-600', delta: null },
    { label: 'Fleet Utilization', value: `${stats.utilization}%`, icon: Percent, color: 'bg-teal-50 text-teal-600', delta: '+12%' },
  ] : [];

  const statusConfig: Record<string, { label: string; cls: string }> = {
    Draft: { label: 'Draft', cls: 'text-status-draft bg-status-draft' },
    Dispatched: { label: 'Dispatched', cls: 'text-status-ontrip bg-status-ontrip' },
    InTransit: { label: 'In Transit', cls: 'text-status-ontrip bg-status-ontrip' },
    Completed: { label: 'Completed', cls: 'text-status-available bg-status-available' },
    Cancelled: { label: 'Cancelled', cls: 'text-status-cancelled bg-status-cancelled' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time fleet operations overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot inline-block"></span>
          Live sync active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi) => (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground leading-tight">{kpi.label}</p>
                  <div className={`p-1.5 rounded-lg ${kpi.color.split(' ')[0]}`}>
                    <kpi.icon className={`h-3.5 w-3.5 ${kpi.color.split(' ')[1]}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                {kpi.delta && (
                  <p className="text-xs text-green-600 font-medium mt-1">{kpi.delta} this week</p>
                )}
              </CardContent>
            </Card>
          ))
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Utilization Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Fleet Utilization — Last 12 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={utilizationData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="utilization" stroke="#4F46E5" strokeWidth={2} fill="url(#utilGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-orange-500" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={costData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {costData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
              {costData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name} {d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Trips + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Trips */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Trips</CardTitle>
              <Link to="/dispatch" className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-border animate-pulse">
                    <div className="h-3 w-20 bg-muted rounded" />
                    <div className="flex-1 h-3 bg-muted rounded" />
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="py-12 text-center">
                <Route className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No trips yet. <Link to="/dispatch" className="text-indigo-600 hover:underline">Create your first trip →</Link></p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-2">Trip</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Route</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-6 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip: any) => {
                    const sc = statusConfig[trip.status] || { label: trip.status, cls: 'text-gray-600 bg-gray-100' };
                    return (
                      <tr key={trip.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                        <td className="px-6 py-3">
                          <p className="text-xs font-mono font-medium text-foreground">{trip.tripCode || trip.id?.split('-')[0]}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{trip.source} → {trip.destination}</p>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Link to={`/trips/${trip.id}`} className="text-xs text-indigo-600 hover:underline">View</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Alerts Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Alerts & Notifications
              </CardTitle>
              <Link to="/notifications" className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)
            ) : alerts.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All clear! No active alerts.</p>
              </div>
            ) : (
              alerts.map((alert: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                    alert.type?.includes('expiry') ? 'bg-orange-500' :
                    alert.type?.includes('maintenance') ? 'bg-purple-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
