import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, Route, Calendar, BarChart3, ShieldCheck, Zap,
  CheckCircle2, ArrowRight, Play, Star, ChevronRight,
  Activity, Users, TrendingUp, Bell
} from 'lucide-react';

const features = [
  {
    icon: Route,
    title: 'Smart Dispatch',
    description: 'AI-powered vehicle & driver suggestion engine with real-time availability checks and safety compliance.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    icon: Calendar,
    title: 'Operations Calendar',
    description: 'Month/week/day calendar of trips, maintenance windows, and license expiries — drag to reschedule.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance & Safety',
    description: 'Driver license tracking, safety scores, rest-time enforcement and automated expiry alerts.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Fleet utilization trends, fuel efficiency, ROI by vehicle, cost breakdowns — all filterable by date/region.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: Truck,
    title: 'Maintenance Tracking',
    description: 'Service logs, repair history, vendor management with automatic vehicle status sync when entering the shop.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Zap,
    title: 'Fuel & Expense Insights',
    description: 'Log fuel entries, track expenses by category, compute operational cost and vehicle ROI automatically.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
];

const steps = [
  { num: '01', title: 'Register Your Fleet', desc: 'Add vehicles, drivers, and set up your organization in minutes with bulk import support.' },
  { num: '02', title: 'Dispatch Smarter', desc: 'Use the AI suggestion engine to pick the best vehicle & driver for each trip instantly.' },
  { num: '03', title: 'Track Everything', desc: 'Real-time dashboards, live notifications, and audit trails keep you in control at all times.' },
];

const stats = [
  { label: 'Fleet Utilization', value: '89%', icon: TrendingUp, color: 'text-green-500' },
  { label: 'Active Trips', value: '24', icon: Route, color: 'text-blue-500' },
  { label: 'Drivers On Duty', value: '18', icon: Users, color: 'text-indigo-500' },
  { label: 'Alerts Today', value: '3', icon: Bell, color: 'text-orange-500' },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Inter',sans-serif]">
      {/* Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L8 2L14 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 14V8H11V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">FleetPilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#analytics" className="hover:text-indigo-600 transition-colors">Analytics</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2">
              Log in
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              Request Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 -translate-y-1/2" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-100 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Now with live dispatch — see it in action
            <ChevronRight className="h-3 w-3" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-6">
            Command your fleet.{' '}
            <span className="text-orange-500">Trust your data.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A production-grade transport operations platform. Real-time fleet visibility, smart dispatch, compliance tracking — all backed by PostgreSQL.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-base px-8 py-3.5 rounded-xl transition-colors bg-white hover:bg-gray-50"
            >
              <Play className="h-4 w-4 text-indigo-500" /> View Live Demo
            </button>
          </div>

          {/* Trust bullets */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {['Real-time dashboards', 'Role-based access control', 'PostgreSQL-backed', 'Open source'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-gray-50">
            {/* Fake browser chrome */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 mx-4 bg-gray-100 rounded-md h-6 flex items-center px-3">
                <span className="text-xs text-gray-400">app.fleetpilot.dev/dashboard</span>
              </div>
            </div>
            {/* Fake dashboard UI */}
            <div className="p-6 bg-[#F9FAFB] flex gap-4">
              {/* Sidebar preview */}
              <div className="w-16 bg-[#111827] rounded-xl p-2 space-y-3 flex flex-col items-center py-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600"></div>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-7 h-7 rounded-lg ${i === 0 ? 'bg-indigo-600/30' : 'bg-white/10'}`}></div>
                ))}
              </div>
              {/* Main content preview */}
              <div className="flex-1 space-y-4">
                {/* KPI cards */}
                <div className="grid grid-cols-4 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-gray-500">{stat.label}</span>
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      </div>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                {/* Charts area */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-4 h-32 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">Fleet Utilization</span>
                      <span className="text-xs text-green-500 font-medium">+12%</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 55, 80, 70, 90, 75, 85, 89].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm opacity-70" style={{height: `${h}%`}}></div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4 h-32">
                    <span className="text-xs font-semibold text-gray-700">Cost Breakdown</span>
                    <div className="mt-3 flex gap-2 items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-500" style={{background: 'conic-gradient(#6366F1 0% 45%, #F97316 45% 70%, #A855F7 70% 85%, #6B7280 85% 100%)'}}></div>
                      <div className="space-y-1">
                        {[{c:'bg-indigo-500',l:'Fuel'},{c:'bg-orange-500',l:'Maint.'},{c:'bg-purple-500',l:'Other'}].map(x=>(
                          <div key={x.l} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${x.c}`}></div>
                            <span className="text-[9px] text-gray-500">{x.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything your fleet needs</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">One platform to dispatch smarter, track compliance, and optimize costs — no spreadsheets required.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-4`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get running in minutes</h2>
            <p className="text-gray-500 text-lg">Three simple steps to a fully operational fleet management system.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-gray-200"></div>
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 border-2 border-indigo-100 mb-6">
                  <span className="text-3xl font-extrabold text-indigo-600">{step.num}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Teaser */}
      <section id="analytics" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <Activity className="h-3.5 w-3.5" /> Live Analytics
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Insights that drive decisions</h2>
            <div className="space-y-4">
              {[
                'Fleet utilization trends over time',
                'Fuel efficiency by vehicle — identify underperformers',
                'Operational cost breakdown by category',
                'Driver safety score trends and compliance status',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold text-gray-900">Fuel Efficiency by Vehicle</h4>
              <span className="text-xs text-gray-400">Last 30 days</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'VAN-001', val: 92, color: 'bg-green-500' },
                { name: 'TRUCK-04', val: 78, color: 'bg-indigo-500' },
                { name: 'PICKUP-07', val: 65, color: 'bg-orange-500' },
                { name: 'VAN-003', val: 58, color: 'bg-yellow-500' },
                { name: 'TRUCK-09', val: 41, color: 'bg-red-500' },
              ].map((v) => (
                <div key={v.name}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{v.name}</span><span>{v.val}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${v.color} rounded-full transition-all`} style={{width: `${v.val}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-12 text-center" style={{background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(249,115,22,0.08) 100%)', border: '1px solid rgba(79,70,229,0.15)'}}>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to command your fleet?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">Get started in under 10 minutes. No credit card required.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-200"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8L8 2L14 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 14V8H11V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-900">FleetPilot</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Command your fleet. Trust your data. A production-grade transport operations platform.</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot"></span>
                All systems operational
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'How it Works', 'Changelog'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'GitHub'] },
              { title: 'Contact', links: ['Support', 'Sales', 'Community'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} FleetPilot. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-600">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
