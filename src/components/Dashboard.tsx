'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, Folder, Shield, Image, Sparkles, LogOut, Plus, 
  Trash2, Edit2, ExternalLink, Globe, Play, BarChart3, TrendingUp,
  Settings2, PlusCircle, CheckCircle2, ChevronRight, HelpCircle, Upload
} from 'lucide-react';
import { BrandKit, AdProject } from '../types';
import { MOCK_BRANDS, MOCK_PROJECTS } from '../utils/mockData';

interface DashboardProps {
  user: { name: string; email: string; avatar: string };
  onLogout: () => void;
  onSelectProject: (project: AdProject) => void;
  onCreateProject: (url: string, prompt: string, uploadedFiles: File[]) => void;
}

type TabType = 'projects' | 'brandkit' | 'assets' | 'analytics';

export default function Dashboard({ user, onLogout, onSelectProject, onCreateProject }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [projects, setProjects] = useState<AdProject[]>(MOCK_PROJECTS);
  const [activeBrand, setActiveBrand] = useState<BrandKit>(MOCK_BRANDS['glow-skincare']);
  
  // New Project Form state
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onCreateProject(url, prompt, files);
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b border-on-surface/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center shadow-md shadow-primary-container/20">
            <span className="font-manrope text-base font-black text-on-primary-container">E</span>
          </div>
          <span className="font-manrope text-lg font-bold tracking-tight text-on-surface">Epicorn</span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-on-surface/5 text-on-surface rounded-full">MVP v1.0</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNewProjModal(true)}
            className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-fixed-dim text-on-primary-fixed font-bold py-2 px-4 rounded-lg shadow-md shadow-primary/10 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Ad Project</span>
          </button>

          {/* User Profile dropdown sim */}
          <div className="flex items-center gap-3 border-l border-on-surface/10 pl-4">
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-primary/20" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-on-surface leading-none">{user.name}</p>
              <p className="text-[10px] font-mono text-on-surface-variant leading-none mt-1">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-error-container/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex">
        
        {/* Sidebar */}
        <aside className="w-64 glass-panel border-r border-on-surface/5 flex flex-col p-4 space-y-6 hidden lg:flex">
          <nav className="flex-1 space-y-1.5">
            {[
              { id: 'projects', label: 'Ad Projects', icon: Folder },
              { id: 'brandkit', label: 'Brand Kit', icon: Shield },
              { id: 'assets', label: 'Assets Library', icon: Image },
              { id: 'analytics', label: 'Analytics Insights', icon: BarChart3 }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
                    isActive 
                      ? 'bg-primary-container/20 text-primary-container border-l-4 border-primary shadow-sm shadow-primary/5' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Credits Widget */}
          <div className="bg-on-surface/5 border border-on-surface/10 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-on-surface-variant">Credits Remaining</span>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xl font-bold font-manrope text-on-surface">7 / 10</span>
                <span className="text-xs font-mono text-on-surface-variant">Generations</span>
              </div>
              <div className="w-full bg-on-surface/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Reset date: July 28. Upgrade to Pro for unlimited generation credits.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-on-surface/10 flex justify-around p-2 z-20">
          {[
            { id: 'projects', label: 'Projects', icon: Folder },
            { id: 'brandkit', label: 'Brand Kit', icon: Shield },
            { id: 'assets', label: 'Assets', icon: Image },
            { id: 'analytics', label: 'Insights', icon: BarChart3 }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <main className="flex-grow p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          
          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-headline-lg font-manrope font-bold text-on-surface">My Ad Projects</h2>
                  <p className="text-sm text-on-surface-variant">View and edit your marketing campaigns</p>
                </div>
                <button
                  onClick={() => setShowNewProjModal(true)}
                  className="flex sm:hidden items-center justify-center p-2.5 bg-primary text-on-primary-fixed rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="glass-panel border-dashed border-2 border-on-surface/10 py-16 flex flex-col items-center justify-center text-center rounded-xl space-y-4">
                  <div className="w-12 h-12 bg-on-surface/5 rounded-full flex items-center justify-center text-on-surface-variant">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">No projects yet</h3>
                    <p className="text-sm text-on-surface-variant max-w-sm mt-1">
                      Paste a website URL to automatically scan a brand and generate editable static ads.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewProjModal(true)}
                    className="bg-primary hover:bg-primary-fixed-dim text-on-primary-fixed font-bold py-2.5 px-6 rounded-lg shadow-md shadow-primary/10 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Project</span>
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="glass-panel glass-card-hover rounded-xl overflow-hidden border border-on-surface/10 flex flex-col cursor-pointer group"
                    >
                      {/* Image Preview / Banner */}
                      <div className="h-44 bg-on-surface/5 relative overflow-hidden flex items-center justify-center">
                        <img 
                          src={project.brand.images[0]} 
                          alt={project.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm shadow-sm py-1 px-2.5 rounded-full text-[10px] font-bold text-on-surface flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          <span>{project.brand.name}</span>
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-5 flex-grow space-y-4 text-left">
                        <div className="space-y-1">
                          <h3 className="font-manrope font-bold text-base text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate">{project.brand.websiteUrl}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono border-t border-on-surface/5 pt-4">
                          <div className="text-on-surface-variant">
                            <span>Created: </span>
                            <span className="font-bold text-on-surface">{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => deleteProject(project.id, e)}
                              className="text-on-surface-variant hover:text-error p-1 rounded-md hover:bg-error-container/10 transition-all"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-primary font-bold flex items-center gap-0.5">
                              <span>Edit</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BRAND KIT */}
          {activeTab === 'brandkit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-headline-lg font-manrope font-bold text-on-surface">Brand Kit Memory</h2>
                <p className="text-sm text-on-surface-variant">Manage logos, palettes, fonts, and core copy guidelines</p>
              </div>

              <div className="grid md:grid-cols-12 gap-8">
                {/* Left Column: Brand Identity details */}
                <div className="md:col-span-8 space-y-6">
                  {/* Brand Basic Card */}
                  <div className="glass-panel p-6 rounded-xl border border-on-surface/5 space-y-6 text-left">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold font-manrope text-on-surface flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span>Identity Profile</span>
                      </h3>
                      <button className="text-xs font-mono text-primary font-bold hover:underline flex items-center gap-1">
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Kit</span>
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wide uppercase text-on-surface-variant mb-1">Brand Name</label>
                        <div className="p-3 bg-on-surface/5 border border-on-surface/10 rounded-lg text-sm font-semibold">{activeBrand.name}</div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wide uppercase text-on-surface-variant mb-1">Website URL</label>
                        <div className="p-3 bg-on-surface/5 border border-on-surface/10 rounded-lg text-sm font-semibold flex items-center justify-between">
                          <span className="truncate">{activeBrand.websiteUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wide uppercase text-on-surface-variant mb-1">Brand Tone of Voice</label>
                      <div className="p-3 bg-on-surface/5 border border-on-surface/10 rounded-lg text-sm">{activeBrand.tone}</div>
                    </div>
                  </div>

                  {/* Copywriting & Offers Card */}
                  <div className="glass-panel p-6 rounded-xl border border-on-surface/5 space-y-4 text-left">
                    <h3 className="text-base font-bold font-manrope text-on-surface flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Extracted Headlines & Offers</span>
                    </h3>
                    <div className="space-y-2">
                      {activeBrand.offers.map((offer, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3 bg-on-surface/5 border border-on-surface/10 rounded-lg text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-[10px] font-mono flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-on-surface leading-snug">{offer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Colors & Fonts */}
                <div className="md:col-span-4 space-y-6">
                  {/* Colors Card */}
                  <div className="glass-panel p-6 rounded-xl border border-on-surface/5 space-y-4 text-left">
                    <h3 className="text-base font-bold font-manrope text-on-surface">Extracted Colors</h3>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Primary Accent', hex: activeBrand.colors.primary, role: 'Buttons & Highlights' },
                        { label: 'Secondary Dark', hex: activeBrand.colors.secondary, role: 'Secondary elements' },
                        { label: 'Tertiary Mid', hex: activeBrand.colors.tertiary, role: 'Muted borders' },
                        { label: 'Background Light', hex: activeBrand.colors.background, role: 'Canvas canvas' },
                      ].map((colorItem, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-on-surface/5 border border-on-surface/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md border border-on-surface/10" style={{ backgroundColor: colorItem.hex }} />
                            <div className="text-left">
                              <p className="text-xs font-bold text-on-surface">{colorItem.label}</p>
                              <p className="text-[10px] font-mono text-on-surface-variant">{colorItem.hex}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono bg-on-surface/10 text-on-surface px-1.5 py-0.5 rounded-full uppercase">
                            {colorItem.hex}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fonts Card */}
                  <div className="glass-panel p-6 rounded-xl border border-on-surface/5 space-y-4 text-left">
                    <h3 className="text-base font-bold font-manrope text-on-surface">Extracted Fonts</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-on-surface-variant block uppercase mb-1">Headline Font</span>
                        <div className="p-3 bg-on-surface/5 border border-on-surface/10 rounded-lg font-manrope font-bold text-sm">
                          {activeBrand.fonts.headline} (Manrope)
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-on-surface-variant block uppercase mb-1">Body Font</span>
                        <div className="p-3 bg-on-surface/5 border border-on-surface/10 rounded-lg font-sans text-sm">
                          {activeBrand.fonts.body} (Hanken Grotesk)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-headline-lg font-manrope font-bold text-on-surface">Brand Asset Library</h2>
                  <p className="text-sm text-on-surface-variant">Extracted and uploaded media used in generating creatives</p>
                </div>
                <button className="flex items-center gap-2 bg-on-surface hover:bg-on-surface/90 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Media</span>
                </button>
              </div>

              {/* Grid of Images */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeBrand.images.map((imgUrl, idx) => (
                  <div key={idx} className="glass-panel border border-on-surface/10 rounded-xl overflow-hidden group relative">
                    <div className="h-48 bg-on-surface/5 flex items-center justify-center overflow-hidden">
                      <img src={imgUrl} alt={`Brand Media ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3 bg-white border-t border-on-surface/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-on-surface-variant">extracted_img_{idx + 1}.jpg</span>
                      <button className="text-on-surface-variant hover:text-error transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-headline-lg font-manrope font-bold text-on-surface">Campaign Performance Insights</h2>
                <p className="text-sm text-on-surface-variant font-hanken">Analytical report of exported and active marketing creatives</p>
              </div>

              {/* Core Analytics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Exports', value: '42', change: '+12%', sub: 'this month', icon: Play },
                  { label: 'Export Rate', value: '87.5%', change: '+5.4%', sub: 'vs last week', icon: TrendingUp },
                  { label: 'Saves Rate', value: '94.2%', change: '+1.2%', sub: 'conversion', icon: CheckCircle2 },
                  { label: 'Active Brands', value: '3', change: 'Max Limit', sub: 'MVP License', icon: Globe }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="glass-panel p-5 border border-on-surface/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-on-surface-variant">
                        <span className="text-[10px] font-mono font-bold tracking-wide uppercase">{stat.label}</span>
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-manrope text-on-surface">{stat.value}</span>
                        <span className="text-[10px] font-mono text-primary font-bold bg-primary-container/20 px-1.5 py-0.5 rounded-full">{stat.change}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-mono">{stat.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chart simulation / detailed table */}
              <div className="glass-panel p-6 border border-on-surface/5 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold font-manrope text-on-surface">Creative Export Activity</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary rounded-full" /> Instagram</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-secondary rounded-full" /> Facebook</span>
                  </div>
                </div>

                <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
                  {[40, 25, 60, 45, 80, 55, 90, 70, 85, 60, 95, 110].map((height, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-on-surface/5 rounded-t-sm h-full flex items-end">
                        <div 
                          className="w-full bg-primary hover:bg-primary-container rounded-t-sm transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-on-surface-variant">{['J','F','M','A','M','J','J','A','S','O','N','D'][idx]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* NEW PROJECT MODAL */}
      {showNewProjModal && (
        <div className="fixed inset-0 bg-on-surface/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border-white/20 p-6 rounded-xl w-full max-w-xl relative text-left shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-headline-lg font-manrope font-bold text-on-surface">Start New Ad Project</h3>
                <p className="text-sm text-on-surface-variant">Convert your website URL into on-brand campaigns in under a minute</p>
              </div>
              <button
                onClick={() => {
                  setShowNewProjModal(false);
                  setUrl('');
                  setPrompt('');
                  setFiles([]);
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-on-surface/5 transition-all"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Website URL */}
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface uppercase mb-1.5 flex items-center gap-1">
                  <span>Website Homepage URL</span>
                  <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-on-surface/10 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Optional Prompt */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="block text-xs font-mono font-bold text-on-surface uppercase">Design Prompt / Instructions</label>
                  <span className="text-[10px] font-mono text-on-surface-variant">Optional</span>
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 'Create a Diwali campaign', 'Make it look premium and minimalist'"
                  className="w-full px-4 py-3 rounded-lg border border-on-surface/10 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Optional File Uploads */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="block text-xs font-mono font-bold text-on-surface uppercase">Upload Specific Assets</label>
                  <span className="text-[10px] font-mono text-on-surface-variant">Optional (Logo, Product Photos)</span>
                </div>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    dragActive 
                      ? 'border-primary bg-primary-container/10' 
                      : 'border-on-surface/10 hover:border-primary bg-white/30'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                    <div className="w-10 h-10 bg-on-surface/5 rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Drag and drop assets, or <span className="text-primary hover:underline">browse</span></p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Supports PNG, JPG, or SVG up to 5MB</p>
                    </div>
                  </label>
                </div>

                {/* Uploaded Files list */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-24 overflow-y-auto">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-on-surface/5 rounded-lg text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Image className="w-3.5 h-3.5 text-on-surface-variant" />
                          <span className="truncate font-semibold">{file.name}</span>
                          <span className="text-[9px] font-mono text-on-surface-variant">({(file.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-on-surface-variant hover:text-error transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProjModal(false);
                    setUrl('');
                    setPrompt('');
                    setFiles([]);
                  }}
                  className="flex-1 py-3 px-4 border border-on-surface/10 text-on-surface hover:bg-on-surface/5 font-semibold rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-fixed-dim text-on-primary-fixed font-bold py-3 px-4 rounded-lg text-sm transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan and Extract Brand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
