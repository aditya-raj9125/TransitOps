import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, AlertTriangle, Star, Clock, Loader2, Route, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import apiClient from '../../api/client';

const STATUS_CLASSES: Record<string, string> = {
  Available: 'text-status-available bg-status-available',
  OnTrip: 'text-status-ontrip bg-status-ontrip',
  InShop: 'text-status-maintenance bg-status-maintenance',
  Retired: 'text-status-retired bg-status-retired',
};

export const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get(`/vehicles/${id}`),
      apiClient.get(`/trips?vehicleId=${id}&pageSize=10`).catch(() => ({ data: { data: [] } })),
      apiClient.get(`/maintenance?vehicleId=${id}&pageSize=10`).catch(() => ({ data: { data: [] } })),
    ]).then(([vRes, tRes, mRes]) => {
      setVehicle(vRes.data?.data || vRes.data);
      setTrips(tRes.data?.data || []);
      setMaintenance(mRes.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!vehicle) return <div className="text-center py-20 text-muted-foreground">Vehicle not found</div>;

  const sc = STATUS_CLASSES[vehicle.status] || 'bg-muted text-muted-foreground';
  const tabs = ['overview', 'trips', 'maintenance'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link to="/vehicles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Vehicle Registry
      </Link>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl">
                <Truck className="h-10 w-10 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{vehicle.registrationNumber}</h1>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sc}`}>{vehicle.status}</span>
                </div>
                <p className="text-muted-foreground">{vehicle.nameModel}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{vehicle.type} · {vehicle.fuelType}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Odometer</p>
                <p className="text-lg font-bold text-foreground">{vehicle.odometerKm?.toLocaleString() ?? '—'}<span className="text-xs font-normal ml-1">km</span></p>
              </div>
              <div className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                <p className="text-lg font-bold text-foreground">{vehicle.maxLoadCapacityKg?.toLocaleString() ?? '—'}<span className="text-xs font-normal ml-1">kg</span></p>
              </div>
              <div className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Trips Done</p>
                <p className="text-lg font-bold text-foreground">{trips.length || '—'}</p>
              </div>
            </div>
          </div>

          {/* Document expiry warnings */}
          {[
            { label: 'Insurance', date: vehicle.insuranceExpiryDate },
            { label: 'Permit', date: vehicle.permitExpiryDate },
            { label: 'PUC', date: vehicle.pucExpiryDate },
          ].filter(d => d.date && new Date(d.date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).map(d => (
            <div key={d.label} className="mt-3 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {d.label} expires {new Date(d.date!).toLocaleDateString()} — renewal required
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >{tab === 'trips' ? 'Trip History' : tab === 'maintenance' ? 'Maintenance' : 'Overview'}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Registration Number', value: vehicle.registrationNumber },
                { label: 'Model', value: vehicle.nameModel },
                { label: 'Type', value: vehicle.type },
                { label: 'Fuel Type', value: vehicle.fuelType },
                { label: 'Max Load Capacity', value: vehicle.maxLoadCapacityKg ? `${vehicle.maxLoadCapacityKg} kg` : '—' },
                { label: 'Acquisition Date', value: vehicle.acquisitionDate ? new Date(vehicle.acquisitionDate).toLocaleDateString() : '—' },
                { label: 'Acquisition Cost', value: vehicle.acquisitionCost ? `₹${parseFloat(vehicle.acquisitionCost).toLocaleString()}` : '—' },
                { label: 'Insurance Expiry', value: vehicle.insuranceExpiryDate ? new Date(vehicle.insuranceExpiryDate).toLocaleDateString() : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value || '—'}</span>
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
              <div className="py-16 text-center">
                <Route className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No trips recorded for this vehicle yet.</p>
              </div>
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
                    <tr key={t.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-3 text-xs font-mono text-foreground">{t.tripCode || t.id?.slice(0, 8)}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{t.source} → {t.destination}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{t.scheduledStart ? new Date(t.scheduledStart).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.status === 'Completed' ? 'text-status-available bg-status-available' : t.status === 'Cancelled' ? 'text-status-cancelled bg-status-cancelled' : 'text-status-ontrip bg-status-ontrip'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'maintenance' && (
        <Card>
          <CardContent className="p-0">
            {maintenance.length === 0 ? (
              <div className="py-16 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No maintenance records for this vehicle.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Cost</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Date</th>
                </tr></thead>
                <tbody>
                  {maintenance.map((m: any) => (
                    <tr key={m.id} className="border-b border-border hover:bg-muted/40">
                      <td className="px-6 py-3 text-xs font-medium text-foreground">{m.maintenanceType}</td>
                      <td className="px-3 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.status === 'Closed' ? 'text-status-available bg-status-available' : 'text-status-maintenance bg-status-maintenance'}`}>{m.status}</span></td>
                      <td className="px-3 py-3 text-xs text-foreground">{m.cost ? `₹${parseFloat(m.cost).toLocaleString()}` : '—'}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
