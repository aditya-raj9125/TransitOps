import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import apiClient from '../../api/client';

export const AuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (search) params.set('q', search);
      if (entityFilter) params.set('entityType', entityFilter);
      const res = await apiClient.get(`/audit?${params}`);
      setLogs(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchLogs, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, entityFilter, page]);

  const ACTION_COLORS: Record<string, string> = {
    CREATE: 'text-green-700 bg-green-50',
    UPDATE: 'text-blue-700 bg-blue-50',
    DELETE: 'text-red-700 bg-red-50',
    DISPATCH: 'text-indigo-700 bg-indigo-50',
    COMPLETE: 'text-green-700 bg-green-50',
    CANCEL: 'text-red-700 bg-red-50',
    LOGIN: 'text-gray-700 bg-gray-50',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Complete activity trail for compliance and traceability</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search user, action, entity..."
            className="w-full h-9 pl-9 pr-9 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
        </div>
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-input bg-card text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]">
          <option value="">All Entity Types</option>
          {['Vehicle', 'Driver', 'Trip', 'User', 'MaintenanceLog'].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-0">
              {[...Array(8)].map((_, i) => <div key={i} className="h-14 border-b border-border animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-semibold text-foreground mb-1">No audit logs found</p>
              <p className="text-sm text-muted-foreground">Activity will appear here as users interact with the system.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Timestamp', 'User', 'Action', 'Entity', 'IP Address', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground first:px-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <React.Fragment key={log.id}>
                      <tr className={`border-b border-border hover:bg-muted/40 transition-colors cursor-pointer ${expandedId === log.id ? 'bg-muted/40' : ''}`}
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                        <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{log.user?.fullName || log.userId?.slice(0, 8) || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action?.toUpperCase?.()] || 'bg-muted text-muted-foreground'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{log.entityType}</span>
                          {log.entityId && <span className="ml-1 text-muted-foreground font-mono text-[10px]">#{log.entityId?.slice(0, 8)}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.ipAddress || '—'}</td>
                        <td className="px-4 py-3">
                          {(log.oldValue || log.newValue) && (
                            expandedId === log.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </td>
                      </tr>
                      {expandedId === log.id && (log.oldValue || log.newValue) && (
                        <tr className="border-b border-border">
                          <td colSpan={6} className="px-6 py-4 bg-muted/20">
                            <div className="grid grid-cols-2 gap-4">
                              {log.oldValue && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">Before</p>
                                  <pre className="text-[10px] bg-red-50 text-red-700 p-3 rounded-lg overflow-auto max-h-32 font-mono">
                                    {JSON.stringify(log.oldValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newValue && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">After</p>
                                  <pre className="text-[10px] bg-green-50 text-green-700 p-3 rounded-lg overflow-auto max-h-32 font-mono">
                                    {JSON.stringify(log.newValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {meta && meta.total > 20 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground px-6 py-4">
                  <span>Showing {logs.length} of {meta.total}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 border border-border rounded-lg text-xs disabled:opacity-40 hover:bg-muted">Previous</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 20} className="px-3 py-1.5 border border-border rounded-lg text-xs disabled:opacity-40 hover:bg-muted">Next</button>
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
