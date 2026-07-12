import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Truck, Settings, Activity, Filter, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import apiClient from '../../api/client';
import { Loader2 } from 'lucide-react';

const STATUS_CLASSES: Record<string, string> = {
  Available: 'text-status-available bg-status-available',
  OnTrip: 'text-status-ontrip bg-status-ontrip',
  InShop: 'text-status-maintenance bg-status-maintenance',
  Retired: 'text-status-retired bg-status-retired',
};

const STATUS_LABELS: Record<string, string> = {
  Available: 'Available', OnTrip: 'On Trip', InShop: 'In Shop', Retired: 'Retired',
};

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-muted rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
        <div className="h-6 bg-muted rounded-full w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
      </div>
    </CardContent>
  </Card>
);

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    registrationNumber: '',
    nameModel: '',
    type: 'Truck',
    fuelType: 'Diesel',
    maxLoadCapacityKg: '',
    odometerKm: '',
    acquisitionCost: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...formData,
        maxLoadCapacityKg: parseFloat(formData.maxLoadCapacityKg),
        odometerKm: parseFloat(formData.odometerKm) || 0,
        acquisitionCost: parseFloat(formData.acquisitionCost) || 0,
      };
      await apiClient.post('/vehicles', payload);
      setIsModalOpen(false);
      setFormData({ registrationNumber: '', nameModel: '', type: 'Truck', fuelType: 'Diesel', maxLoadCapacityKg: '', odometerKm: '', acquisitionCost: '' });
      fetchVehicles(); // refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicle. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '12' });
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiClient.get(`/vehicles?${params}`);
      setVehicles(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchVehicles, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage fleet assets, status, and maintenance history
            {meta && <span className="ml-2 text-xs">({meta.total} total)</span>}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Vehicle
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search registration number, model..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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
          <option value="InShop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : vehicles.length === 0
          ? (
            <div className="col-span-3 py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
                <Truck className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="font-semibold text-foreground mb-1">No vehicles found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter ? 'Try adjusting your search or filters' : 'Add your first vehicle to get started'}
              </p>
              {!search && !statusFilter && (
                <Button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add First Vehicle
                </Button>
              )}
            </div>
          )
          : vehicles.map((v: any) => (
            <Card key={v.id} className="group hover:border-indigo-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{v.registrationNumber}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.nameModel}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASSES[v.status] || 'bg-muted text-muted-foreground'}`}>
                    {STATUS_LABELS[v.status] || v.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                  <div className="bg-muted/40 rounded-lg p-2">
                    <p className="text-muted-foreground mb-0.5">Type</p>
                    <p className="font-semibold text-foreground truncate">{v.type}</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2">
                    <p className="text-muted-foreground mb-0.5">Capacity</p>
                    <p className="font-semibold text-foreground">{v.maxLoadCapacityKg?.toLocaleString() ?? '—'} kg</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2">
                    <p className="text-muted-foreground mb-0.5">Odometer</p>
                    <p className="font-semibold text-foreground">{v.odometerKm?.toLocaleString() ?? '—'} km</p>
                  </div>
                </div>

                {/* Insurance expiry warning */}
                {v.insuranceExpiryDate && new Date(v.insuranceExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                  <div className="flex items-center gap-2 text-[10px] text-orange-600 bg-orange-50 rounded-lg px-2.5 py-1.5 mb-3">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Insurance expires {new Date(v.insuranceExpiryDate).toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={`/vehicles/${v.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <Activity className="h-3 w-3 mr-1.5" /> View Details
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="h-8 px-2.5">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {/* Pagination */}
      {meta && meta.total > 12 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-6">
          <span>Showing {vehicles.length} of {meta.total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={vehicles.length < 12} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Registration No.</label>
              <input required name="registrationNumber" value={formData.registrationNumber} onChange={handleFormChange} placeholder="e.g. MH-01-AB-1234" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Make & Model</label>
              <input required name="nameModel" value={formData.nameModel} onChange={handleFormChange} placeholder="e.g. Tata LPT 1109" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Vehicle Type</label>
              <select required name="type" value={formData.type} onChange={handleFormChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Pickup">Pickup</option>
                <option value="Trailer">Trailer</option>
                <option value="Bike">Bike</option>
                <option value="EV">EV</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Fuel Type</label>
              <select required name="fuelType" value={formData.fuelType} onChange={handleFormChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Capacity (kg)</label>
              <input required type="number" min="1" name="maxLoadCapacityKg" value={formData.maxLoadCapacityKg} onChange={handleFormChange} placeholder="e.g. 5000" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Odometer (km)</label>
              <input type="number" min="0" name="odometerKm" value={formData.odometerKm} onChange={handleFormChange} placeholder="e.g. 15000" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
