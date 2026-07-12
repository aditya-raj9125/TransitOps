import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, MapPin, Clock, Truck, User } from 'lucide-react';
import apiClient from '../../api/client';

type TripStatus = 'Draft' | 'Dispatched' | 'InTransit' | 'Completed' | 'Cancelled';

interface Trip {
  id: string;
  status: TripStatus;
  origin: string;
  destination: string;
  departureTime: string;
  vehicle: { registrationNumber: string } | null;
  driver: { fullName: string } | null;
}

export const Trips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await apiClient.get('/trips');
      setTrips(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTripStatus = async (id: string, status: TripStatus) => {
    try {
      await apiClient.patch(`/trips/${id}/status`, { status });
      fetchTrips(); // Refresh board
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update trip status');
    }
  };

  const columns: { title: string; status: TripStatus; color: string }[] = [
    { title: 'Draft / Planning', status: 'Draft', color: 'bg-slate-500' },
    { title: 'Dispatched', status: 'Dispatched', color: 'bg-yellow-500' },
    { title: 'In Transit', status: 'InTransit', color: 'bg-blue-500' },
    { title: 'Completed', status: 'Completed', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trips & Dispatch</h2>
          <p className="text-muted-foreground mt-1">Manage trip lifecycles via Kanban board.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">View Map</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> New Trip</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map((col) => (
            <div key={col.status} className="w-80 flex flex-col flex-shrink-0 bg-muted/40 rounded-xl border border-border p-3 h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-sm">{col.title}</h3>
                </div>
                <Badge variant="secondary" className="bg-background">
                  {trips.filter(t => t.status === col.status).length}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
                {loading ? (
                  <div className="space-y-3">
                    <Card className="animate-pulse h-32 border-transparent bg-background/50"></Card>
                    <Card className="animate-pulse h-32 border-transparent bg-background/50"></Card>
                  </div>
                ) : (
                  trips.filter(t => t.status === col.status).map(trip => (
                    <Card key={trip.id} className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="outline" className="font-mono text-[10px] py-0">{trip.id.split('-')[0]}</Badge>
                          {col.status === 'Draft' && (
                            <button 
                              onClick={() => updateTripStatus(trip.id, 'Dispatched')}
                              className="text-[10px] text-primary hover:underline font-medium"
                            >
                              Dispatch →
                            </button>
                          )}
                          {col.status === 'Dispatched' && (
                            <button 
                              onClick={() => updateTripStatus(trip.id, 'InTransit')}
                              className="text-[10px] text-blue-500 hover:underline font-medium"
                            >
                              Start Transit →
                            </button>
                          )}
                          {col.status === 'InTransit' && (
                            <button 
                              onClick={() => updateTripStatus(trip.id, 'Completed')}
                              className="text-[10px] text-green-500 hover:underline font-medium"
                            >
                              Complete ✓
                            </button>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium line-clamp-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {trip.origin} <span className="text-muted-foreground text-xs mx-1">→</span> {trip.destination}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-1.5">
                            <Truck className="h-3 w-3" />
                            <span className="truncate">{trip.vehicle?.registrationNumber || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3" />
                            <span className="truncate">{trip.driver?.fullName || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2 mt-1 border-t border-border pt-2">
                            <Clock className="h-3 w-3" />
                            {new Date(trip.departureTime).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {!loading && trips.filter(t => t.status === col.status).length === 0 && (
                  <div className="text-center p-4 border border-dashed border-border rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">No trips in this stage</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
