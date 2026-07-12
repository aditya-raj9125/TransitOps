import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Check, Plus, X,
  Map, Calendar, ShieldCheck, BarChart3, Truck, Zap
} from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const features = [
  {
    num: '01',
    icon: Map,
    title: 'Live Tracking',
    subtitle: '4 layouts',
    description: 'Portrait, landscape & multi-frame route storyboards.'
  },
  {
    num: '02',
    icon: Calendar,
    title: 'Scheduling',
    subtitle: '3 layouts',
    description: 'Daily, weekly and split-view dispatch variants.'
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Analytics',
    subtitle: '6 layouts',
    description: 'Window chrome, charts, modals, blank canvas.'
  },
  {
    num: '04',
    icon: ShieldCheck,
    title: 'Safety Logs',
    subtitle: '3 layouts',
    description: 'Round, rect and complication-grid frames.'
  }
];

const faqs = [
  { q: "Is it really free?", a: "Yes — MIT-licensed, no signup, no email. Open the platform, manage your fleet, and monitor routes. Use it for personal projects, commercial work, or enterprise fleets." },
  { q: "Do I need to install anything?", a: "No installation is required. FleetPilot is entirely web-based." },
  { q: "What integrations do you support?", a: "We provide comprehensive REST APIs and webhooks for all major telemetry providers." },
  { q: "Can I contribute new features?", a: "Absolutely! Check out our open-source repo on GitHub to see how you can contribute." },
  { q: "Why not just use a spreadsheet?", a: "Spreadsheets don't update in real-time, lack automated safety compliance checks, and don't scale for complex dispatch logic." },
  { q: "Where can I send feedback?", a: "Drop us an issue on GitHub or reach out to support@fleetpilot.dev." }
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#1A1A1A] font-['Inter',sans-serif] selection:bg-orange-200">
      
      {/* --- Navbar --- */}
      <header className="sticky top-0 z-50 bg-[#FCFBF9]/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center shadow-sm">
              {/* Custom Logo mimicking the orange book */}
              <div className="w-4 h-4 bg-[#F26C2A] rounded-sm flex flex-col justify-center items-center gap-[2px]">
                <div className="w-2.5 h-[1.5px] bg-white opacity-80" />
                <div className="w-2.5 h-[1.5px] bg-white opacity-80" />
              </div>
            </div>
            <span className="font-semibold text-lg tracking-tight">FleetPilot</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-gray-600">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#features" className="hover:text-black transition-colors">Templates</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">Builder</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
            <a href="#open-source" className="hover:text-black transition-colors">Open source</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700">
              <GithubIcon className="h-[18px] w-[18px]" />
            </a>
            <button
              onClick={() => navigate('/login')}
              className="text-[14px] font-semibold bg-[#F26C2A] hover:bg-[#E05C1C] text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm shadow-orange-500/20"
            >
              Open the builder
            </button>
          </div>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Soft Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FCECD9] rounded-full blur-[100px] opacity-60" />
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-[#F2E8E0] rounded-full blur-[100px] opacity-40" />
        </div>

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white text-gray-600 text-[13px] font-medium px-4 py-1.5 rounded-full border border-gray-200 mb-10 shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
          <div className="w-4 h-4 rounded-full bg-[#FFF0E6] text-[#F26C2A] flex items-center justify-center">
            <Check className="w-2.5 h-2.5" />
          </div>
          Platform now live — track, manage, optimize <span className="text-gray-400">→</span>
        </div>

        {/* Headline */}
        <h1 className="text-[56px] md:text-[80px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111] mb-6 max-w-4xl">
          Command fleets <br />
          you can <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F26C2A] to-[#D95319] relative inline-block">
            actually optimize.
            {/* Subtle glow underneath the orange text */}
            <span className="absolute left-0 bottom-0 w-full h-8 bg-[#F26C2A] blur-2xl opacity-20 -z-10" />
          </span>
        </h1>

        <p className="text-[19px] text-[#555] max-w-2xl mx-auto mb-10 leading-[1.6]">
          Dispatch drivers, monitor live routes, manage compliance, and analyze expenses. A powerful, unified dashboard for fleet operations you can rely on to scale your business.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-[#F26C2A] hover:bg-[#E05C1C] text-white font-semibold text-[15px] px-8 py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/20"
          >
            Go to dashboard <ArrowRight className="h-[18px] w-[18px]" />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-800 font-semibold text-[15px] px-8 py-3.5 rounded-xl transition-colors shadow-sm"
          >
            <GithubIcon className="h-[18px] w-[18px]" /> Star on GitHub
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-gray-500 font-medium">
          <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full bg-[#FFF0E6] text-[#F26C2A] flex items-center justify-center"><Check className="w-2.5 h-2.5" /></div> Free to use</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full bg-[#FFF0E6] text-[#F26C2A] flex items-center justify-center"><Check className="w-2.5 h-2.5" /></div> MIT licensed</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full bg-[#FFF0E6] text-[#F26C2A] flex items-center justify-center"><Check className="w-2.5 h-2.5" /></div> No signup</span>
        </div>
      </section>

      {/* --- Features Grid Section --- */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-14">
            <div className="text-[11px] font-bold tracking-widest text-[#F26C2A] uppercase mb-4">Starting Points</div>
            <h2 className="text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#111] mb-4">
              Everything your<br />fleet needs.
            </h2>
            <p className="text-[17px] text-[#666] max-w-xl leading-[1.6]">
              Choose from core fleet modules to dispatch smarter, track compliance, and optimize costs — no spreadsheets required. Everything is manageable in the dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group border border-gray-100 rounded-[20px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Dot Grid Background Illustration area */}
                <div className="h-56 bg-[#F8F7F4] relative border-b border-gray-100 flex items-center justify-center p-8 overflow-hidden" 
                     style={{ backgroundImage: 'radial-gradient(#E5E5E5 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}>
                  <div className="absolute top-4 left-4 bg-white border border-gray-200 text-gray-500 text-[10px] font-mono px-2 py-0.5 rounded-full shadow-sm z-10">
                    {f.num}
                  </div>
                  {/* Fake UI Frame */}
                  <div className="w-full h-full border-[1.5px] border-[#333] rounded-[16px] bg-[#F8F7F4] flex items-center justify-center p-2 relative shadow-sm transition-transform group-hover:scale-105 duration-500">
                    <div className="absolute top-2 w-12 h-[1px] bg-[#333] opacity-30"></div>
                    <div className="absolute bottom-2 w-12 h-[1px] bg-[#333] opacity-30"></div>
                  </div>
                </div>
                {/* Text Content */}
                <div className="p-6 bg-white">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{f.title}</h3>
                    <span className="text-[11px] font-mono text-gray-400">{f.subtitle}</span>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Steps Section --- */}
      <section id="how-it-works" className="py-24 px-6 bg-[#FCFBF9]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-14">
            <h2 className="text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#111] mb-4">
              Three steps. <span className="text-[#F26C2A]">Real fast.</span>
            </h2>
            <p className="text-[17px] text-[#666] max-w-xl">
              From signing up to full fleet visibility in under sixty seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', time: '~ 30 SEC', title: 'Connect & setup.', desc: 'No complex installations. Open the platform in your browser, register your vehicles, and onboard your drivers.' },
              { num: '02', time: 'REAL-TIME', title: 'Dispatch & track.', desc: 'Assign trips instantly and track vehicles live on the map. Handle delays, optimize routes, and stay in control.' },
              { num: '03', time: 'CONTINUOUS', title: 'Analyze & scale.', desc: 'Generate reports, track fuel efficiency, and monitor compliance. Make data-driven decisions to cut operational costs.' },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-sm relative min-h-[340px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[14px] ${i === 0 ? 'bg-[#FFF0E6] text-[#F26C2A]' : i === 1 ? 'bg-[#F26C2A] text-white' : 'bg-[#FFF0E6] text-[#F26C2A]'}`}>
                    {step.num}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-gray-400">{step.time}</span>
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">{step.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-auto">{step.desc}</p>
                
                {/* Decorative bottom element */}
                <div className="mt-8 bg-[#F8F7F4] border border-gray-100 rounded-xl p-4 h-24 flex items-center justify-center overflow-hidden">
                  {i === 0 && (
                    <div className="flex items-center justify-between w-full border border-gray-200 bg-white rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#F26C2A]" /><span className="text-[12px] font-semibold text-gray-800">Add Vehicle</span></div>
                      <span className="text-[10px] font-mono text-gray-400">dashboard</span>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="w-12 h-1 bg-[#F26C2A] rounded-full" />
                      <div className="w-8 h-1 bg-[#F26C2A] rounded-full opacity-50" />
                      <div className="flex gap-2 mt-2">
                        <div className="w-16 h-8 border-[1.5px] border-[#333] rounded-md" />
                        <div className="w-10 h-8 border-[1.5px] border-[#333] rounded-md" />
                        <div className="w-10 h-8 bg-[#333] rounded-md" />
                      </div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="flex items-center gap-3 border border-gray-200 bg-white rounded-lg px-4 py-3 shadow-sm w-full">
                      <div className="w-6 h-6 flex items-center justify-center border border-[#F26C2A] rounded-md bg-[#FFF0E6]"><ArrowRight className="w-3 h-3 text-[#F26C2A] rotate-90" /></div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-semibold text-gray-800">analytics-report.pdf</span>
                        <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1"><ArrowRight className="w-2.5 h-2.5" /> ready to download</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-[#FFF0E6] text-[#F26C2A] flex items-center justify-center ml-auto">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section id="faq" className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <h2 className="text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#111]">
            Questions, answered.
          </h2>
        </div>
        
        <div className="max-w-[800px] mx-auto space-y-0 border-t border-gray-100">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-0">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full py-6 flex justify-between items-center text-left group"
              >
                <span className="font-medium text-[16px] text-gray-900">{faq.q}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${openFaq === i ? 'bg-[#FFF0E6] text-[#F26C2A]' : 'border border-gray-200 text-gray-400 group-hover:border-gray-300'}`}>
                  {openFaq === i ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
              </button>
              {openFaq === i && (
                <div className="pb-8 pr-12 text-[15px] text-[#555] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- Bottom CTA Section --- */}
      <section className="py-24 px-6 bg-[#FCFBF9] flex flex-col items-center border-t border-gray-100">
        <div className="max-w-[600px] mx-auto text-center">
          <p className="text-[19px] text-[#555] leading-[1.6] mb-10">
            Dispatch, track, maintain, and report. The platform gives you an operational birds-eye view you can set up in minutes — then manage your entire business effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-[#F26C2A] hover:bg-[#E05C1C] text-white font-semibold text-[15px] px-8 py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/20"
            >
              Open the dashboard <ArrowRight className="h-[18px] w-[18px]" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-800 font-semibold text-[15px] px-6 py-3.5 rounded-xl transition-colors shadow-sm"
            >
              <GithubIcon className="h-[18px] w-[18px]" /> View source
            </a>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-[#FCFBF9] py-16 px-6 border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-12 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-[#1F1F1F] flex items-center justify-center shadow-sm">
                <div className="w-3.5 h-3.5 bg-[#F26C2A] rounded-[3px] flex flex-col justify-center items-center gap-[1.5px]">
                  <div className="w-2 h-[1px] bg-white opacity-80" />
                  <div className="w-2 h-[1px] bg-white opacity-80" />
                </div>
              </div>
              <span className="font-semibold text-[16px] text-[#111]">FleetPilot</span>
            </div>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-6 max-w-sm">
              An intelligent operations dashboard for modern fleets. Dispatch smarter, track in real-time, and guarantee compliance with our unified OS.
            </p>
            <div className="flex items-center gap-2 text-[12px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
              All systems tracking <span className="mx-2">•</span> v1.0
            </div>
          </div>
          
          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="font-mono text-[11px] tracking-widest text-gray-400 uppercase mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">Features</a></li>
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">Templates</a></li>
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">How it works</a></li>
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">FAQ</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-mono text-[11px] tracking-widest text-gray-400 uppercase mb-6">Source</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">GitHub repo</a></li>
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">Open issues</a></li>
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">Releases</a></li>
              <li><a href="#" className="text-[14px] text-gray-600 hover:text-black">MIT license</a></li>
            </ul>
          </div>
          
          {/* Stay in touch */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-[11px] tracking-widest text-gray-400 uppercase mb-6">Stay in touch</h4>
            <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
              Star the repo to get platform updates and new feature releases.
            </p>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors shadow-sm mb-6">
              <GithubIcon className="h-4 w-4" /> Star on GitHub
            </a>
            <p className="text-[13px] text-gray-400">
              contact@fleetpilot.dev
            </p>
          </div>
        </div>
      </footer>
      
    </div>
  );
};
