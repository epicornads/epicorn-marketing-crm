'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Download, Save, Grid, Image as ImageIcon, Type, Square,
  Layers, Palette, Maximize2, Trash2, Bold, Italic, AlignLeft, 
  AlignCenter, AlignRight, RefreshCw, Sparkles, Check, ChevronDown, 
  Folder, Plus, Undo2
} from 'lucide-react';
import { BrandKit, PlatformType, PLATFORMS, CanvasElement, AdProject } from '../types';
import { generateAdElements } from '../utils/templateGenerator';
import html2canvas from 'html2canvas';

interface CanvaEditorProps {
  project: AdProject;
  onSave: (updatedProject: AdProject) => void;
  onBack: () => void;
}

type EditorSidebarTab = 'templates' | 'text' | 'images' | 'elements' | 'brandkit' | 'layers';

export default function CanvaEditor({ project, onSave, onBack }: CanvaEditorProps) {
  const [activeProject, setActiveProject] = useState<AdProject>({ ...project });
  const [sidebarTab, setSidebarTab] = useState<EditorSidebarTab>('templates');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(project.selectedTemplateIndex);
  const [activePlatform, setActivePlatform] = useState<PlatformType>(project.activePlatform);
  
  // Drag and resize active tracking states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'se' | 's' | 'e' | 'nw'>('se');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] = useState<CanvasElement | null>(null);
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<CanvasElement[][]>([]);

  // Text AI Regeneration states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // References for Canvas scaling
  const canvasRef = useRef<HTMLDivElement>(null);
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  // Download Dropdown State & Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);

  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDownloadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const activePlatformConfig = PLATFORMS[activePlatform];

  // Retrieve current elements list for the active platform
  const elements: CanvasElement[] = activeProject.ads[activePlatform] && activeProject.ads[activePlatform].length > 0
    ? activeProject.ads[activePlatform]
    : generateAdElements(activeProject.brand, activePlatform, activeTemplateIdx);

  const setElements = (newElements: CanvasElement[]) => {
    // Save to history for undo if needed
    setHistory(prev => [...prev, elements]);
    setActiveProject(prev => ({
      ...prev,
      ads: {
        ...prev.ads,
        [activePlatform]: newElements
      }
    }));
  };

  // Synchronize elements when template or platform changes
  useEffect(() => {
    if (!activeProject.ads[activePlatform] || activeProject.ads[activePlatform].length === 0) {
      const generated = generateAdElements(activeProject.brand, activePlatform, activeTemplateIdx);
      setActiveProject(prev => ({
        ...prev,
        ads: {
          ...prev.ads,
          [activePlatform]: generated
        }
      }));
    }
  }, [activePlatform, activeTemplateIdx]);

  // Adjust canvas scaling to fit editor workspace
  useEffect(() => {
    const handleResize = () => {
      if (!editorAreaRef.current || !canvasRef.current) return;
      const workspaceW = editorAreaRef.current.clientWidth - 80;
      const workspaceH = editorAreaRef.current.clientHeight - 80;
      const canvasW = activePlatformConfig.width;
      const canvasH = activePlatformConfig.height;

      const scaleW = workspaceW / canvasW;
      const scaleH = workspaceH / canvasH;
      const scale = Math.min(scaleW, scaleH, 1); // Max scale 100%
      setCanvasScale(scale);
    };

    window.addEventListener('resize', handleResize);
    // Short timeout to let layout settle
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [activePlatform]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElementId(null);
    }
  };

  const getSelectedElement = (): CanvasElement | null => {
    if (!selectedElementId) return null;
    return elements.find(el => el.id === selectedElementId) || null;
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setElements(elements.map(el => el.id === selectedElementId ? { ...el, ...updates } : el));
  };

  // DRAG & RESIZE MOUSE HANDLERS (Client-side relative scaling)
  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    setSelectedElementId(element.id);
    setIsDragging(true);
    
    // Get mouse coordinates relative to the canvas
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / canvasScale;
    const mouseY = (e.clientY - rect.top) / canvasScale;

    // Element top-left corner in canvas pixels
    const elPixelX = (element.x / 100) * activePlatformConfig.width;
    const elPixelY = (element.y / 100) * activePlatformConfig.height;

    setDragOffset({
      x: mouseX - elPixelX,
      y: mouseY - elPixelY
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: 'se' | 's' | 'e' | 'nw', element: CanvasElement) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setInitialElementState({ ...element });
    setInitialMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedElementId) return;
    const element = getSelectedElement();
    if (!element) return;

    const canvasWidth = activePlatformConfig.width;
    const canvasHeight = activePlatformConfig.height;

    if (isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / canvasScale;
      const mouseY = (e.clientY - rect.top) / canvasScale;

      // Calculate new position in pixels, then convert back to percentage (0-100)
      let newPixelX = mouseX - dragOffset.x;
      let newPixelY = mouseY - dragOffset.y;

      // Constrain position boundaries
      newPixelX = Math.max(0, Math.min(canvasWidth - (element.width / 100) * canvasWidth, newPixelX));
      newPixelY = Math.max(0, Math.min(canvasHeight - (element.height / 100) * canvasHeight, newPixelY));

      updateSelectedElement({
        x: (newPixelX / canvasWidth) * 100,
        y: (newPixelY / canvasHeight) * 100
      });
    }

    if (isResizing && initialElementState && initialMousePosition) {
      const deltaX = (e.clientX - initialMousePosition.x) / canvasScale;
      const deltaY = (e.clientY - initialMousePosition.y) / canvasScale;

      // Dimensions in canvas pixels
      const initPixelW = (initialElementState.width / 100) * canvasWidth;
      const initPixelH = (initialElementState.height / 100) * canvasHeight;

      let newPixelW = initPixelW;
      let newPixelH = initPixelH;

      if (resizeDirection === 'e' || resizeDirection === 'se') {
        newPixelW = Math.max(20, initPixelW + deltaX);
      }
      if (resizeDirection === 's' || resizeDirection === 'se') {
        newPixelH = Math.max(20, initPixelH + deltaY);
      }

      // Convert back to percentages
      updateSelectedElement({
        width: (newPixelW / canvasWidth) * 100,
        height: (newPixelH / canvasHeight) * 100
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setInitialElementState(null);
  };

  // ADD NEW ELEMENTS
  const addTextElement = (size: 'heading' | 'subheading' | 'body') => {
    const fontSizeMap = { heading: 32, subheading: 20, body: 14 };
    const contentMap = { heading: 'Add Heading Text', subheading: 'Add Subheading Text', body: 'Add body content here' };
    
    const newEl: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 25,
      y: 40,
      width: 50,
      height: 10,
      content: contentMap[size],
      fontSize: fontSizeMap[size],
      fontWeight: size === 'heading' ? 'bold' : 'normal',
      color: activeProject.brand.colors.text || '#000000',
      align: 'center',
      zIndex: elements.length + 1,
      fontFamily: size === 'heading' ? activeProject.brand.fonts.headline : activeProject.brand.fonts.body
    };

    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const addShapeElement = (shapeType: 'rectangle' | 'circle' | 'badge') => {
    const newEl: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 35,
      y: 35,
      width: 30,
      height: 15,
      content: shapeType,
      backgroundColor: activeProject.brand.colors.primary || '#baf91a',
      borderRadius: shapeType === 'circle' ? 9999 : shapeType === 'badge' ? 12 : 0,
      zIndex: elements.length + 1
    };

    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    setElements(elements.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  // LAYER RE-ORDERING
  const moveLayer = (direction: 'front' | 'back') => {
    const el = getSelectedElement();
    if (!el) return;

    let sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex(item => item.id === el.id);

    if (direction === 'front' && idx < sorted.length - 1) {
      // Swap zIndex
      const temp = sorted[idx].zIndex;
      sorted[idx].zIndex = sorted[idx + 1].zIndex;
      sorted[idx + 1].zIndex = temp;
    } else if (direction === 'back' && idx > 0) {
      // Swap zIndex
      const temp = sorted[idx].zIndex;
      sorted[idx].zIndex = sorted[idx - 1].zIndex;
      sorted[idx - 1].zIndex = temp;
    }

    setElements(sorted);
  };

  // TEXT AI REGENERATION (calls Gemini via /api/generate)
  const handleRegenerateText = async () => {
    const el = getSelectedElement();
    if (!el || el.type !== 'text') return;

    setIsRegenerating(true);

    try {
      const fullPrompt = aiPrompt
        ? `Rewrite this ad text: "${el.content}". Direction: ${aiPrompt}`
        : `Rewrite this ad text to be more compelling and action-oriented: "${el.content}"`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          brandName: activeProject.brand.name,
          brandTone: activeProject.brand.tone,
          mode: 'rewrite'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          updateSelectedElement({ content: data.text });
        }
      }
    } catch (err) {
      console.error('AI text regeneration failed:', err);
    } finally {
      setIsRegenerating(false);
      setAiPrompt('');
    }
  };

  // EXPORT ENGINE (html2canvas)
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');

  const exportAd = (format: 'png' | 'jpg' | 'pdf') => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    setSelectedElementId(null); // Clear borders

    // Wait a brief tick for render
    setTimeout(() => {
      html2canvas(canvasRef.current!, {
        width: activePlatformConfig.width,
        height: activePlatformConfig.height,
        scale: 1, // Render at exact platform width/height resolution
        useCORS: true,
        allowTaint: false, // Must be false for toDataURL export to succeed
        backgroundColor: null
      }).then(canvas => {
        const link = document.createElement('a');
        
        if (format === 'pdf') {
          // Simplistic PDF export
          const imgData = canvas.toDataURL('image/png');
          link.download = `${activeProject.name}_${activePlatform}.png`;
          link.href = imgData;
          link.click();
        } else {
          const fileType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          link.download = `${activeProject.name}_${activePlatform}.${format}`;
          link.href = canvas.toDataURL(fileType, 1.0);
          link.click();
        }
        setIsExporting(false);
      }).catch(err => {
        console.error('Failed export:', err);
        setIsExporting(false);
      });
    }, 200);
  };

  const handleSave = () => {
    // Fill in default elements for any platform that has not been explicitly saved
    const finalAds = { ...activeProject.ads };
    (Object.keys(PLATFORMS) as PlatformType[]).forEach(plat => {
      if (!finalAds[plat] || finalAds[plat].length === 0) {
        finalAds[plat] = generateAdElements(activeProject.brand, plat, activeTemplateIdx);
      }
    });

    onSave({
      ...activeProject,
      ads: finalAds
    });
  };

  return (
    <div 
      className="h-screen bg-on-surface flex flex-col select-none text-left"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Editor Header */}
      <header className="bg-on-surface border-b border-white/10 px-4 py-3 flex items-center justify-between text-white z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-white/10" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-manrope text-sm font-bold truncate max-w-[180px]">{activeProject.name}</span>
              <span className="text-[10px] font-mono bg-white/10 text-white/80 py-0.5 px-2 rounded-full uppercase">
                {activePlatformConfig.name}
              </span>
            </div>
            <p className="text-[10px] text-white/50 leading-none mt-1">Scale: {Math.round(canvasScale * 100)}%</p>
          </div>
        </div>

        {/* Platform selection slider */}
        <div className="hidden md:flex items-center bg-white/5 border border-white/10 p-1 rounded-lg">
          {(Object.keys(PLATFORMS) as PlatformType[]).map(platKey => {
            const isActive = activePlatform === platKey;
            return (
              <button
                key={platKey}
                onClick={() => {
                  setSelectedElementId(null);
                  setActivePlatform(platKey);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold font-mono transition-all ${
                  isActive ? 'bg-primary-container text-on-primary-container' : 'text-white/60 hover:text-white'
                }`}
              >
                {PLATFORMS[platKey].name.split(' ')[1] || PLATFORMS[platKey].name}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Undo */}
          {history.length > 0 && (
            <button
              onClick={() => {
                const prev = history[history.length - 1];
                setHistory(history.slice(0, -1));
                setActiveProject(prevProj => ({
                  ...prevProj,
                  ads: { ...prevProj.ads, [activePlatform]: prev }
                }));
              }}
              className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-all"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Project</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDownloadDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-fixed-dim text-on-primary-fixed font-bold rounded-lg text-sm transition-all shadow-md shadow-primary/10"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 z-40 block">
                <button 
                  onClick={() => {
                    exportAd('png');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Download PNG (High-Res)
                </button>
                <button 
                  onClick={() => {
                    exportAd('jpg');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Download JPG (Small size)
                </button>
                <button 
                  onClick={() => {
                    exportAd('pdf');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Download PDF (Print)
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Editor Body Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Toolbar Tabs selection */}
        <div className="w-20 bg-neutral-950 border-r border-white/10 flex flex-col items-center py-4 space-y-4">
          {[
            { id: 'templates', label: 'Angles', icon: Grid },
            { id: 'text', label: 'Add Text', icon: Type },
            { id: 'images', label: 'Images', icon: ImageIcon },
            { id: 'elements', label: 'Shapes', icon: Square },
            { id: 'brandkit', label: 'Brand Kit', icon: Palette },
            { id: 'layers', label: 'Layers', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = sidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id as EditorSidebarTab)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors w-16 ${
                  isActive ? 'bg-white/10 text-primary-container' : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-mono leading-none tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Left Toolbar Detail Panel */}
        <div className="w-80 bg-neutral-900 border-r border-white/10 text-white flex flex-col overflow-y-auto">
          
          {/* Tab 1: Templates (Marketing Angles) */}
          {sidebarTab === 'templates' && (
            <div className="p-4 space-y-4">
              <h3 className="font-manrope font-bold text-sm">Marketing Angles</h3>
              <p className="text-xs text-white/50">Switch layout angle. Caution: this overrides current modifications on active canvas.</p>
              
              <div className="space-y-3">
                {[
                  { idx: 0, title: 'Offer-Focused', desc: 'Emphasize sales, discounts, and clear action' },
                  { idx: 1, title: 'Benefit-Focused', desc: 'Highlights core product values and checkboxes' },
                  { idx: 2, title: 'Testimonial-Focused', desc: 'Displays social reviews, star ratings, and trust' }
                ].map(tmpl => {
                  const isActive = activeTemplateIdx === tmpl.idx;
                  return (
                    <button
                      key={tmpl.idx}
                      onClick={() => {
                        setActiveTemplateIdx(tmpl.idx);
                        setSelectedElementId(null);
                        const generated = generateAdElements(activeProject.brand, activePlatform, tmpl.idx);
                        setElements(generated);
                      }}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        isActive 
                          ? 'border-primary bg-primary-container/10' 
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <h4 className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-white'}`}>{tmpl.title}</h4>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">{tmpl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Add Text */}
          {sidebarTab === 'text' && (
            <div className="p-4 space-y-4">
              <h3 className="font-manrope font-bold text-sm">Add Text Layer</h3>
              <p className="text-xs text-white/50">Click below to place new customizable text on active canvas.</p>

              <div className="space-y-2">
                <button
                  onClick={() => addTextElement('heading')}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left font-manrope font-bold text-base border border-white/15"
                >
                  Add Heading
                </button>
                <button
                  onClick={() => addTextElement('subheading')}
                  className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left font-sans font-semibold text-sm border border-white/15"
                >
                  Add Subheading
                </button>
                <button
                  onClick={() => addTextElement('body')}
                  className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left font-sans text-xs border border-white/15 text-white/70"
                >
                  Add Body copy
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Images */}
          {sidebarTab === 'images' && (
            <div className="p-4 space-y-4">
              <h3 className="font-manrope font-bold text-sm">Images Library</h3>
              <p className="text-xs text-white/50">Click to replace the active selected image frame, or add new image.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {activeProject.brand.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const sel = getSelectedElement();
                      if (sel && sel.type === 'image') {
                        updateSelectedElement({ content: imgUrl });
                      } else {
                        // Add as new image element
                        const newEl: CanvasElement = {
                          id: `img-${Date.now()}`,
                          type: 'image',
                          x: 20,
                          y: 20,
                          width: 40,
                          height: 40,
                          content: imgUrl,
                          zIndex: elements.length + 1
                        };
                        setElements([...elements, newEl]);
                        setSelectedElementId(newEl.id);
                      }
                    }}
                    className="rounded-lg overflow-hidden aspect-square border border-white/10 hover:border-white/30 bg-white/5 flex items-center justify-center relative group"
                  >
                    <img src={imgUrl} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity">
                      APPLY
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Shapes */}
          {sidebarTab === 'elements' && (
            <div className="p-4 space-y-4">
              <h3 className="font-manrope font-bold text-sm">Add Shapes</h3>
              <p className="text-xs text-white/50">Place vector shapes onto the layout to serve as badges or backgrounds.</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addShapeElement('rectangle')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center gap-2 border border-white/10 text-xs font-semibold"
                >
                  <div className="w-8 h-6 bg-white/60 rounded-sm" />
                  Rectangle
                </button>
                <button
                  onClick={() => addShapeElement('circle')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center gap-2 border border-white/10 text-xs font-semibold"
                >
                  <div className="w-8 h-8 bg-white/60 rounded-full" />
                  Circle
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Brand Kit colors shortcut */}
          {sidebarTab === 'brandkit' && (
            <div className="p-4 space-y-4">
              <h3 className="font-manrope font-bold text-sm">Quick Brand Kit</h3>
              <p className="text-xs text-white/50">Instantly apply a color swatch to the currently selected item.</p>

              <div className="space-y-4">
                {/* Brand Colors list */}
                <div>
                  <span className="text-[10px] font-mono text-white/40 block uppercase mb-2">Swatches</span>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.values(activeProject.brand.colors).map((hex, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const sel = getSelectedElement();
                          if (!sel) return;
                          if (sel.type === 'text' || sel.type === 'logo') {
                            updateSelectedElement({ color: hex });
                          } else if (sel.type === 'shape' || sel.type === 'button') {
                            updateSelectedElement({ backgroundColor: hex });
                          }
                        }}
                        className="w-10 h-10 rounded border border-white/15 hover:scale-105 transition-transform"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                {/* Brand Fonts list */}
                <div>
                  <span className="text-[10px] font-mono text-white/40 block uppercase mb-2">Brand Fonts</span>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        updateSelectedElement({ fontFamily: activeProject.brand.fonts.headline });
                      }}
                      className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left text-xs font-bold"
                    >
                      Use Headline Font ({activeProject.brand.fonts.headline})
                    </button>
                    <button
                      onClick={() => {
                        updateSelectedElement({ fontFamily: activeProject.brand.fonts.body });
                      }}
                      className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left text-xs"
                    >
                      Use Body Font ({activeProject.brand.fonts.body})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Layer Manager */}
          {sidebarTab === 'layers' && (
            <div className="p-4 space-y-4">
              <h3 className="font-manrope font-bold text-sm">Layers Manager</h3>
              <p className="text-xs text-white/50">Arrange ordering stack of layers on current workspace.</p>

              <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                {elements.map(el => {
                  const isSelected = selectedElementId === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer ${
                        isSelected ? 'bg-primary text-on-primary-fixed' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="capitalize font-semibold truncate max-w-[120px]">{el.type} - {el.id.split('-')[0]}</span>
                      <span className="text-[9px] font-mono opacity-50">z-index: {el.zIndex}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Central Canvas Workspace */}
        <div 
          ref={editorAreaRef}
          className="flex-grow bg-neutral-950 flex items-center justify-center p-8 overflow-hidden relative"
          onClick={handleCanvasClick}
        >
          {/* Main Drawing Area */}
          <div
            ref={canvasRef}
            className="shadow-2xl relative select-none overflow-hidden transition-all bg-white"
            onClick={handleCanvasClick}
            style={{
              width: activePlatformConfig.width,
              height: activePlatformConfig.height,
              transform: `scale(${canvasScale})`,
              transformOrigin: 'center center',
              flexShrink: 0
            }}
          >
            {/* Draw elements relative */}
            {elements
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(el => {
                const isSelected = selectedElementId === el.id && !isExporting;
                
                // Position formulas
                const elementStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  zIndex: el.zIndex,
                };

                return (
                  <div
                    key={el.id}
                    className={`group ${isSelected ? 'outline outline-2 outline-primary outline-offset-1' : ''}`}
                    style={elementStyle}
                    onMouseDown={(e) => handleElementMouseDown(e, el)}
                  >
                    {/* Render specific component block based on elements type */}
                    
                    {/* TYPE: TEXT & LOGO */}
                    {(el.type === 'text' || el.type === 'logo') && (
                      <div
                        className="w-full h-full flex flex-col justify-center leading-normal select-text break-words overflow-hidden"
                        style={{
                          fontSize: el.fontSize ? `${el.fontSize}px` : '16px',
                          color: el.color || '#000000',
                          fontFamily: el.fontFamily || 'sans-serif',
                          fontWeight: el.fontWeight || 'normal',
                          fontStyle: el.fontStyle || 'normal',
                          textAlign: el.align || 'center',
                          whiteSpace: 'pre-wrap',
                          // Highlight logo text style specifically if needed
                          letterSpacing: el.type === 'logo' ? '0.08em' : 'normal',
                        }}
                      >
                        {el.content}
                      </div>
                    )}

                    {/* TYPE: IMAGE */}
                    {el.type === 'image' && (
                      <img 
                        src={el.content} 
                        alt="Canvas Item" 
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                          borderRadius: el.borderRadius ? `${el.borderRadius}px` : '0px'
                        }}
                      />
                    )}

                    {/* TYPE: SHAPE */}
                    {el.type === 'shape' && (
                      <div 
                        className="w-full h-full"
                        style={{
                          backgroundColor: el.backgroundColor || '#cccccc',
                          borderRadius: el.borderRadius ? `${el.borderRadius}px` : '0px',
                          border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000'}` : 'none'
                        }}
                      />
                    )}

                    {/* TYPE: BUTTON */}
                    {el.type === 'button' && (
                      <div 
                        className="w-full h-full flex items-center justify-center text-center font-bold overflow-hidden"
                        style={{
                          backgroundColor: el.backgroundColor || '#000',
                          color: el.color || '#fff',
                          borderRadius: el.borderRadius ? `${el.borderRadius}px` : '4px',
                          fontSize: el.fontSize ? `${el.fontSize}px` : '14px',
                          fontFamily: el.fontFamily || 'sans-serif',
                        }}
                      >
                        {el.content}
                      </div>
                    )}

                    {/* Drag / Resize handles overlay (rendered when active selected) */}
                    {isSelected && (
                      <>
                        {/* South East handle */}
                        <div 
                          className="absolute bottom-[-4px] right-[-4px] w-3 h-3 bg-primary border-2 border-white rounded-full cursor-se-resize z-50"
                          onMouseDown={(e) => handleResizeMouseDown(e, 'se', el)}
                        />
                        {/* East handle */}
                        <div 
                          className="absolute right-[-4px] top-1/2 translate-y-[-50%] w-2 h-4 bg-primary border border-white rounded-sm cursor-e-resize z-50"
                          onMouseDown={(e) => handleResizeMouseDown(e, 'e', el)}
                        />
                        {/* South handle */}
                        <div 
                          className="absolute bottom-[-4px] left-1/2 translate-x-[-50%] w-4 h-2 bg-primary border border-white rounded-sm cursor-s-resize z-50"
                          onMouseDown={(e) => handleResizeMouseDown(e, 's', el)}
                        />
                      </>
                    )}

                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Sidebar Custom Properties Panel */}
        <div className="w-80 bg-neutral-900 border-l border-white/10 text-white p-4 space-y-6 overflow-y-auto">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-manrope font-bold text-sm">Layer Properties</h3>
            <p className="text-[10px] text-white/50 mt-0.5">Tweak attributes of the selected layer</p>
          </div>

          {!selectedElementId ? (
            <div className="py-20 text-center text-white/40 space-y-2">
              <Maximize2 className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
              <p className="text-xs font-semibold">No element selected</p>
              <p className="text-[10px] max-w-[160px] mx-auto leading-relaxed">Click any text, button, or shape inside the canvas to edit styles.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Context Specific controls based on selection */}
              {(() => {
                const el = getSelectedElement();
                if (!el) return null;

                return (
                  <div className="space-y-4">
                    
                    {/* Layer Content Edit (Text contents) */}
                    {(el.type === 'text' || el.type === 'button') && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-white/40 block uppercase">Layer Text Copy</span>
                        <textarea
                          value={el.content}
                          onChange={(e) => updateSelectedElement({ content: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary leading-normal"
                        />
                      </div>
                    )}

                    {/* Font Family Selection */}
                    {(el.type === 'text' || el.type === 'button' || el.type === 'logo') && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-white/40 block uppercase mb-1">Font size (px)</span>
                          <input
                            type="number"
                            value={el.fontSize || 16}
                            onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 10 })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-white/40 block uppercase mb-1">Text Color</span>
                          <div className="relative w-full h-8 bg-white/5 border border-white/15 rounded-lg overflow-hidden flex items-center justify-center">
                            <input
                              type="color"
                              value={el.color || '#000000'}
                              onChange={(e) => updateSelectedElement({ color: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="text-xs font-mono font-bold">{el.color || '#000'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text alignment / styles toolbar */}
                    {(el.type === 'text') && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-white/40 block uppercase">Typography Formatting</span>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                          <button
                            onClick={() => updateSelectedElement({ fontWeight: el.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={`flex-1 py-1.5 rounded flex items-center justify-center ${el.fontWeight === 'bold' ? 'bg-primary text-on-primary-fixed' : 'hover:bg-white/5'}`}
                          >
                            <Bold className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateSelectedElement({ fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className={`flex-1 py-1.5 rounded flex items-center justify-center ${el.fontStyle === 'italic' ? 'bg-primary text-on-primary-fixed' : 'hover:bg-white/5'}`}
                          >
                            <Italic className="w-4 h-4" />
                          </button>
                          <div className="w-px bg-white/10" />
                          <button
                            onClick={() => updateSelectedElement({ align: 'left' })}
                            className={`flex-1 py-1.5 rounded flex items-center justify-center ${el.align === 'left' ? 'bg-primary text-on-primary-fixed' : 'hover:bg-white/5'}`}
                          >
                            <AlignLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateSelectedElement({ align: 'center' })}
                            className={`flex-1 py-1.5 rounded flex items-center justify-center ${el.align === 'center' ? 'bg-primary text-on-primary-fixed' : 'hover:bg-white/5'}`}
                          >
                            <AlignCenter className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateSelectedElement({ align: 'right' })}
                            className={`flex-1 py-1.5 rounded flex items-center justify-center ${el.align === 'right' ? 'bg-primary text-on-primary-fixed' : 'hover:bg-white/5'}`}
                          >
                            <AlignRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shape / Button Background Color settings */}
                    {(el.type === 'shape' || el.type === 'button') && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-white/40 block uppercase mb-1">Fill Color</span>
                          <div className="relative w-full h-8 bg-white/5 border border-white/15 rounded-lg overflow-hidden flex items-center justify-center">
                            <input
                              type="color"
                              value={el.backgroundColor || '#cccccc'}
                              onChange={(e) => updateSelectedElement({ backgroundColor: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="text-xs font-mono font-bold">{el.backgroundColor || '#ccc'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-white/40 block uppercase mb-1">Corner Radius</span>
                          <input
                            type="number"
                            value={el.borderRadius || 0}
                            onChange={(e) => updateSelectedElement({ borderRadius: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    )}

                    {/* Image formatting */}
                    {(el.type === 'image') && (
                      <div>
                        <span className="text-[10px] font-mono text-white/40 block uppercase mb-1">Corner Rounded (px)</span>
                        <input
                          type="number"
                          value={el.borderRadius || 0}
                          onChange={(e) => updateSelectedElement({ borderRadius: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                    )}

                    {/* Text AI Regeneration block */}
                    {el.type === 'text' && (
                      <div className="bg-on-surface/5 p-4 rounded-xl border border-white/10 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-primary">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Text Regeneration</span>
                          </span>
                          <span className="text-[9px] font-mono bg-primary-container/20 px-1 rounded-full uppercase">GEMINI</span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-normal">Select a box and add custom direction prompt to rewrite copy.</p>
                        
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. 'Make it a diwali discount'"
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs"
                          />
                          <button
                            onClick={handleRegenerateText}
                            disabled={isRegenerating}
                            className="w-full py-2 bg-primary hover:bg-primary-fixed-dim text-on-primary-fixed font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                            <span>{isRegenerating ? 'REWRITING...' : 'REGENERATE COPY'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}

              {/* Layer Stack Controls */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Arrange Stack</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => moveLayer('front')}
                    className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10"
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={() => moveLayer('back')}
                    className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10"
                  >
                    Send to Back
                  </button>
                </div>
              </div>

              {/* Delete Layer button */}
              <button
                onClick={deleteSelectedElement}
                className="w-full py-2.5 bg-error/10 hover:bg-error text-error hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-error/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Layer</span>
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
