'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, BrainCircuit, Image, Cpu, CheckCircle2 } from 'lucide-react';
import { BrandKit } from '../types';

export interface AiGeneratedCopy {
  offerHeadline: string;
  offerSubtext: string;
  benefitHeadline: string;
  benefitSubtext: string;
  testimonialHeadline: string;
  testimonialQuote: string;
  cta: string;
}

export interface AiGeneratedAssets {
  copy: AiGeneratedCopy;
  images: {
    offerImage: string;
    benefitImage: string;
    testimonialImage: string;
  };
}

interface AdGeneratorLoadingProps {
  brand: BrandKit;
  onComplete: (assets: AiGeneratedAssets) => void;
}

interface GenLog {
  id: number;
  model: 'GEMINI' | 'FLUX.1' | 'SDXL';
  text: string;
  status: 'pending' | 'active' | 'done';
}

export default function AdGeneratorLoading({ brand, onComplete }: AdGeneratorLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<GenLog[]>([
    { id: 1, model: 'GEMINI', text: 'Synthesizing copywriting and taglines for Offer Angle...', status: 'pending' },
    { id: 2, model: 'GEMINI', text: 'Drafting benefit lists and product values for Benefit Angle...', status: 'pending' },
    { id: 3, model: 'GEMINI', text: 'Formatting customer testimonials for Testimonial Angle...', status: 'pending' },
    { id: 4, model: 'FLUX.1', text: 'Generating lifestyle image for Offer Angle (1024x1024)...', status: 'pending' },
    { id: 5, model: 'FLUX.1', text: 'Rendering clean product display for Benefit Angle...', status: 'pending' },
    { id: 6, model: 'SDXL', text: 'Running aesthetic layout compiler and canvas composition...', status: 'pending' }
  ]);
  const [adResolving, setAdResolving] = useState<boolean[]>([false, false, false]);
  
  // Custom generated images tracking
  const [aiGeneratedImages, setAiGeneratedImages] = useState<string[]>([
    brand.images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600',
    brand.images[1] || brand.images[0] || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600',
    brand.images[2] || brand.images[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600'
  ]);

  const aiCopyRef = useRef<AiGeneratedCopy | null>(null);
  const aiImagesRef = useRef<{ offerImage: string; benefitImage: string; testimonialImage: string } | null>(null);
  const hasCalledApi = useRef(false);

  // Fire Gemini API calls and Pollinations API calls on mount
  useEffect(() => {
    if (hasCalledApi.current) return;
    hasCalledApi.current = true;

    async function generateAiAssets() {
      // 1. Set up copy placeholders
      const copyResults: AiGeneratedCopy = {
        offerHeadline: brand.offers[0] || `Exclusive Deals at ${brand.name}`,
        offerSubtext: brand.offers[1] || `Shop the best from ${brand.name}`,
        benefitHeadline: `Why Choose ${brand.name}?`,
        benefitSubtext: `Premium quality you can trust`,
        testimonialHeadline: `What Customers Say About ${brand.name}`,
        testimonialQuote: brand.testimonials[0]?.quote || `Outstanding quality from ${brand.name}!`,
        cta: `Shop ${brand.name} Now`
      };

      // 2. Set up image placeholders
      const imageResults = {
        offerImage: brand.images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600',
        benefitImage: brand.images[1] || brand.images[0] || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600',
        testimonialImage: brand.images[2] || brand.images[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600'
      };

      // 3. Category detection for descriptive prompts
      const isSkincare = brand.websiteUrl.includes('glow') || brand.websiteUrl.includes('skin') || brand.websiteUrl.includes('beauty') || brand.websiteUrl.includes('organic') || brand.websiteUrl.includes('skincare') || brand.tone.toLowerCase().includes('skincare') || brand.tone.toLowerCase().includes('beauty');
      const isCoffee = brand.websiteUrl.includes('coffee') || brand.websiteUrl.includes('cup') || brand.websiteUrl.includes('brew') || brand.websiteUrl.includes('cafe') || brand.websiteUrl.includes('espresso') || brand.tone.toLowerCase().includes('coffee') || brand.tone.toLowerCase().includes('cafe');
      const isWoodworking = brand.websiteUrl.includes('wood') || brand.websiteUrl.includes('carpenter') || brand.websiteUrl.includes('craft') || brand.websiteUrl.includes('woodworking') || brand.tone.toLowerCase().includes('woodworking') || brand.tone.toLowerCase().includes('carpentry');
      
      let themeKeywords = 'commercial product advertisement';
      let offerKeywords = 'clean luxury product container';
      let benefitKeywords = 'natural aesthetic lifestyle ingredients';
      let testimonialKeywords = 'happy satisfied customer smiling portrait';

      if (isSkincare) {
        themeKeywords = 'skincare, organic cosmetics, clean beauty';
        offerKeywords = 'aesthetic cosmetics bottle, green leaf decoration';
        benefitKeywords = 'raw natural organic ingredients, water splash';
        testimonialKeywords = 'glowing clean skin portrait of a smiling woman';
      } else if (isCoffee) {
        themeKeywords = 'coffee shop, roasted beans, specialty espresso';
        offerKeywords = 'steaming hot latte cup on a wooden table, latte art';
        benefitKeywords = 'fresh coffee beans pouring out of a rustic bag';
        testimonialKeywords = 'happy customer taking a sip of warm coffee in a cozy cafe';
      } else if (isWoodworking) {
        themeKeywords = 'woodworking workshop, carpentry tools, wood carving';
        offerKeywords = 'crafted wooden table display, vintage carpentry tools';
        benefitKeywords = 'carpenter hand working on a premium wood board, sawdust';
        testimonialKeywords = 'proud carpenter smiling in a sunny workshop holding a crafted piece';
      } else {
        themeKeywords = `${brand.name} company branding, corporate advertising`;
        offerKeywords = `modern business elements related to ${brand.name}`;
        benefitKeywords = `sleek digital workspace concept, creative layout`;
        testimonialKeywords = `professional team member smiling confidently`;
      }

      try {
        console.log('Firing parallel AI copy & Pollinations image generation...');
        
        // Execute copy generation and image generation in parallel
        const [
          offerRes,
          benefitRes,
          testimonialRes,
          offerImgRes,
          benefitImgRes,
          testimonialImgRes
        ] = await Promise.allSettled([
          // Copy angle - Offer
          fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Write a short, punchy offer-focused ad headline (under 10 words) for the brand "${brand.name}". Current offers: ${brand.offers.join(', ')}.`,
              brandName: brand.name,
              brandTone: brand.tone,
              mode: 'ad-copy'
            })
          }),
          // Copy angle - Benefit
          fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Write a short benefit-focused ad headline (under 10 words) for "${brand.name}" that highlights the key value proposition.`,
              brandName: brand.name,
              brandTone: brand.tone,
              mode: 'ad-copy'
            })
          }),
          // Copy angle - CTA
          fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Write a short, compelling CTA button text (2-4 words) for "${brand.name}" ads.`,
              brandName: brand.name,
              brandTone: brand.tone,
              mode: 'ad-copy'
            })
          }),
          // Image Generation - Offer (Pollinations FLUX -> Cloudinary/Proxy)
          fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `${offerKeywords}, ${themeKeywords}, studio lighting, commercial product photography, depth of field, high resolution`,
              mode: 'image-generation'
            })
          }),
          // Image Generation - Benefit (Pollinations FLUX -> Cloudinary/Proxy)
          fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `${benefitKeywords}, ${themeKeywords}, natural warm sunlight, organic layout photography, cinematic, 8k`,
              mode: 'image-generation'
            })
          }),
          // Image Generation - Testimonial (Pollinations FLUX -> Cloudinary/Proxy)
          fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `${testimonialKeywords}, ${themeKeywords}, soft glow lighting, authentic portrait photography, editorial style`,
              mode: 'image-generation'
            })
          })
        ]);

        // Process copy results
        if (offerRes.status === 'fulfilled' && offerRes.value.ok) {
          const data = await offerRes.value.json();
          if (data.text) copyResults.offerHeadline = data.text;
        }
        if (benefitRes.status === 'fulfilled' && benefitRes.value.ok) {
          const data = await benefitRes.value.json();
          if (data.text) copyResults.benefitHeadline = data.text;
        }
        if (testimonialRes.status === 'fulfilled' && testimonialRes.value.ok) {
          const data = await testimonialRes.value.json();
          if (data.text) copyResults.cta = data.text;
        }

        // Process image results and update preview states dynamically
        if (offerImgRes.status === 'fulfilled' && offerImgRes.value.ok) {
          const data = await offerImgRes.value.json();
          if (data.text) {
            imageResults.offerImage = data.text;
            setAiGeneratedImages(prev => [data.text, prev[1], prev[2]]);
          }
        }
        if (benefitImgRes.status === 'fulfilled' && benefitImgRes.value.ok) {
          const data = await benefitImgRes.value.json();
          if (data.text) {
            imageResults.benefitImage = data.text;
            setAiGeneratedImages(prev => [prev[0], data.text, prev[2]]);
          }
        }
        if (testimonialImgRes.status === 'fulfilled' && testimonialImgRes.value.ok) {
          const data = await testimonialImgRes.value.json();
          if (data.text) {
            imageResults.testimonialImage = data.text;
            setAiGeneratedImages(prev => [prev[0], prev[1], data.text]);
          }
        }

      } catch (err) {
        console.error('Ad copy or image generation failed:', err);
      }

      aiCopyRef.current = copyResults;
      aiImagesRef.current = imageResults;
    }

    generateAiAssets();
  }, [brand]);

  // Progress animation timer
  useEffect(() => {
    const totalDuration = 6000;
    const intervalTime = 100;
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress(p => {
        const nextProgress = p + increment;
        
        // Dynamic logs state updates
        setLogs(currentLogs => {
          return currentLogs.map((log, idx) => {
            const activationProgress = (idx / currentLogs.length) * 100;
            const completionProgress = ((idx + 1) / currentLogs.length) * 100;
            
            if (nextProgress >= completionProgress) {
              return { ...log, status: 'done' };
            } else if (nextProgress >= activationProgress) {
              return { ...log, status: 'active' };
            }
            return log;
          });
        });

        // Resolve ad previews step by step
        if (nextProgress >= 33) {
          setAdResolving(prev => [true, prev[1], prev[2]]);
        }
        if (nextProgress >= 66) {
          setAdResolving(prev => [prev[0], true, prev[2]]);
        }
        if (nextProgress >= 95) {
          setAdResolving(prev => [prev[0], prev[1], true]);
        }

        if (nextProgress >= 100) {
          clearInterval(timer);
          
          const fallbackCopy: AiGeneratedCopy = {
            offerHeadline: brand.offers[0] || `Exclusive Deals at ${brand.name}`,
            offerSubtext: brand.offers[1] || `Shop the best from ${brand.name}`,
            benefitHeadline: `Why Choose ${brand.name}?`,
            benefitSubtext: `Premium quality you can trust`,
            testimonialHeadline: `What Customers Say About ${brand.name}`,
            testimonialQuote: brand.testimonials[0]?.quote || `Outstanding quality from ${brand.name}!`,
            cta: `Shop ${brand.name} Now`
          };

          const fallbackImages = {
            offerImage: brand.images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600',
            benefitImage: brand.images[1] || brand.images[0] || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600',
            testimonialImage: brand.images[2] || brand.images[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600'
          };

          setTimeout(() => {
            onComplete({
              copy: aiCopyRef.current || fallbackCopy,
              images: aiImagesRef.current || fallbackImages
            });
          }, 600);
          return 100;
        }
        return nextProgress;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090c] text-white flex flex-col justify-between p-6 relative overflow-hidden font-mono select-none text-left">
      
      {/* Mesh Glow Background */}
      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[60vw] h-[60vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[35vw] h-[35vw] rounded-full bg-primary-container/5 blur-[90px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-center gap-2.5 pt-4">
        <div className="w-8 h-8 rounded bg-[#baf91a] flex items-center justify-center text-[#07090c]">
          <BrainCircuit className="w-4.5 h-4.5" />
        </div>
        <div>
          <span className="font-manrope text-base font-extrabold tracking-tight text-white block leading-none">Epicorn AI Engine</span>
          <span className="text-[9px] font-mono tracking-widest text-[#baf91a] mt-1 block uppercase">Generative Ad Pipeline · Flux FLUX.1 & Gemini</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-6 space-y-8 z-10">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-wide font-manrope">Generating 3 Ad Variations</h2>
          <p className="text-xs text-neutral-400">Synthesizing layouts with Gemini AI copywriter and Pollinations FLUX.1 renderer</p>
        </div>

        {/* Ad Generation Previews grid */}
        <div className="w-full grid sm:grid-cols-3 gap-6 max-w-3xl">
          {[
            { title: 'Offer-Focused', desc: brand.offers[0] || 'Promo Ad' },
            { title: 'Benefit-Focused', desc: '✓ Premium ingredients' },
            { title: 'Testimonial-Focused', desc: `"Outstanding quality."` }
          ].map((ad, idx) => {
            const resolved = adResolving[idx];
            const currentImg = aiGeneratedImages[idx];
            return (
              <div 
                key={idx} 
                className={`aspect-[4/5] rounded-xl border transition-all duration-500 overflow-hidden flex flex-col justify-between p-4 relative ${
                  resolved 
                    ? 'border-emerald-500/30 bg-[#0c0d10] shadow-lg shadow-emerald-500/5' 
                    : 'border-neutral-800 bg-[#08090b]/50 opacity-40'
                }`}
              >
                {/* Generation Pulse overlay */}
                {!resolved && (
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '100% 200%' }} />
                )}

                {/* Card Header */}
                <div className="flex justify-between items-center z-10">
                  <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase font-mono">{ad.title}</span>
                  {resolved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 border-neutral-700 border-t-primary rounded-full animate-spin" />
                  )}
                </div>

                {/* Card Mock UI display */}
                {resolved ? (
                  <div className="flex-grow flex flex-col justify-between py-4 text-left z-10">
                    <img src={currentImg} alt={ad.title} className="w-full h-24 object-cover rounded-md border border-neutral-800/80 mb-3" />
                    
                    <div className="space-y-1">
                      <p 
                        className="text-[10px] font-bold leading-tight line-clamp-2"
                        style={{ color: brand.colors.primary }}
                      >
                        {brand.logoUrl || brand.name}
                      </p>
                      <p className="text-[9px] text-white font-bold leading-snug line-clamp-2 uppercase">
                        {ad.desc}
                      </p>
                    </div>

                    <div className="mt-3 py-1.5 px-3 bg-[#baf91a] text-[#07090c] rounded text-[8px] font-extrabold text-center uppercase tracking-wider">
                      Shop Now
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col justify-center items-center py-4 space-y-2 opacity-35 z-10">
                    <Image className="w-8 h-8 text-neutral-500 animate-pulse" />
                    <span className="text-[8px] tracking-widest text-neutral-500 uppercase">GENERATING AI IMAGE...</span>
                  </div>
                )}

                {/* Card Footer */}
                <div className="text-[8px] text-neutral-500 font-mono tracking-widest border-t border-neutral-900/50 pt-2 z-10">
                  {resolved ? 'Composition Completed' : 'Waiting...'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Progress Bar */}
        <div className="w-full max-w-2xl space-y-2">
          <div className="flex justify-between text-xs font-bold font-mono">
            <span className="text-neutral-400">PIPELINE PROGRESS</span>
            <span className="text-[#baf91a]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 via-[#baf91a] to-emerald-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Real-time generation log checklist */}
        <div className="w-full max-w-2xl bg-[#0b0c0e]/80 border border-neutral-800 rounded-xl p-4 space-y-2 text-xs text-neutral-400 leading-normal max-h-40 overflow-y-auto">
          {logs.map(log => (
            <div 
              key={log.id} 
              className={`flex items-center gap-3 p-1 rounded transition-colors ${
                log.status === 'active' ? 'text-[#baf91a] bg-neutral-800/30 font-bold' : 
                log.status === 'done' ? 'text-white/60' : 'opacity-35'
              }`}
            >
              <span className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                log.model === 'GEMINI' ? 'bg-blue-900/40 text-blue-300' :
                log.model === 'FLUX.1' ? 'bg-purple-900/40 text-purple-300' :
                'bg-emerald-900/40 text-emerald-300'
              }`}>
                {log.model}
              </span>
              
              <span className="flex-grow truncate">{log.text}</span>

              {log.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
              {log.status === 'active' && <div className="w-3.5 h-3.5 border-2 border-neutral-600 border-t-[#baf91a] rounded-full animate-spin flex-shrink-0" />}
              {log.status === 'pending' && <span className="text-[9px] font-mono text-neutral-600 flex-shrink-0">PENDING</span>}
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-[9px] text-neutral-500 font-mono tracking-widest pt-4 border-t border-neutral-900">
        <div className="flex items-center gap-3">
          <span>● ENGINE: V2.1.0-COMPOSE</span>
          <span>● KERNEL: V4.2.0-AI</span>
        </div>
        <div className="mt-2 sm:mt-0 font-bold text-[#baf91a]">
          <span>COMPILING BRAND: {brand.name.toUpperCase()}</span>
        </div>
      </footer>

    </div>
  );
}
