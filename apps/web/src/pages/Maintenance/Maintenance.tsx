import React, { useEffect, useState } from 'react';
import { Plus, Search, X, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import apiClient from '../../api/client';

const TYPE_COLORS: Record<string, string> = {
  'Oil Change': 'bg-blue-100 text-blue-700',
  'Tires': 'bg-orange-100 text-orange-700',
  'Brakes': 'bg-red-100 text-red-700',
  'General Service': 'bg-purple-100 text-purple-700',
  'Repair': 'bg-yellow-100 text-yellow-700',
  'Inspection': 'bg-green-100 text-green-700',
};

export const Maintenance = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '15' });
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiClient.get(`/maintenance?${params}`);
      setRecords(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchRecords, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, statusFilter, page]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance & Service Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track service history, repairs, and scheduled maintenance
            {meta && <span className="ml-2 text-xs">({meta.total} records)</span>}
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> New Maintenance Record
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search vehicle, type, vendor..."
            className="w-full h-9 pl-9 pr-9 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-input bg-card text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary min-w-[130px]">
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border animate-pulse">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 flex-1 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-50 mb-4">
                <Filter className="h-8 w-8 text-purple-300" />
              </div>
              <p className="font-semibold text-foreground mb-1">No maintenance records</p>
              <p className="text-sm text-muted-foreground">{search || statusFilter ? 'Try adjusting filters' : 'Create your first maintenance record'}</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Vehicle', 'Type', 'Status', 'Cost', 'Scheduled Date', 'Completed Date', 'Vendor'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground first:px-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any) => (
                    <tr key={r.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-3 text-xs font-medium text-foreground">{r.vehicle?.registrationNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[r.maintenanceType] || 'bg-muted text-muted-foreground'}`}>
                          {r.maintenanceType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${r.status === 'Closed' ? 'text-status-available bg-status-available' : 'text-status-maintenance bg-status-maintenance'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{r.cost ? `₹${parseFloat(r.cost).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.completedDate ? new Date(r.completedDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.vendorName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {meta && meta.total > 15 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground px-6 py-4">
                  <span>Showing {records.length} of {meta.total}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={records.length < 15} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
