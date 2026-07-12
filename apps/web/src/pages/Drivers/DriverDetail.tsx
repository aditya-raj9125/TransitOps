import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Star, Shield, Route, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/client';

const STATUS_CLASSES: Record<string, string> = {
  Available: 'text-status-available bg-status-available',
  OnTrip: 'text-status-ontrip bg-status-ontrip',
  OffDuty: 'text-status-retired bg-status-retired',
  Suspended: 'text-status-cancelled bg-status-cancelled',
};

export const DriverDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get(`/drivers/${id}`),
      apiClient.get(`/trips?driverId=${id}&pageSize=10`).catch(() => ({ data: { data: [] } })),
    ]).then(([dRes, tRes]) => {
      setDriver(dRes.data?.data || dRes.data);
      setTrips(tRes.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!driver) return <div className="text-center py-20 text-muted-foreground">Driver not found</div>;

  const sc = STATUS_CLASSES[driver.status] || 'bg-muted text-muted-foreground';
  const score = driver.safetyScore ?? 100;
  const licenseExpiry = driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate) : null;
  const daysToExpiry = licenseExpiry ? Math.floor((licenseExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  // Empty array to replace mock score trend
  const scoreTrend: any[] = [];

  const tabs = ['overview', 'trips', 'safety'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link to="/drivers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Driver Roster
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold shrink-0">
              {driver.fullName?.[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{driver.fullName}</h1>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sc}`}>{driver.status}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{driver.contactNumber || driver.phone || 'N/A'}</div>
                <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />{driver.licenseNumber} ({driver.licenseCategory})</div>
                {licenseExpiry && (
                  <div className={`flex items-center gap-1.5 ${daysToExpiry !== null && daysToExpiry < 30 ? 'text-orange-500 font-medium' : ''}`}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    License expires {licenseExpiry.toLocaleDateString()}
                    {daysToExpiry !== null && daysToExpiry < 30 && ` (${daysToExpiry}d remaining)`}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center shrink-0">
              <div className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Safety Score</p>
                <p className={`text-xl font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-red-500'}`}>{score}</p>
              </div>
              <div className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Total Trips</p>
                <p className="text-xl font-bold text-foreground">{driver.totalTripsCompleted ?? trips.length}</p>
              </div>
              <div className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Last Trip</p>
                <p className="text-sm font-bold text-foreground">{driver.lastTripCompletedAt ? new Date(driver.lastTripCompletedAt).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab === 'trips' ? 'Trip History' : tab === 'safety' ? 'Safety Trend' : 'Overview'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', value: driver.fullName },
                { label: 'License Number', value: driver.licenseNumber },
                { label: 'License Category', value: driver.licenseCategory },
                { label: 'License Expiry', value: driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toLocaleDateString() : '—' },
                { label: 'Contact', value: driver.contactNumber || driver.phone || '—' },
                { label: 'Email', value: driver.email || '—' },
                { label: 'Date Joined', value: driver.dateJoined ? new Date(driver.dateJoined).toLocaleDateString() : '—' },
                { label: 'Region', value: driver.region?.name || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'trips' && (
        <Card>
          <CardContent className="p-0">
            {trips.length === 0 ? (
              <div className="py-16 text-center"><Route className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">No trips recorded for this driver yet.</p></div>
            ) : (
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Trip Code</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Route</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {trips.map((t: any) => (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/40">
                      <td className="px-6 py-3 text-xs font-mono text-foreground">{t.tripCode || t.id?.slice(0, 8)}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{t.source} → {t.destination}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{t.scheduledStart ? new Date(t.scheduledStart).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.status === 'Completed' ? 'text-status-available bg-status-available' : t.status === 'Cancelled' ? 'text-status-cancelled bg-status-cancelled' : 'text-status-ontrip bg-status-ontrip'}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'safety' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Safety Score Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreTrend} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
