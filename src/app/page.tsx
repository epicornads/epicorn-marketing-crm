'use client';

import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import ScraperLoading from '../components/ScraperLoading';
import BrandReview from '../components/BrandReview';
import CanvaEditor from '../components/CanvaEditor';
import AdGeneratorLoading, { AiGeneratedAssets } from '../components/AdGeneratorLoading';
import { AdProject, BrandKit } from '../types';
import { MOCK_BRANDS } from '../utils/mockData';

type ViewState = 'landing' | 'dashboard' | 'scanning' | 'review' | 'generating' | 'editor';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  
  // Scanning state
  const [scrapingUrl, setScrapingUrl] = useState('');
  const [scrapingPrompt, setScrapingPrompt] = useState('');
  
  // Brand / Project state
  const [extractedBrand, setExtractedBrand] = useState<BrandKit | null>(null);
  const [activeProject, setActiveProject] = useState<AdProject | null>(null);

  // AUTH ACTIONS
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  // DASHBOARD ACTIONS
  const handleCreateProject = (url: string, prompt: string) => {
    setScrapingUrl(url);
    setScrapingPrompt(prompt);
    setCurrentView('scanning');
  };

  const handleSelectProject = (project: AdProject) => {
    setActiveProject(project);
    setCurrentView('editor');
  };

  // SCRAPER COMPLETE ACTIONS
  const handleScrapeComplete = (brandResult: string | BrandKit) => {
    let brandData: BrandKit;
    
    if (typeof brandResult === 'string') {
      // It matched one of our pre-built mock brands
      brandData = MOCK_BRANDS[brandResult];
    } else {
      // It is a dynamically generated brand kit
      brandData = brandResult;
    }

    setExtractedBrand(brandData);
    setCurrentView('review');
  };

  // BRAND REVIEW COMPLETE ACTIONS
  const handleGenerateAds = (updatedBrand: BrandKit) => {
    // Construct a brand new project containing empty layouts
    const newProject: AdProject = {
      id: `proj-${Date.now()}`,
      name: `${updatedBrand.name} Campaign`,
      brand: updatedBrand,
      activePlatform: 'instagram-post',
      selectedTemplateIndex: 0,
      ads: {
        'instagram-post': [],
        'instagram-story': [],
        'instagram-square': [],
        'facebook-feed': [],
        'linkedin-post': []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Apply optional prompt tweaks into copy if needed
    if (scrapingPrompt) {
      newProject.name = `${updatedBrand.name} (${scrapingPrompt})`;
      
      // Let's modify the first offer to reflect prompt customization
      const lowerPrompt = scrapingPrompt.toLowerCase();
      if (lowerPrompt.includes('diwali')) {
        newProject.brand.offers[0] = '🎇 Celebrate Diwali: Special 20% OFF! 🎇';
      } else if (lowerPrompt.includes('christmas')) {
        newProject.brand.offers[0] = '🎄 Christmas Sale: Buy 1 Get 1 Free! 🎄';
      } else if (lowerPrompt.includes('premium') || lowerPrompt.includes('luxury')) {
        newProject.brand.offers[0] = '✨ Premium Collection: Exclusive Access ✨';
      }
    }

    setActiveProject(newProject);
    setCurrentView('generating');
  };

  // EDITOR SAVE ACTIONS
  const handleEditorSave = (updatedProject: AdProject) => {
    // In a live system, this would write to Postgres/Supabase.
    // For our high fidelity local prototype, we can trigger success feedback and navigate back.
    console.log('Project Saved successfully:', updatedProject);
    
    // We can show alert/toast and back
    alert('Project saved successfully to dashboard!');
    setCurrentView('dashboard');
  };

  // Handle direct brand analysis from landing screen
  const handleAnalyzeBrand = (url: string) => {
    if (!user) {
      setUser({
        name: 'Kamal Kishor',
        email: 'kamal@epicorn.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'
      });
    }
    setScrapingUrl(url);
    setScrapingPrompt(''); // default prompt is empty
    setCurrentView('scanning');
  };

  const handleGoToDashboard = () => {
    if (!user) {
      setUser({
        name: 'Kamal Kishor',
        email: 'kamal@epicorn.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'
      });
    }
    setCurrentView('dashboard');
  };

  return (
    <div className="flex-1 flex flex-col">
      {currentView === 'landing' && (
        <LandingPage 
          onAnalyzeBrand={handleAnalyzeBrand} 
          onGoToDashboard={handleGoToDashboard} 
        />
      )}
      
      {currentView === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
        />
      )}

      {currentView === 'scanning' && (
        <ScraperLoading 
          url={scrapingUrl} 
          onScrapeComplete={handleScrapeComplete} 
        />
      )}

      {currentView === 'review' && extractedBrand && (
        <BrandReview 
          brand={extractedBrand}
          onGenerateAds={handleGenerateAds}
          onCancel={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'generating' && activeProject && (
        <AdGeneratorLoading 
          brand={activeProject.brand} 
          onComplete={(assets: AiGeneratedAssets) => {
            // Inject AI-generated copy and images into the brand kit
            setActiveProject(prev => {
              if (!prev) return prev;
              const updatedBrand = { ...prev.brand };
              updatedBrand.offers = [
                assets.copy.offerHeadline,
                assets.copy.benefitHeadline,
                assets.copy.offerSubtext,
                ...updatedBrand.offers.slice(3)
              ].filter(Boolean);

              // Prepend generated AI images to brand.images array
              updatedBrand.images = [
                assets.images.offerImage,
                assets.images.benefitImage,
                assets.images.testimonialImage,
                ...updatedBrand.images
              ].filter(Boolean);

              return { ...prev, brand: updatedBrand };
            });
            setCurrentView('editor');
          }} 
        />
      )}

      {currentView === 'editor' && activeProject && (
        <CanvaEditor 
          project={activeProject}
          onSave={handleEditorSave}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
    </div>
  );
}

