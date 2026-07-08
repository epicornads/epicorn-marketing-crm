'use client';

import React, { useState } from 'react';
import { 
  Globe, Sparkles, Megaphone, Heart, BarChart3, 
  Layers, MousePointerClick, TrendingUp 
} from 'lucide-react';

interface LandingPageProps {
  onAnalyzeBrand: (url: string) => void;
  onGoToDashboard: () => void;
}

export default function LandingPage({ onAnalyzeBrand, onGoToDashboard }: LandingPageProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onAnalyzeBrand(url);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between text-left font-hanken relative overflow-hidden">
      
      {/* Background visual accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/10">
            <Sparkles className="w-4 h-4 fill-white/20" />
          </div>
          <div>
            <span className="font-manrope text-base font-extrabold tracking-tight text-slate-900 block leading-none">Epicorn</span>
            <span className="text-[9px] font-mono font-bold tracking-wider text-teal-600 uppercase mt-1 block">AI ADS CREATIVE DESIGNER</span>
          </div>
        </div>

        <button
          onClick={onGoToDashboard}
          className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-bold transition-all bg-white shadow-sm"
        >
          Go to Dashboard
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 max-w-5xl mx-auto w-full relative">
        
        {/* ============================================================== */}
        {/* FLOATING MARKETING ACCENTS (Responsive: Hidden on small screens) */}
        {/* ============================================================== */}
        
        {/* 1. Megaphone (Top Left) */}
        <div className="hidden lg:flex absolute top-12 left-4 w-16 h-16 rounded-2xl glass-panel items-center justify-center border-teal-500/20 shadow-lg text-teal-600 animate-float-1 z-10">
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
          <Megaphone className="w-7 h-7 -rotate-12" />
        </div>

        {/* 2. Engagement Heart (Top Right) */}
        <div className="hidden lg:flex absolute top-20 right-8 w-14 h-14 rounded-2xl glass-panel items-center justify-center border-rose-500/20 shadow-lg text-rose-500 animate-float-2 z-10">
          <Heart className="w-6 h-6 fill-rose-500/10" />
        </div>

        {/* 3. Analytics CTR Card (Bottom Left) */}
        <div className="hidden lg:flex absolute bottom-24 left-8 p-3 rounded-xl glass-panel flex-col gap-1.5 border-teal-500/20 shadow-xl animate-float-3 z-10 w-36 text-left">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase">CTR Performance</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900">4.8%</span>
            <span className="text-[9px] text-teal-600 font-bold font-mono">+12.4%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* 4. Creative Layers Card (Bottom Right) */}
        <div className="hidden lg:flex absolute bottom-16 right-6 p-3 rounded-xl glass-panel flex-col gap-2 border-emerald-500/20 shadow-xl animate-float-4 z-10 w-40 text-left">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase">Ad Design</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center bg-white/60 px-2 py-1 rounded border border-slate-100 text-[10px] font-bold text-slate-700">
              <span>Headline</span>
              <span className="text-[8px] font-mono text-slate-400">text</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 px-2 py-1 rounded border border-slate-100 text-[10px] font-bold text-slate-700">
              <span>CTA Button</span>
              <span className="text-[8px] font-mono text-slate-400">button</span>
            </div>
          </div>
        </div>

        {/* 5. Click Pointer (Middle Left of input) */}
        <div className="hidden xl:flex absolute bottom-44 left-48 w-10 h-10 rounded-full glass-panel items-center justify-center border-teal-500/20 shadow-md text-teal-500 animate-float-1 z-10">
          <MousePointerClick className="w-5 h-5" />
        </div>

        {/* ============================================================== */}

        {/* Main centered text blocks */}
        <div className="w-full text-center space-y-6 max-w-2xl z-20">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-mono font-bold tracking-wide shadow-sm shadow-teal-500/5">
            <Sparkles className="w-3.5 h-3.5 fill-teal-600/10" />
            <span>Generate ready-to-run ads from a URL</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-manrope font-extrabold text-slate-900 tracking-tight leading-tight">
            Turn your website URL into <span className="text-teal-600 font-black">On-Brand Ad Creatives</span> in minutes
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Epicorn analyzes your website's colors, logo, fonts, and copywriting style to generate fully customizable display ads ready for Facebook & Instagram.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-6 text-left max-w-xl mx-auto">
            {/* Input URL */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-200/80 p-2.5 flex items-center gap-2 transition-shadow">
              <div className="pl-3 text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.tedswoodworking.com/new/"
                className="flex-grow bg-transparent border-none outline-none text-slate-800 text-sm font-semibold py-2 px-1 focus:ring-0 placeholder-slate-300"
              />
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-wide transition-all flex items-center gap-2 flex-shrink-0 shadow-sm"
              >
                <span>Analyze My Brand</span>
                <span className="text-sm font-light">→</span>
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-white text-[11px] text-slate-400 font-medium z-30">
        <div className="flex items-center gap-1">
          <span>© 2026 Epicorn AI. All rights reserved. Platform optimized for Google & Meta ad dimensions.</span>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          <span>System status: Online</span>
        </div>
      </footer>
    </div>
  );
}
