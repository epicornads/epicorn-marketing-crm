'use client';

import React, { useState } from 'react';
import { 
  Check, ArrowRight, ShieldAlert, Sparkles, Globe, Edit2, 
  Trash2, Plus, Image as ImageIcon, Type, HelpCircle, CheckCircle2 
} from 'lucide-react';
import { BrandKit } from '../types';

interface BrandReviewProps {
  brand: BrandKit;
  onGenerateAds: (updatedBrand: BrandKit) => void;
  onCancel: () => void;
}

export default function BrandReview({ brand, onGenerateAds, onCancel }: BrandReviewProps) {
  const [name, setName] = useState(brand.name);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || '');
  const [tone, setTone] = useState(brand.tone);
  const [colors, setColors] = useState({ ...brand.colors });
  const [headlineFont, setHeadlineFont] = useState(brand.fonts.headline);
  const [bodyFont, setBodyFont] = useState(brand.fonts.body);
  const [offers, setOffers] = useState([...brand.offers]);
  const [newOffer, setNewOffer] = useState('');
  const [images, setImages] = useState([...brand.images]);

  // Color selection list helper
  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleAddOffer = () => {
    if (!newOffer.trim()) return;
    setOffers(prev => [...prev, newOffer.trim()]);
    setNewOffer('');
  };

  const handleRemoveOffer = (index: number) => {
    setOffers(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndContinue = () => {
    onGenerateAds({
      name,
      websiteUrl: brand.websiteUrl,
      logoUrl: logoUrl || name,
      colors,
      fonts: {
        headline: headlineFont,
        body: bodyFont
      },
      tone,
      offers: offers.length > 0 ? offers : ['Special Launch Promotion'],
      testimonials: brand.testimonials,
      images: images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600'
      ]
    });
  };

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col p-6 text-left">
      
      {/* Step Progress Tracker */}
      <div className="max-w-6xl w-full mx-auto mb-8 flex justify-center">
        <div className="glass-panel border-white/10 px-6 py-3.5 rounded-full flex items-center gap-6 text-xs font-mono font-bold tracking-wide text-on-surface-variant">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>1. SCRAPING</span>
          </div>
          <span className="opacity-30">/</span>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px]">2</span>
            <span>2. BRAND KIT REVIEW</span>
          </div>
          <span className="opacity-30">/</span>
          <div className="flex items-center gap-2 opacity-50">
            <span className="w-5 h-5 rounded-full bg-on-surface/10 flex items-center justify-center text-[10px]">3</span>
            <span>3. AD GENERATION</span>
          </div>
        </div>
      </div>

      {/* Main Form container */}
      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-12 gap-8 items-start pb-16">
        
        {/* Left Side: Brand DNA settings */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel border-white/20 p-6 rounded-xl space-y-6">
            <div className="border-b border-on-surface/5 pb-4">
              <h2 className="text-headline-lg font-manrope font-bold text-on-surface">Review Brand DNA</h2>
              <p className="text-sm text-on-surface-variant mt-1">We extracted these guidelines from your site. Tweak them to align your designs.</p>
            </div>

            {/* Brand Basics */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface uppercase mb-1.5">Brand / App Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-on-surface/10 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface uppercase mb-1.5">Brand Logo (Text/URL)</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="e.g. ✨ Logo, or URL to image"
                  className="w-full px-4 py-2.5 rounded-lg border border-on-surface/10 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Brand Tone */}
            <div>
              <label className="block text-xs font-mono font-bold text-on-surface uppercase mb-1.5">Brand Tone & Style Description</label>
              <textarea
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-on-surface/10 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm leading-relaxed"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-mono font-bold text-on-surface uppercase mb-3">Extracted Palette Colors</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { key: 'primary', label: 'Primary Accent' },
                  { key: 'secondary', label: 'Secondary Dark' },
                  { key: 'background', label: 'Background Light' },
                  { key: 'text', label: 'Primary Text' }
                ].map(col => (
                  <div key={col.key} className="p-3 bg-on-surface/5 border border-on-surface/10 rounded-lg flex flex-col items-center space-y-2">
                    <span className="text-[10px] font-mono text-on-surface-variant font-bold">{col.label}</span>
                    <div className="relative w-full h-10 rounded-md border border-on-surface/10 overflow-hidden flex items-center justify-center">
                      <input
                        type="color"
                        value={colors[col.key as keyof typeof colors]}
                        onChange={(e) => handleColorChange(col.key as keyof typeof colors, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div 
                        className="w-full h-full" 
                        style={{ backgroundColor: colors[col.key as keyof typeof colors] }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-on-surface font-semibold">{colors[col.key as keyof typeof colors]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography selection */}
            <div>
              <label className="block text-xs font-mono font-bold text-on-surface uppercase mb-3">Extracted Font Pairing</label>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-on-surface-variant block uppercase mb-1">Headline Font</span>
                  <select 
                    value={headlineFont}
                    onChange={(e) => setHeadlineFont(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-on-surface/10 bg-white/50 focus:bg-white text-sm"
                  >
                    <option value="Manrope">Manrope (Modern Geometric)</option>
                    <option value="Outfit">Outfit (Geometric & Bold)</option>
                    <option value="Inter">Inter (Sleek Neo-grotesque)</option>
                    <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-on-surface-variant block uppercase mb-1">Body Copy Font</span>
                  <select 
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-on-surface/10 bg-white/50 focus:bg-white text-sm"
                  >
                    <option value="Hanken Grotesk">Hanken Grotesk (Clean Sans-serif)</option>
                    <option value="Inter">Inter (Highly Readable)</option>
                    <option value="Roboto">Roboto (Standard Modern)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Technical Mono)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Warning banner */}
          <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-4 flex gap-3 text-xs text-on-primary-container leading-relaxed">
            <ShieldAlert className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
            <p>
              <strong>Pro-tip:</strong> Changing the primary accent color updates the primary colors of CTA buttons, badges, and accents inside the generated marketing templates automatically.
            </p>
          </div>

        </div>

        {/* Right Side: Copywriting & Media */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Headlines / Offers Review */}
          <div className="glass-panel border-white/20 p-6 rounded-xl space-y-4">
            <h3 className="text-base font-bold font-manrope text-on-surface flex items-center gap-2">
              <Type className="w-4.5 h-4.5 text-primary" />
              <span>Extracted Copywriting & Offers</span>
            </h3>

            {/* List of Offers */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {offers.map((offer, idx) => (
                <div key={idx} className="flex gap-2 items-center p-2.5 bg-on-surface/5 border border-on-surface/10 rounded-lg text-sm group">
                  <span className="flex-grow font-semibold text-on-surface leading-tight text-left">{offer}</span>
                  <button
                    onClick={() => handleRemoveOffer(idx)}
                    className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Offer form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newOffer}
                onChange={(e) => setNewOffer(e.target.value)}
                placeholder="Add custom copywriting angle/offer..."
                className="flex-grow px-3 py-2 rounded-lg border border-on-surface/10 bg-white/30 focus:bg-white text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleAddOffer()}
              />
              <button
                type="button"
                onClick={handleAddOffer}
                className="p-2 bg-on-surface hover:bg-on-surface/90 text-white rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Images Review */}
          <div className="glass-panel border-white/20 p-6 rounded-xl space-y-4">
            <h3 className="text-base font-bold font-manrope text-on-surface flex items-center gap-2">
              <ImageIcon className="w-4.5 h-4.5 text-primary" />
              <span>Extracted Brand Images</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-on-surface/10 aspect-square bg-on-surface/5 group">
                  <img src={imgUrl} alt={`Extracted ${idx}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit/Action Button row */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 px-4 border border-on-surface/10 text-on-surface hover:bg-on-surface/5 font-semibold rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndContinue}
              className="flex-1 bg-primary hover:bg-primary-fixed-dim text-on-primary-fixed font-bold py-3.5 px-6 rounded-lg text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span>Generate 3 Ads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
