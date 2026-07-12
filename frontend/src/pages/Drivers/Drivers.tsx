import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, Search, User, Phone, MapPin } from 'lucide-react';
import apiClient from '../../api/client';

export const Drivers = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await apiClient.get('/drivers');
      setDrivers(res.data.data);
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
          <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground mt-1">Manage personnel, licenses, and duty statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or license..."
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
           Array.from({ length: 6 }).map((_, i) => (
             <Card key={i} className="animate-pulse h-40"></Card>
           ))
        ) : (
          drivers.map((d) => (
            <Card key={d.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-full">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-none">{d.fullName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1.5">
                        <Phone className="h-3 w-3" />
                        <span>{d.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    d.status === 'Available' ? 'default' :
                    d.status === 'OnTrip' ? 'secondary' : 'destructive'
                  }>
                    {d.status}
                  </Badge>
                </div>
                
                <div className="mt-6 flex justify-between items-center text-sm border-t border-border pt-4">
                  <div>
                    <p className="text-muted-foreground text-xs">License No.</p>
                    <p className="font-medium font-mono text-xs mt-0.5">{d.licenseNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Last Active</p>
                    <p className="font-medium text-xs mt-0.5">
                      {d.lastTripCompletedAt ? new Date(d.lastTripCompletedAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
