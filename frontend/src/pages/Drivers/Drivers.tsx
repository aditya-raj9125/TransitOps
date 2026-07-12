import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, AlertTriangle, Star, X, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import apiClient from '../../api/client';

const STATUS_CLASSES: Record<string, string> = {
  Available: 'text-status-available bg-status-available',
  OnTrip: 'text-status-ontrip bg-status-ontrip',
  OffDuty: 'text-status-retired bg-status-retired',
  Suspended: 'text-status-cancelled bg-status-cancelled',
};

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardContent className="p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-28" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
      </div>
      <div className="h-2 bg-muted rounded" />
      <div className="h-8 bg-muted rounded-lg" />
    </CardContent>
  </Card>
);

export const Drivers = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '12' });
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiClient.get(`/drivers?${params}`);
      setDrivers(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchDrivers, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const getLicenseExpiryClass = (expiry: string) => {
    if (!expiry) return '';
    const days = Math.floor((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'text-red-600 font-semibold';
    if (days < 7) return 'text-red-500 font-semibold';
    if (days < 30) return 'text-orange-500 font-semibold';
    return 'text-muted-foreground';
  };

  const getLicenseExpiryLabel = (expiry: string) => {
    if (!expiry) return 'N/A';
    const days = Math.floor((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days < 7) return `Expires in ${days}d`;
    if (days < 30) return `Expires in ${days}d`;
    return new Date(expiry).toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Driver Roster</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage personnel, licenses, and duty statuses
            {meta && <span className="ml-2 text-xs">({meta.total} total)</span>}
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Driver
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, license number..."
            className="w-full h-9 pl-9 pr-9 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-input bg-card text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="OnTrip">On Trip</option>
          <option value="OffDuty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : drivers.length === 0
          ? (
            <div className="col-span-3 py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
                <User className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="font-semibold text-foreground mb-1">No drivers found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter ? 'Try adjusting your search or filters' : 'Add your first driver to get started'}
              </p>
            </div>
          )
          : drivers.map((d: any) => (
            <Card key={d.id} className="group hover:border-indigo-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                      {d.fullName?.[0] ?? 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{d.fullName}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="h-3 w-3" />
                        {d.contactNumber || d.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_CLASSES[d.status] || 'bg-muted text-muted-foreground'}`}>
                    {d.status || 'N/A'}
                  </span>
                </div>

                {/* Safety Score Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" /> Safety Score</span>
                    <span className={`font-semibold ${(d.safetyScore ?? 100) >= 80 ? 'text-green-600' : (d.safetyScore ?? 100) >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                      {d.safetyScore ?? 100}/100
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (d.safetyScore ?? 100) >= 80 ? 'bg-green-500' :
                        (d.safetyScore ?? 100) >= 60 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${d.safetyScore ?? 100}%` }}
                    />
                  </div>
                </div>

                {/* License expiry */}
                <div className="flex justify-between text-xs mb-4 bg-muted/40 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-muted-foreground">License No.</p>
                    <p className="font-mono font-medium text-foreground mt-0.5">{d.licenseNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Expiry</p>
                    <p className={`mt-0.5 ${getLicenseExpiryClass(d.licenseExpiryDate)}`}>
                      {getLicenseExpiryLabel(d.licenseExpiryDate)}
                      {d.licenseExpiryDate && new Date(d.licenseExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                        <AlertTriangle className="h-3 w-3 inline ml-1" />
                      )}
                    </p>
                  </div>
                </div>

                <Link to={`/drivers/${d.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    View Profile <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {meta && meta.total > 12 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {drivers.length} of {meta.total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={drivers.length < 12} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};
