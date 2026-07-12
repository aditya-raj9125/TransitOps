import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Loader2, Route, Truck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import apiClient from '../../api/client';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const statusColors: Record<string, string> = {
  Scheduled: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  InProgress: 'bg-orange-100 text-orange-700 border-orange-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
  Draft: 'bg-gray-100 text-gray-700 border-gray-200',
};

const CustomEvent = ({ event }: any) => {
  const sc = statusColors[event.resource.status] || statusColors.Draft;
  return (
    <div className={`px-2 py-1 h-full w-full rounded border text-xs overflow-hidden flex flex-col gap-0.5 ${sc}`} title={`${event.resource.source} to ${event.resource.destination}`}>
      <div className="font-semibold truncate leading-tight">
        {event.title}
      </div>
      <div className="flex items-center gap-1 opacity-90 truncate text-[10px]">
        <MapPin className="w-2.5 h-2.5 shrink-0" />
        <span className="truncate">{event.resource.destination}</span>
      </div>
    </div>
  );
};

export const OperationsCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        // Fetch a wide range of trips for now (e.g. 2 months back and forward)
        const from = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
        const to = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();
        const res = await apiClient.get(`/trips?from=${from}&to=${to}&pageSize=200`);
        setTrips(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch calendar trips', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [currentDate]);

  const events = useMemo(() => {
    return trips.filter(t => t.scheduledStart).map(t => {
      const start = new Date(t.scheduledStart);
      // Give a default end time of 2 hours later if none provided
      const end = t.scheduledEnd ? new Date(t.scheduledEnd) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
      return {
        id: t.id,
        title: t.tripCode || t.id.slice(0,8),
        start,
        end,
        resource: t,
      };
    });
  }, [trips]);

  const handleSelectEvent = (event: any) => {
    navigate(`/trips/${event.id}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operations Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage trips, schedules, and dispatch windows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate('/dispatch/new')}>
            <Plus className="w-4 h-4 mr-2" /> Schedule Trip
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col p-4 relative">
        {loading && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/80 px-3 py-1.5 rounded-full shadow-sm border border-border">
            <Loader2 className="h-3 w-3 animate-spin" /> Syncing...
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={view}
          onView={(newView) => setView(newView)}
          components={{
            event: CustomEvent,
          }}
          onSelectEvent={handleSelectEvent}
          popup
          views={['month', 'week', 'day', 'agenda']}
          className="font-sans text-sm calendar-custom"
          dayLayoutAlgorithm="no-overlap"
        />
      </div>
    </div>
  );
};
