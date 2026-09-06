import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Award, CheckCircle2, Clock, Users, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { sounds } from '../utils/audio';

interface LandingPageProps {
  onStartJourney: (name: string) => void;
  onOpenAdmin: () => void;
  onOpenVerify: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartJourney,
  onOpenAdmin,
  onOpenVerify,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Countdown timer for next live batch
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to start your 3-Day challenge');
      sounds.playPop();
      return;
    }
    setError('');
    sounds.playSuccess();
    onStartJourney(name.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <span className="font-extrabold text-white text-lg tracking-wider">VE</span>
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
              VerbalEdge
              <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Workshop
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Powered by Kapil
            </div>
          </div>
        </div>

        {/* Live status badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Workshop Cohort Live</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-16 text-center flex-1 flex flex-col items-center justify-center">
        {/* Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          Speak Better. Think Faster. Get Hired.
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-3xl leading-[1.1] mb-6">
          3-Day Verbal Ability &{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            Placement Readiness
          </span>{' '}
          Challenge
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Conquer top campus placement drives with high-frequency verbal drills, executive communication frameworks, mock interview speaking crucibles, and verified credentials.
        </p>

        {/* Countdown Timer */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl mb-10 inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-2xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-indigo-400">
            <Clock className="w-4 h-4 text-indigo-400" />
            Next Placement Cohort Starts In:
          </div>
          <div className="flex items-center gap-3 font-mono">
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-center min-w-[54px]">
              <div className="text-lg font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400">Hours</div>
            </div>
            <span className="text-slate-600 font-bold">:</span>
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-center min-w-[54px]">
              <div className="text-lg font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400">Mins</div>
            </div>
            <span className="text-slate-600 font-bold">:</span>
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-center min-w-[54px]">
              <div className="text-lg font-bold text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400">Secs</div>
            </div>
          </div>
        </div>

        {/* Fast Frictionless Registration Box */}
        {/* As specified in PRD: Only Enter Name -> Start Journey. No login. No signup. No email. No phone number. */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 text-slate-900 text-left border border-slate-100">
          <div className="mb-4">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              Start Your Challenge Now
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Zero passwords. Zero sign-up friction. Enter your name and begin in 5 seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="learner-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Enter Your Full Name
              </label>
              <input
                id="learner-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Kapil Narula"
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition"
              />
              {error && <p className="text-xs font-semibold text-rose-500 mt-1.5">{error}</p>}
            </div>

            <button
              id="btn-begin-journey"
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 group"
            >
              <span>Begin My Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Digital Badges & Certificates
            </span>
            <span className="font-semibold text-indigo-600">Free Workshop</span>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full mt-16 text-left">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">Day-Wise Masterclasses</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grammar traps, BLUF email communication, and STAR behavioral interview frameworks.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">Verified QR Credentials</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn shareable digital badges and gold-themed certificates authenticatable by any employer.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">Direct Mentorship</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Private 1-to-1 doubt clearance chat directly with trainer Kapil Narula during the workshop.
            </p>
          </div>
        </div>
      </main>

      {/* Footer with Discreet Hidden Admin Trigger */}
      <footer className="relative z-10 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-4">
        <div>
          © {new Date().getFullYear()} VerbalEdge Academy. All rights reserved. Powered by Kapil.
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const testId = prompt('Enter Certificate or Badge ID to verify:');
              if (testId) onOpenVerify(testId);
            }}
            className="hover:text-slate-400 transition"
          >
            Verify Credential
          </button>

          {/* Hidden Admin Access (PRD Page 3: "Single secure admin login. Completely hidden. Never visible anywhere on landing page.") */}
          {/* Subtle dot trigger allowing Kapil to access /admin without a visible admin button */}
          <button
            id="admin-secret-access"
            onClick={onOpenAdmin}
            title="Administrator Portal"
            className="opacity-25 hover:opacity-100 text-slate-500 hover:text-indigo-400 transition p-1 text-[10px]"
          >
            •
          </button>
        </div>
      </footer>
    </div>
  );
};
