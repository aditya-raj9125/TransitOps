import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, AlertCircle, Loader2, Truck, ShieldCheck, BarChart3, MapPin } from 'lucide-react';
import apiClient from '../../api/client';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    { icon: <MapPin className="h-6 w-6 text-white" />, title: "Real-Time Visibility", desc: "Track every vehicle with pinpoint accuracy and adapt to conditions instantly." },
    { icon: <ShieldCheck className="h-6 w-6 text-white" />, title: "Proactive Safety", desc: "Protect your drivers and reduce liability with automated compliance risk alerts." },
    { icon: <BarChart3 className="h-6 w-6 text-white" />, title: "Actionable Intelligence", desc: "Transform raw data into strategic decisions to slash costs and boost efficiency." },
    { icon: <Truck className="h-6 w-6 text-white" />, title: "Predictive Maintenance", desc: "Stop breakdowns before they happen. Keep your assets on the road, not in the shop." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [features.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#FCFBF9] font-['Inter',sans-serif]">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative">
        
        <div className="w-full max-w-[420px] mx-auto relative z-10">
          {/* Logo */}
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] flex items-center justify-center shadow-sm">
                <div className="w-5 h-5 bg-[#F26C2A] rounded-md flex flex-col justify-center items-center gap-[2.5px]">
                  <div className="w-3 h-[2px] bg-white opacity-80" />
                  <div className="w-3 h-[2px] bg-white opacity-80" />
                </div>
              </div>
              <span className="text-2xl font-semibold text-[#111] tracking-tight">FleetPilot</span>
            </Link>
            <h2 className="text-[32px] font-semibold text-[#111] mt-6 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-2">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mb-6 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@fleetpilot.dev"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#F26C2A]/30 focus:border-[#F26C2A] transition-all placeholder:text-gray-400 font-medium text-gray-900 hover:border-gray-300"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-[#F26C2A] hover:text-[#E05C1C] font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#F26C2A]/30 focus:border-[#F26C2A] transition-all placeholder:text-gray-400 font-medium text-gray-900 hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F26C2A] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#F26C2A] hover:bg-[#E05C1C] disabled:opacity-70 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#F26C2A]/20 mt-4 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <p className="text-xs text-orange-800 font-medium text-center mb-1">
                Demo Credentials
              </p>
              <div className="flex justify-center items-center gap-2 text-xs text-orange-900">
                <span className="font-mono bg-white px-2 py-1 rounded shadow-sm">admin@fleetpilot.dev</span>
                <span>/</span>
                <span className="font-mono bg-white px-2 py-1 rounded shadow-sm">FleetPilot@2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Animated Info */}
      <div className="hidden lg:flex w-1/2 bg-[#FFF0E6] relative overflow-hidden flex-col items-center justify-center p-12 border-l border-[#FCECD9]">
        {/* Dot Grid Background mimicking the landing page */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#F26C2A 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
        </div>
        
        {/* Abstract animated background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[80px] opacity-60 translate-x-1/3 -translate-y-1/3 animate-[spin_60s_linear_infinite]" />
        
        {/* Clean, brand-aligned content container */}
        <div className="relative z-10 w-full max-w-lg p-8 bg-white/60 backdrop-blur-md border border-white rounded-[24px] shadow-sm">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F26C2A] shadow-md shadow-[#F26C2A]/20 mb-8">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-[36px] font-semibold text-[#111] mb-4 tracking-tight leading-tight">The Modern Fleet OS</h2>
            <p className="text-gray-600 text-[17px] font-medium leading-[1.6]">
              Everything you need to orchestrate routes, track assets, and empower drivers — all in one unified platform.
            </p>
          </div>

          {/* Animated Features Carousel */}
          <div className="relative h-[160px] w-full">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 flex flex-col items-center text-center transition-all duration-500 ease-in-out ${
                  idx === activeFeature 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-5 border border-gray-100 shadow-sm">
                  {React.cloneElement(feature.icon as React.ReactElement, { className: 'h-6 w-6 text-[#F26C2A]' })}
                </div>
                <h3 className="text-2xl font-semibold text-[#111] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-[15px] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeFeature ? 'w-8 bg-[#F26C2A]' : 'w-2 bg-[#F26C2A]/30 hover:bg-[#F26C2A]/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

