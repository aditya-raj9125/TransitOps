import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Loader2, Save, MapPin, Navigation, Truck, User, Calendar, Scale } from 'lucide-react';
import apiClient from '../../api/client';

export const NewTripForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeightKg: '',
    plannedDistanceKm: '',
    scheduledStart: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available vehicles and drivers for the dropdowns
    const fetchSelectData = async () => {
      try {
        const [vehRes, drvRes] = await Promise.all([
          apiClient.get('/vehicles?status=Available&pageSize=100'),
          apiClient.get('/drivers?status=Available&pageSize=100')
        ]);
        setVehicles(vehRes.data?.data || []);
        setDrivers(drvRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch select data', err);
      }
    };
    fetchSelectData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        cargoWeightKg: parseFloat(formData.cargoWeightKg) || 1,
        plannedDistanceKm: parseFloat(formData.plannedDistanceKm) || 1,
        scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : new Date().toISOString(),
      };

      await apiClient.post('/trips', payload);
      navigate('/dispatch');
    } catch (err: any) {
      console.error('Failed to create trip', err);
      setError(err.response?.data?.message || 'Failed to create trip. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="shrink-0 h-9 w-9 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">New Trip Form</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dispatch a new vehicle and driver for a scheduled route.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
            <CardTitle className="text-lg">Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Routing Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4 text-indigo-500" /> Routing Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Source Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      required
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      placeholder="e.g. Warehouse A, NY"
                      className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Destination Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      required
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g. Distribution Center, NJ"
                      className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Planned Distance (km)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="plannedDistanceKm"
                    value={formData.plannedDistanceKm}
                    onChange={handleChange}
                    placeholder="Enter distance in kilometers"
                    className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> Scheduled Start Time
                  </label>
                  <input
                    required
                    type="datetime-local"
                    name="scheduledStart"
                    value={formData.scheduledStart}
                    onChange={handleChange}
                    className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border/50" />

            {/* Assignment Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-500" /> Assignment & Cargo
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assign Vehicle</label>
                  <select
                    required
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="">Select an available vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.registrationNumber} ({v.nameModel})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assign Driver</label>
                  <select
                    required
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleChange}
                    className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="">Select an available driver...</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" /> Cargo Weight (kg)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="cargoWeightKg"
                    value={formData.cargoWeightKg}
                    onChange={handleChange}
                    placeholder="Enter total cargo weight"
                    className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><Save className="h-4 w-4 mr-2" /> Dispatch Trip</>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
};
