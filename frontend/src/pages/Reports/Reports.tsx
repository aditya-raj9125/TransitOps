import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, TrendingUp, Fuel, IndianRupee, Percent } from 'lucide-react';
import apiClient from '../../api/client';

const COLORS = ['#4F46E5', '#F97316', '#A855F7', '#10B981', '#F59E0B', '#EF4444'];

// Mock data for charts (real analytics would be from a /reports endpoint)
const utilizationTrend = [
  {m:'Jan',v:62},{m:'Feb',v:70},{m:'Mar',v:58},{m:'Apr',v:80},{m:'May',v:75},{m:'Jun',v:89},
];
const costBreakdown = [
  {category:'Fuel',amount:45000},{category:'Maintenance',amount:28000},{category:'Tolls',amount:12000},{category:'Permits',amount:8000},{category:'Misc',amount:5000},
];
const fuelEfficiency = [
  {name:'VAN-001',km_per_l:14.2},{name:'TRUCK-04',km_per_l:8.5},{name:'PICKUP-07',km_per_l:11.3},{name:'VAN-003',km_per_l:13.7},{name:'TRUCK-09',km_per_l:7.9},
];
const driverSafety = [
  {score:'90-100',count:3},{score:'80-90',count:5},{score:'70-80',count:4},{score:'60-70',count:2},{score:'<60',count:1},
];

const MetricCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`p-1.5 rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

export const Reports = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fleet performance metrics and cost analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-muted rounded-xl p-1">
            {['7d', '30d', '90d', '1y'].map(d => (
              <button key={d} onClick={() => setDateRange(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange === d ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {d}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Percent} label="Fleet Utilization" value="89%" sub="+12% vs last period" color="bg-indigo-50 text-indigo-600" />
        <MetricCard icon={Fuel} label="Avg Fuel Efficiency" value="11.2 km/L" sub="Fleet average" color="bg-green-50 text-green-600" />
        <MetricCard icon={IndianRupee} label="Total Op. Cost" value="₹98,000" sub="Fuel + Maintenance + Expenses" color="bg-orange-50 text-orange-600" />
        <MetricCard icon={TrendingUp} label="Avg Vehicle ROI" value="34%" sub="Revenue − Cost / Acquisition" color="bg-purple-50 text-purple-600" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Utilization Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-500" />Fleet Utilization Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={utilizationTrend} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(v: any) => [`${v}%`, 'Utilization']} />
                <Line type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: '#4F46E5', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><IndianRupee className="h-4 w-4 text-orange-500" />Cost by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={costBreakdown} margin={{ left: -15, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Cost']} />
                <Bar dataKey="amount" fill="#4F46E5" radius={[6, 6, 0, 0]}>
                  {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel Efficiency */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Fuel className="h-4 w-4 text-green-500" />Fuel Efficiency by Vehicle</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fuelEfficiency} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v} km/L`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={60} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(v: any) => [`${v} km/L`, 'Efficiency']} />
                <Bar dataKey="km_per_l" fill="#10B981" radius={[0, 6, 6, 0]}>
                  {fuelEfficiency.map((e, i) => <Cell key={i} fill={e.km_per_l >= 12 ? '#10B981' : e.km_per_l >= 10 ? '#F97316' : '#EF4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Driver Safety Distribution */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Driver Safety Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={driverSafety} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="score" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(v: any) => [v, 'Drivers']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {driverSafety.map((d, i) => <Cell key={i} fill={d.score === '90-100' ? '#10B981' : d.score === '80-90' ? '#4F46E5' : d.score === '70-80' ? '#F97316' : d.score === '60-70' ? '#F59E0B' : '#EF4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
