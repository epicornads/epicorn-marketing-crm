'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Zap, Cpu } from 'lucide-react';

interface ScraperLoadingProps {
  url: string;
  onScrapeComplete: (brandData: any) => void;
}

interface Step {
  title: string;
  subtitle: string;
  pill: string;
  pillPosition: 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right';
}

const SCAN_STEPS: Step[] = [
  { 
    title: 'Connecting to Website Server...', 
    subtitle: 'Resolving IP address and downloading source assets...', 
    pill: 'Server Resolution',
    pillPosition: 'top-left'
  },
  { 
    title: 'Scraping Homepage HTML...', 
    subtitle: 'Extracting DOM layout nodes, meta tags, and headers...', 
    pill: 'DOM Scraping',
    pillPosition: 'bottom-right'
  },
  { 
    title: 'Detecting Color Palettes...', 
    subtitle: 'Sampling primary, secondary, and accent hues...', 
    pill: 'HEX Extraction',
    pillPosition: 'top-right'
  },
  { 
    title: 'Typography Analysis...', 
    subtitle: 'Resolving stylesheet font-families and scale ratios...', 
    pill: 'Font Parsing',
    pillPosition: 'bottom-left'
  },
  { 
    title: 'Extracting Brand Assets...', 
    subtitle: 'Capturing logos, product photos, and vector graphics...', 
    pill: 'Asset Scanner',
    pillPosition: 'top-right'
  },
  { 
    title: 'Synthesizing Brand Copy...', 
    subtitle: 'Analyzing copywriting style, tone, and active offers...', 
    pill: 'LLM Synthesis',
    pillPosition: 'bottom-left'
  }
];

export default function ScraperLoading({ url, onScrapeComplete }: ScraperLoadingProps) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [assetsDiscovered, setAssetsDiscovered] = useState(0);
  const [aiConfidence, setAiConfidence] = useState(12.5);

  const stepsFinishedRef = useRef(false);
  const brandResultRef = useRef<any>(null);

  // Formatting display URL
  const displayUrl = url.replace(/https?:\/\/(www\.)?/, '').toUpperCase();

  // 1. Fire API scrape request immediately on mount
  useEffect(() => {
    fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })
      .then(res => res.json())
      .then(data => {
        brandResultRef.current = data;
        // If the 12-second scanning animation has already completed, transition immediately
        if (stepsFinishedRef.current) {
          onScrapeComplete(data);
        }
      })
      .catch(err => {
        console.error('Frontend API scraping fetch error:', err);
        // Clean fallback
        const fallback = generateGeneralFallback(url);
        brandResultRef.current = fallback;
        if (stepsFinishedRef.current) {
          onScrapeComplete(fallback);
        }
      });
  }, [url]);

  // 2. Play the 12-second scan step sequence
  useEffect(() => {
    const stepDuration = 2000; // 2 seconds per stage = 12s total
    
    const interval = setInterval(() => {
      setActiveStepIdx(prev => {
        const next = prev + 1;
        if (next >= SCAN_STEPS.length) {
          clearInterval(interval);
          stepsFinishedRef.current = true;
          
          // Transition to brand kit review if API request has resolved
          if (brandResultRef.current) {
            onScrapeComplete(brandResultRef.current);
          }
          return prev;
        }

        // Increment mock stats
        setAssetsDiscovered(a => a + Math.floor(Math.random() * 3) + 2);
        setAiConfidence(c => Math.min(parseFloat((c + Math.random() * 18 + 10).toFixed(1)), 98.6));
        return next;
      });
    }, stepDuration);

    const progressTimer = setInterval(() => {
      setProgress(p => {
        const targetProgress = ((activeStepIdx + 1) / SCAN_STEPS.length) * 100;
        if (p < targetProgress) {
          return p + 1;
        }
        return p;
      });
    }, stepDuration / (100 / SCAN_STEPS.length));

    return () => {
      clearInterval(interval);
      clearInterval(progressTimer);
    };
  }, [activeStepIdx]);

  const currentStep = SCAN_STEPS[activeStepIdx] || SCAN_STEPS[SCAN_STEPS.length - 1];

  return (
    <div className="min-h-screen bg-[#07090c] text-white flex flex-col justify-between p-6 relative overflow-hidden font-mono select-none">
      
      {/* Central Mesh ambient glows */}
      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[55vw] h-[55vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[35vw] h-[35vw] rounded-full bg-teal-500/5 blur-[90px] pointer-events-none z-0" />

      {/* Header */}
      <header className="flex items-center justify-center gap-2.5 z-10 pt-4">
        <div className="w-8 h-8 rounded bg-[#baf91a] flex items-center justify-center text-[#07090c]">
          <Sparkles className="w-4 h-4 fill-[#07090c]" />
        </div>
        <div className="text-left">
          <span className="font-manrope text-base font-extrabold tracking-tight text-white block leading-none">Epicorn</span>
          <span className="text-[9px] font-mono tracking-widest text-emerald-400 mt-1 block">AI MARKETING ENGINE</span>
        </div>
      </header>

      {/* Main Scraper Dashboard Visualizer */}
      <main className="flex-grow flex flex-col items-center justify-center z-10 py-10 max-w-lg mx-auto w-full">
        
        {/* Wireframe Scanning Panel */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          
          {/* Concentric wireframe circle loops */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-spin duration-15000" />
          <div className="absolute inset-4 rounded-full border border-emerald-500/5 animate-spin duration-30000" />
          <div className="absolute inset-8 rounded-full border border-emerald-500/10" />

          {/* Central simulated website wireframe card */}
          <div className="absolute w-44 h-44 rounded-xl border border-emerald-500/25 bg-emerald-950/10 backdrop-blur-md p-4 overflow-hidden flex flex-col justify-between">
            {/* Header bar */}
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
              <div className="flex gap-1.5">
                <div className="w-6 h-1.5 bg-emerald-500/20 rounded-full" />
                <div className="w-6 h-1.5 bg-emerald-500/20 rounded-full" />
              </div>
            </div>
            {/* Hero image slot */}
            <div className="flex-grow my-2 border border-dashed border-emerald-500/25 rounded flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
                <span className="text-[10px] text-emerald-400 font-bold">URL</span>
              </div>
            </div>
            {/* Paragraph block */}
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-emerald-500/20 rounded-full" />
              <div className="w-3/4 h-1.5 bg-emerald-500/20 rounded-full" />
            </div>

            {/* Glowing scanning laser bar */}
            <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-scan z-10" />
          </div>

          {/* Floating Pill Badges */}
          <div 
            className={`absolute px-2.5 py-1 rounded-full border bg-neutral-900 border-emerald-500/30 text-[9px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-md shadow-black/40 transition-all duration-500 z-20 ${
              currentStep.pillPosition === 'top-right' ? 'top-4 -right-16 scale-100' :
              currentStep.pillPosition === 'bottom-left' ? 'bottom-4 -left-16 scale-100' :
              'opacity-30 scale-95'
            }`}
            style={{
              top: currentStep.pillPosition === 'top-right' ? '16px' : currentStep.pillPosition === 'top-left' ? '16px' : undefined,
              bottom: currentStep.pillPosition === 'bottom-left' ? '16px' : currentStep.pillPosition === 'bottom-right' ? '16px' : undefined,
              right: currentStep.pillPosition === 'top-right' ? '-44px' : currentStep.pillPosition === 'bottom-right' ? '-44px' : undefined,
              left: currentStep.pillPosition === 'bottom-left' ? '-44px' : currentStep.pillPosition === 'top-left' ? '-44px' : undefined,
            }}
          >
            <Cpu className="w-3 h-3 animate-pulse" />
            <span>{currentStep.pill}</span>
          </div>

        </div>

        {/* Text descriptions */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-bold tracking-wide text-white leading-tight font-manrope">
            {currentStep.title}
          </h2>
          <p className="text-xs text-neutral-400 leading-normal max-w-sm mx-auto">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Neon Green Progress Bar */}
        <div className="w-full max-w-sm h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-[#baf91a] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Dashboard cards */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Card 1: Assets Discovered */}
          <div className="bg-[#0b0c0e] border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between h-24 text-left shadow-lg">
            <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">ASSETS DISCOVERED</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white leading-none font-manrope">
                {assetsDiscovered}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Card 2: AI Confidence */}
          <div className="bg-[#0b0c0e] border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between h-24 text-left shadow-lg">
            <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">AI CONFIDENCE</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white leading-none font-manrope">
                {aiConfidence}%
              </span>
              <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-[9px] text-neutral-500 font-mono tracking-widest pt-4 border-t border-neutral-900">
        <div className="flex items-center gap-3">
          <span>● SERVER: CLUSTER-09</span>
          <span>● KERNEL: V4.2.0-AI</span>
        </div>
        <div className="mt-2 sm:mt-0 font-bold text-emerald-400">
          <span>SCANNING: {displayUrl}</span>
        </div>
      </footer>
    </div>
  );
}

function generateGeneralFallback(url: string) {
  const domain = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0];
  const capitalized = domain.charAt(0).toUpperCase() + domain.slice(1);
  return {
    name: capitalized,
    websiteUrl: url,
    logoUrl: '▲ ' + capitalized,
    colors: {
      primary: '#0f172a',
      secondary: '#0ea5e9',
      tertiary: '#475569',
      background: '#f8fafc',
      text: '#0f172a'
    },
    fonts: { headline: 'Manrope', body: 'Hanken Grotesk' },
    tone: 'Professional, innovative, and growth-focused',
    offers: [
      `Save 30% on all plans for ${capitalized} today!`,
      'Start your 14-day free trial, no card required',
      `Upgrade your workflow with ${capitalized} premium`
    ],
    testimonials: [{ quote: 'Outstanding results and support from the entire team.', author: 'John D.', rating: 5 }],
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600',
      'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600'
    ]
  };
}
