import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, Search, Truck, Settings, Activity } from 'lucide-react';
import apiClient from '../../api/client';

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await apiClient.get('/vehicles');
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
          <p className="text-muted-foreground mt-1">Manage fleet, status, and maintenance history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Vehicle</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search registration or model..."
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
           Array.from({ length: 6 }).map((_, i) => (
             <Card key={i} className="animate-pulse h-48"></Card>
           ))
        ) : (
          vehicles.map((v) => (
            <Card key={v.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-none">{v.registrationNumber}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{v.nameModel}</p>
                    </div>
                  </div>
                  <Badge variant={
                    v.status === 'Available' ? 'default' :
                    v.status === 'InTransit' ? 'secondary' : 'destructive'
                  }>
                    {v.status}
                  </Badge>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-medium mt-0.5">{v.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Current Mileage</p>
                    <p className="font-medium mt-0.5">{v.currentMileage.toLocaleString()} km</p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full"><Activity className="h-4 w-4 mr-2" /> History</Button>
                  <Button variant="outline" size="sm" className="w-full"><Settings className="h-4 w-4 mr-2" /> Manage</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
