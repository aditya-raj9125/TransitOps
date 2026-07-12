import React from 'react';

export const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your fleet operations and key metrics.</p>
        </div>
      </div>
      
      {/* Placeholder for KPI cards and Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-4"></div>
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
