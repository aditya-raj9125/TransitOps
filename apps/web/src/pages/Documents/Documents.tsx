import React, { useEffect, useState } from 'react';
import { Search, Upload, FileText, AlertTriangle, CheckCircle2, X, Grid, List } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import apiClient from '../../api/client';
import { Loader2 } from 'lucide-react';

const DOC_TYPE_ICON: Record<string, string> = {
  Insurance: '🛡️', RC: '📋', Permit: '📄', License: '🪪', PUC: '🌿', Other: '📁',
};

const getExpiryStatus = (date: string | null) => {
  if (!date) return { label: 'No expiry', cls: 'text-status-retired bg-status-retired' };
  const days = Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, cls: 'text-status-cancelled bg-status-cancelled' };
  if (days < 7) return { label: `Expires in ${days}d`, cls: 'text-status-cancelled bg-status-cancelled' };
  if (days < 30) return { label: `Expires in ${days}d`, cls: 'text-status-draft bg-status-draft' };
  return { label: new Date(date).toLocaleDateString(), cls: 'text-status-available bg-status-available' };
};

export const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    entityType: 'Vehicle',
    entityId: '',
    docType: 'Insurance',
    fileUrl: '',
    expiryDate: '',
  });

  const fetchOptions = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        apiClient.get('/vehicles?pageSize=1000').catch(() => ({ data: { data: [] } })),
        apiClient.get('/drivers?pageSize=1000').catch(() => ({ data: { data: [] } })),
      ]);
      const v = vRes.data?.data || [];
      const d = dRes.data?.data || [];
      setVehicles(v);
      setDrivers(d);
      if (v.length > 0) setFormData(prev => ({ ...prev, entityId: v[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isModalOpen && vehicles.length === 0 && drivers.length === 0) fetchOptions();
  }, [isModalOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    const items = type === 'Vehicle' ? vehicles : drivers;
    setFormData({ ...formData, entityType: type, entityId: items.length > 0 ? items[0].id : '' });
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload: any = { ...formData };
      if (payload.expiryDate) payload.expiryDate = new Date(payload.expiryDate).toISOString();
      else delete payload.expiryDate;

      await apiClient.post('/documents', payload);
      setIsModalOpen(false);
      setFormData({
        entityType: 'Vehicle',
        entityId: vehicles.length > 0 ? vehicles[0].id : '',
        docType: 'Insurance',
        fileUrl: '',
        expiryDate: '',
      });
      fetchDocs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '30' });
      if (search) params.set('q', search);
      if (entityTypeFilter) params.set('entityType', entityTypeFilter);
      const res = await apiClient.get(`/documents?${params}`);
      let docs = res.data?.data || [];
      if (expiryFilter === 'expired') docs = docs.filter((d: any) => d.expiryDate && new Date(d.expiryDate) < new Date());
      if (expiryFilter === 'expiring') docs = docs.filter((d: any) => {
        if (!d.expiryDate) return false;
        const days = Math.floor((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 30;
      });
      if (expiryFilter === 'valid') docs = docs.filter((d: any) => !d.expiryDate || new Date(d.expiryDate) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchDocs, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, entityTypeFilter, expiryFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents Vault</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Vehicle and driver documents with expiry tracking</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entity, document type..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={entityTypeFilter} onChange={(e) => setEntityTypeFilter(e.target.value)}
          className="h-9 rounded-xl border border-input bg-card text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Entities</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Driver">Driver</option>
        </select>
        <select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}
          className="h-9 rounded-xl border border-input bg-card text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Status</option>
          <option value="expired">Expired</option>
          <option value="expiring">Expiring Soon (30d)</option>
          <option value="valid">Valid</option>
        </select>
        <div className="flex rounded-xl border border-input overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}><Grid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 border-l border-input ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
            <FileText className="h-8 w-8 text-indigo-300" />
          </div>
          <p className="font-semibold text-foreground mb-1">No documents found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {search || entityTypeFilter || expiryFilter ? 'Try adjusting filters' : 'Upload your first document'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {documents.map((doc: any) => {
            const expiry = getExpiryStatus(doc.expiryDate);
            const icon = DOC_TYPE_ICON[doc.docType] || '📁';
            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}`}>
                    <div className={`text-3xl ${viewMode === 'list' ? '' : 'mb-3'}`}>{icon}</div>
                    <div className={viewMode === 'list' ? 'flex-1' : 'mt-2'}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">{doc.docType}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${expiry.cls}`}>{expiry.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.entityType} · {doc.entityId?.slice(0, 8)}</p>
                    </div>
                  </div>
                  {viewMode === 'grid' && (
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8">View</Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">Replace</Button>
                    </div>
                  )}
                  {viewMode === 'list' && (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="text-xs h-8">View</Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">Replace</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document">
        <form onSubmit={handleUploadDocument} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Related To</label>
              <select name="entityType" value={formData.entityType} onChange={handleEntityChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="Vehicle">Vehicle</option>
                <option value="Driver">Driver</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{formData.entityType}</label>
              <select required name="entityId" value={formData.entityId} onChange={handleFormChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                {formData.entityType === 'Vehicle' 
                  ? vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)
                  : drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)
                }
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Document Type</label>
              <select required name="docType" value={formData.docType} onChange={handleFormChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="Insurance">Insurance</option>
                <option value="RC">RC (Registration)</option>
                <option value="Permit">Permit</option>
                <option value="License">License</option>
                <option value="PUC">PUC (Pollution)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Expiry Date (Optional)</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleFormChange} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-medium text-foreground">Document URL / File Path</label>
              <input required type="url" name="fileUrl" value={formData.fileUrl} onChange={handleFormChange} placeholder="e.g. https://storage.com/file.pdf" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
