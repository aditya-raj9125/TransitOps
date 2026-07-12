import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, Truck, User, X, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import apiClient from '../../api/client';

type TripStatus = 'Draft' | 'Dispatched' | 'InTransit' | 'Completed' | 'Cancelled';

const COLUMNS: { title: string; status: TripStatus; color: string; dot: string }[] = [
  { title: 'Draft / Planning', status: 'Draft', color: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  { title: 'Dispatched', status: 'Dispatched', color: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
  { title: 'In Transit', status: 'InTransit', color: 'bg-indigo-500/10 border-indigo-500/20', dot: 'bg-indigo-400' },
  { title: 'Completed', status: 'Completed', color: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-400' },
];

export const Trips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TripStatus | 'all'>('all');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/trips?pageSize=100');
      setTrips(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const updateStatus = async (id: string, status: TripStatus) => {
    const endpoint = status === 'Dispatched' ? 'dispatch' : status === 'Completed' ? 'complete' : 'cancel';
    try {
      await apiClient.post(`/trips/${id}/${endpoint}`);
      fetchTrips();
    } catch (err: any) {
      alert(err?.response?.data?.message || `Failed to update trip`);
    }
  };

  const tripsForColumn = (status: TripStatus) => trips.filter(t => t.status === status);

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispatch Console</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage trip lifecycle via Kanban board</p>
        </div>
        <Button onClick={() => navigate('/dispatch/new')} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> New Trip
        </Button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 shrink-0 flex-wrap">
        {COLUMNS.map(col => (
          <div key={col.status} className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1 text-xs font-medium">
            <div className={`w-2 h-2 rounded-full ${col.dot}`} />
            <span className="text-foreground">{col.title}</span>
            <span className="text-muted-foreground">{tripsForColumn(col.status).length}</span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className={`w-80 flex flex-col rounded-2xl border ${col.color} p-3 shrink-0`} style={{maxHeight: 'calc(100vh - 280px)'}}>
              <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className="font-semibold text-sm text-foreground">{col.title}</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full">
                  {tripsForColumn(col.status).length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                {loading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="h-28 bg-background/60 rounded-xl animate-pulse border border-border" />
                  ))
                ) : tripsForColumn(col.status).length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-border/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">No trips here</p>
                  </div>
                ) : (
                  tripsForColumn(col.status).map((trip: any) => (
                    <Card key={trip.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/trips/${trip.id}`)}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {trip.tripCode || trip.id?.slice(0, 8)}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            {col.status === 'Draft' && (
                              <button onClick={() => updateStatus(trip.id, 'Dispatched')}
                                className="text-[10px] text-blue-500 hover:underline font-medium">
                                Dispatch →
                              </button>
                            )}
                            {col.status === 'Dispatched' && (
                              <button onClick={() => updateStatus(trip.id, 'InTransit')}
                                className="text-[10px] text-indigo-500 hover:underline font-medium">
                                Start →
                              </button>
                            )}
                            {col.status === 'InTransit' && (
                              <button onClick={() => updateStatus(trip.id, 'Completed')}
                                className="text-[10px] text-green-500 hover:underline font-medium">
                                Complete ✓
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{trip.source}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="truncate">{trip.destination}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1"><Truck className="h-3 w-3" /><span className="truncate">{trip.vehicle?.registrationNumber || 'Unassigned'}</span></div>
                          <div className="flex items-center gap-1"><User className="h-3 w-3" /><span className="truncate">{trip.driver?.fullName?.split(' ')[0] || 'Unassigned'}</span></div>
                          <div className="flex items-center gap-1 col-span-2">
                            <Clock className="h-3 w-3" />
                            {trip.scheduledStart ? new Date(trip.scheduledStart).toLocaleString(undefined, {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : 'No schedule'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {col.status === 'Draft' && !loading && (
                <button
                  onClick={() => navigate('/dispatch/new')}
                  className="mt-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl hover:border-primary/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add trip
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
