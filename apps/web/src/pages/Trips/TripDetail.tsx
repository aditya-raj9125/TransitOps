import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, User, Clock, Package, ChevronRight, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import apiClient from '../../api/client';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  Draft: { label: 'Draft', cls: 'text-status-draft bg-status-draft' },
  Dispatched: { label: 'Dispatched', cls: 'text-status-ontrip bg-status-ontrip' },
  InTransit: { label: 'In Transit', cls: 'text-status-ontrip bg-status-ontrip' },
  Completed: { label: 'Completed', cls: 'text-status-available bg-status-available' },
  Cancelled: { label: 'Cancelled', cls: 'text-status-cancelled bg-status-cancelled' },
};

const TIMELINE_STEPS = ['Draft', 'Dispatched', 'InTransit', 'Completed'];

export const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/trips/${id}`).then(res => {
      setTrip(res.data?.data || res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const doAction = async (endpoint: string) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/trips/${id}/${endpoint}`);
      const res = await apiClient.get(`/trips/${id}`);
      setTrip(res.data?.data || res.data);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!trip) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Trip not found</p>
      <Link to="/trips" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">← Back to Dispatch Console</Link>
    </div>
  );

  const sc = STATUS_CONFIG[trip.status] || { label: trip.status, cls: 'bg-muted text-muted-foreground' };
  const currentStepIndex = TIMELINE_STEPS.indexOf(trip.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back */}
      <Link to="/trips" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dispatch Console
      </Link>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground font-mono">{trip.tripCode || trip.id?.slice(0, 8)}</h1>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-foreground">{trip.source}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">{trip.destination}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {trip.status === 'Draft' && (
                <Button onClick={() => doAction('dispatch')} disabled={actionLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Dispatch Trip
                </Button>
              )}
              {trip.status === 'Dispatched' && (
                <>
                  <Button onClick={() => doAction('complete')} disabled={actionLoading} className="bg-green-500 hover:bg-green-600 text-white">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Mark Complete
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if (confirm('Are you sure you want to cancel this trip?')) doAction('cancel');
                  }} disabled={actionLoading} className="text-red-500 border-red-200 hover:bg-red-50">
                    Cancel Trip
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Timeline */}
          {trip.status !== 'Cancelled' && (
            <div className="mt-6 flex items-center gap-0">
              {TIMELINE_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      i < currentStepIndex ? 'bg-green-500 text-white' :
                      i === currentStepIndex ? 'bg-primary text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step === 'InTransit' ? 'In Transit' : step}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Trip Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Package, label: 'Cargo Weight', value: trip.cargoWeightKg ? `${trip.cargoWeightKg} kg` : '—' },
              { icon: MapPin, label: 'Planned Distance', value: trip.plannedDistanceKm ? `${trip.plannedDistanceKm} km` : '—' },
              { icon: MapPin, label: 'Actual Distance', value: trip.actualDistanceKm ? `${trip.actualDistanceKm} km` : '—' },
              { icon: Clock, label: 'Scheduled Start', value: trip.scheduledStart ? new Date(trip.scheduledStart).toLocaleString() : '—' },
              { icon: Clock, label: 'Actual Start', value: trip.actualStart ? new Date(trip.actualStart).toLocaleString() : '—' },
              { icon: Clock, label: 'Actual End', value: trip.actualEnd ? new Date(trip.actualEnd).toLocaleString() : '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />{label}
                </div>
                <span className="text-sm font-medium text-foreground">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Assigned Resources</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {trip.vehicle && (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                <div className="p-2 bg-indigo-50 rounded-lg"><Truck className="h-5 w-5 text-indigo-600" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle</p>
                  <p className="font-semibold text-foreground">{trip.vehicle.registrationNumber}</p>
                  <p className="text-xs text-muted-foreground">{trip.vehicle.nameModel}</p>
                </div>
              </div>
            )}
            {trip.driver && (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {trip.driver.fullName?.[0]}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Driver</p>
                  <p className="font-semibold text-foreground">{trip.driver.fullName}</p>
                  <p className="text-xs text-muted-foreground">{trip.driver.licenseNumber}</p>
                </div>
              </div>
            )}
            {trip.revenueAmount && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                <span className="text-sm text-green-700 font-medium">Revenue</span>
                <span className="text-lg font-bold text-green-700">₹{parseFloat(trip.revenueAmount).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
