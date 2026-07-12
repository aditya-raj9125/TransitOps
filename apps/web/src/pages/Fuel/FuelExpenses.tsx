import React, { useEffect, useState } from 'react';
import { Plus, Search, X, Download, Fuel, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import apiClient from '../../api/client';

const EXPENSE_COLORS: Record<string, string> = {
  Toll: 'bg-blue-100 text-blue-700', Parking: 'bg-orange-100 text-orange-700',
  Fine: 'bg-red-100 text-red-700', Permit: 'bg-purple-100 text-purple-700',
  Maintenance: 'bg-yellow-100 text-yellow-700', Misc: 'bg-gray-100 text-gray-700',
};

export const FuelExpenses = () => {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [totals, setTotals] = useState({ fuel: 0, expenses: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '15' });
      if (search) params.set('q', search);
      const [fuelRes, expRes] = await Promise.all([
        apiClient.get(`/fuel-logs?${params}`).catch(() => ({ data: { data: [], meta: null } })),
        apiClient.get(`/expenses?${params}`).catch(() => ({ data: { data: [], meta: null } })),
      ]);
      const fl = fuelRes.data?.data || [];
      const ex = expRes.data?.data || [];
      setFuelLogs(fl);
      setExpenses(ex);
      setMeta(activeTab === 'fuel' ? fuelRes.data?.meta : expRes.data?.meta);
      setTotals({
        fuel: fl.reduce((s: number, x: any) => s + parseFloat(x.cost || 0), 0),
        expenses: ex.reduce((s: number, x: any) => s + parseFloat(x.amount || 0), 0),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, page, activeTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fuel & Expense Ledger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track fuel consumption and operational expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" /> {activeTab === 'fuel' ? 'Log Fuel' : 'Add Expense'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-orange-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl"><Fuel className="h-5 w-5 text-orange-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Fuel Cost (Period)</p>
              <p className="text-xl font-bold text-foreground">₹{totals.fuel.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl"><Receipt className="h-5 w-5 text-purple-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Other Expenses</p>
              <p className="text-xl font-bold text-foreground">₹{totals.expenses.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-muted rounded-xl p-1 w-fit">
        {(['fuel', 'expenses'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'fuel' ? 'Fuel Logs' : 'Expenses'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={activeTab === 'fuel' ? 'Search vehicle, station...' : 'Search category, description...'}
          className="w-full h-9 pl-9 pr-9 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 border-b border-border animate-pulse" />)}
            </div>
          ) : activeTab === 'fuel' ? (
            fuelLogs.length === 0 ? (
              <div className="py-16 text-center">
                <Fuel className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No fuel logs yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Vehicle', 'Date', 'Liters', 'Cost', 'Odometer', 'Station', 'Trip'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground first:px-6">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {fuelLogs.map((l: any) => (
                    <tr key={l.id} className="border-b border-border hover:bg-muted/40">
                      <td className="px-6 py-3 text-xs font-medium text-foreground">{l.vehicle?.registrationNumber || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{l.logDate ? new Date(l.logDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{l.liters} L</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">₹{parseFloat(l.cost || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{l.odometerReading?.toLocaleString() || '—'} km</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{l.fuelStation || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{l.trip?.tripCode || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            expenses.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No expenses logged yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Category', 'Amount', 'Vehicle', 'Date', 'Description'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground first:px-6">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {expenses.map((e: any) => (
                    <tr key={e.id} className="border-b border-border hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${EXPENSE_COLORS[e.category] || 'bg-muted text-muted-foreground'}`}>{e.category}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">₹{parseFloat(e.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{e.vehicle?.registrationNumber || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{e.expenseDate ? new Date(e.expenseDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{e.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};
