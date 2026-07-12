import React from 'react';
import { Card, CardContent } from '../components/ui/Card';

export const FuelExpenses = () => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fuel & Expenses</h2>
        <p className="text-muted-foreground mt-1">Log fuel entries and monitor vehicle ROI.</p>
      </div>
      
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Fuel & Expense module is currently under development.
        </CardContent>
      </Card>
    </div>
  );
};

export const Maintenance = () => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
        <p className="text-muted-foreground mt-1">Schedule services and track vehicle health.</p>
      </div>
      
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Maintenance module is currently under development.
        </CardContent>
      </Card>
    </div>
  );
};
