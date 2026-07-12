import React, { useEffect, useState } from 'react';
import { Plus, Search, X, Download, Fuel, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import apiClient from '../../api/client';
import { Loader2 } from 'lucide-react';

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [fuelData, setFuelData] = useState({
    vehicleId: '', liters: '', cost: '', odometerReading: '', fuelStation: '', logDate: '',
  });
  
  const [expenseData, setExpenseData] = useState({
    vehicleId: '', category: 'Toll', amount: '', expenseDate: '', description: '',
  });

  const fetchVehicles = async () => {
    try {
      const res = await apiClient.get('/vehicles?pageSize=1000');
      setVehicles(res.data?.data || []);
      if (res.data?.data?.length > 0) {
        setFuelData(prev => ({ ...prev, vehicleId: res.data.data[0].id }));
        setExpenseData(prev => ({ ...prev, vehicleId: res.data.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isModalOpen && vehicles.length === 0) fetchVehicles();
  }, [isModalOpen]);

  const handleFuelChange = (e: any) => { setFuelData({ ...fuelData, [e.target.name]: e.target.value }); setError(''); };
  const handleExpenseChange = (e: any) => { setExpenseData({ ...expenseData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (activeTab === 'fuel') {
        const payload: any = { ...fuelData, liters: parseFloat(fuelData.liters), cost: parseFloat(fuelData.cost) };
        if (payload.odometerReading) payload.odometerReading = parseFloat(payload.odometerReading);
        else delete payload.odometerReading;
        if (payload.logDate) payload.logDate = new Date(payload.logDate).toISOString();
        
        await apiClient.post('/fuel-logs', payload);
        setFuelData({ vehicleId: vehicles.length > 0 ? vehicles[0].id : '', liters: '', cost: '', odometerReading: '', fuelStation: '', logDate: '' });
      } else {
        const payload: any = { ...expenseData, amount: parseFloat(expenseData.amount) };
        if (!payload.vehicleId) delete payload.vehicleId;
        if (payload.expenseDate) payload.expenseDate = new Date(payload.expenseDate).toISOString();

        await apiClient.post('/expenses', payload);
        setExpenseData({ vehicleId: vehicles.length > 0 ? vehicles[0].id : '', category: 'Toll', amount: '', expenseDate: '', description: '' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
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

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'fuel' ? 'Log Fuel' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">{error}</div>}
          
          {activeTab === 'fuel' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-foreground">Vehicle</label>
                <select required name="vehicleId" value={fuelData.vehicleId} onChange={handleFuelChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">Select a vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Liters Filled</label>
                <input required type="number" step="0.01" min="0.1" name="liters" value={fuelData.liters} onChange={handleFuelChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Total Cost (₹)</label>
                <input required type="number" step="0.01" min="0" name="cost" value={fuelData.cost} onChange={handleFuelChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Odometer Reading (km)</label>
                <input type="number" step="0.1" min="0" name="odometerReading" value={fuelData.odometerReading} onChange={handleFuelChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Fuel Station</label>
                <input type="text" name="fuelStation" value={fuelData.fuelStation} onChange={handleFuelChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-foreground">Log Date</label>
                <input required type="date" name="logDate" value={fuelData.logDate} onChange={handleFuelChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-foreground">Vehicle (Optional)</label>
                <select name="vehicleId" value={expenseData.vehicleId} onChange={handleExpenseChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">No Vehicle Associated</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Expense Category</label>
                <select required name="category" value={expenseData.category} onChange={handleExpenseChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="Toll">Toll</option>
                  <option value="Parking">Parking</option>
                  <option value="Fine">Fine</option>
                  <option value="Permit">Permit</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                <input required type="number" step="0.01" min="0.1" name="amount" value={expenseData.amount} onChange={handleExpenseChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-foreground">Expense Date</label>
                <input required type="date" name="expenseDate" value={expenseData.expenseDate} onChange={handleExpenseChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea name="description" value={expenseData.description} onChange={handleExpenseChange} rows={2} className="w-full p-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
