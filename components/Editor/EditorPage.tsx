import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { EditorToolbar } from './EditorToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { Canvas } from './Canvas';
import { projectService } from '../../services/projectService';
import { loadPdfDocument, renderPageToImage } from '../../services/pdfService';
import { Project, ShapeConfig, ToolType, User } from '../../types';
import { Save, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, AlertCircle, PanelRightClose, PanelRightOpen, Download, X, Undo, Redo, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { jsPDF } from 'jspdf';
import Konva from 'konva';

export const EditorPage: React.FC<{ user: User }> = ({ user }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stageRef = useRef<any>(null); // Ref to access the Canvas stage for export
  
  // Data State
  const [project, setProject] = useState<Project | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.SELECT);
  const [shapes, setShapes] = useState<ShapeConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Undo/Redo History
  // We store the entire shapes array in history for simplicity
  const [history, setHistory] = useState<ShapeConfig[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Global Default Styles
  const [defaultStyles, setDefaultStyles] = useState<{
    stroke: string;
    fill: string;
    strokeWidth: number;
    opacity: number;
    dash: number[];
    fontSize: number;
    fontFamily: string;
    fontStyle: string;
    eraserSize: number;
    unit: 'mm' | 'cm' | 'in' | 'ft';
  }>({
    stroke: '#ef4444',
    fill: 'transparent',
    strokeWidth: 1,
    opacity: 1,
    dash: [],
    fontSize: 10,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    eraserSize: 20,
    unit: 'mm'
  });
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bgImage, setBgImage] = useState<string>('');
  const [pdfDimensions, setPdfDimensions] = useState<{width: number, height: number} | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  
  // UI State
  const [saving, setSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [fileMissing, setFileMissing] = useState(false);
  const [showProperties, setShowProperties] = useState(false); // Default closed on mobile, effect will open on desktop
  const [fitTrigger, setFitTrigger] = useState(0);
  
  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportName, setExportName] = useState('');
  
  // Canvas View State
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Init Properties panel state based on screen size
  useEffect(() => {
    if (window.innerWidth >= 1024) { // Only auto-open on Large screens
        setShowProperties(true);
    }
  }, []);

  // 1. Load Project & PDF
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!id) return;
      
      // Fetch Project Data
      const { data, error } = await projectService.getProject(id);
        
      if (!isMounted) return;

      if (error || !data) {
        console.error('Project load error:', error);
        navigate('/projects');
        return;
      }
      
      setProject(data);
      if (data.annotations) {
        setShapes(data.annotations);
        setHistory([data.annotations]);
        setHistoryStep(0);
      } else {
        setHistory([[]]);
        setHistoryStep(0);
      }

      // Handle PDF File Loading
      // Priority 1: File from navigation state (fresh upload)
      let fileToLoad = location.state?.file;

      // Priority 2: Fetch from URL if state is missing (reload)
      if (!fileToLoad && data.pdf_url) {
         try {
           setIsRendering(true);
           const response = await fetch(data.pdf_url);
           if (!response.ok) throw new Error("Failed to fetch PDF");
           const blob = await response.blob();
           fileToLoad = blob;
         } catch (e) {
           console.error("Failed to load PDF from URL", e);
           // Don't set missing yet, fallback might work? No, this is the fallback.
         } finally {
            if(isMounted) setIsRendering(false);
         }
      }

      if (fileToLoad) {
        try {
          const doc = await loadPdfDocument(fileToLoad);
          if (doc && isMounted) {
            setPdfDoc(doc);
            renderPage(doc, 1);
          }
        } catch (e) {
          console.error("PDF Load Error", e);
          if (isMounted) setFileMissing(true);
        }
      } else {
        if (isMounted) setFileMissing(true);
      }
    };
    
    init();

    return () => { isMounted = false; };
  }, [id]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentTool(ToolType.SELECT);
        setSelectedId(null);
      }
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        handleDelete(selectedId);
      }
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
           handleRedo();
        } else {
           handleUndo();
        }
      }
      // Redo: Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, historyStep, history]);

  const renderPage = async (doc: any, pageNum: number) => {
    if (!doc) return;
    setIsRendering(true);
    try {
      const result = await renderPageToImage(doc, pageNum);
      if (result) {
        setBgImage(result.dataUrl);
        setPdfDimensions({ width: result.width, height: result.height });
        setCurrentPage(pageNum);
      }
    } catch (e: any) {
      if (e.message !== 'Cancelled' && e.message !== 'Canceled') {
        console.error("Render error", e);
      }
    } finally {
      setIsRendering(false);
    }
  };

  // Auto-save
  useEffect(() => {
    if (!project) return;
    const timeout = setTimeout(async () => {
      if (shapes.length > 0) {
        setSaving(true);
        // Autosave keeps status as is (likely 'draft', or 'saved' if already saved)
        await projectService.updateProject(project.id, { 
          annotations: shapes,
          updated_at: new Date().toISOString()
        });
        setSaving(false);
        setLastSaved(new Date());
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [shapes, project]);

  // --- History Management ---
  const pushToHistory = (newShapes: ShapeConfig[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setShapes(newShapes);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setShapes(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setShapes(history[nextStep]);
    }
  };

  // --- Shape Handlers ---
  const handleShapeAdd = (newShape: ShapeConfig) => {
    const newShapes = [...shapes, newShape];
    pushToHistory(newShapes);
    
    if (newShape.type === ToolType.TEXT) {
      setSelectedId(newShape.id);
    } else {
      // Don't auto-select eraser lines or other tools if not needed
      if (newShape.type !== ToolType.ERASER && newShape.type !== ToolType.PEN) {
          setSelectedId(null);
      }
    }
  };

  const handleShapeUpdate = (id: string, newAttrs: Partial<ShapeConfig>, addToHistory: boolean = true) => {
    const updatedShapes = shapes.map(shape => shape.id === id ? { ...shape, ...newAttrs } : shape);
    
    if (addToHistory) {
      pushToHistory(updatedShapes);
    } else {
      // Just update state without history push (for drag operations)
      setShapes(updatedShapes);
    }

    // Update defaults if needed
    const stylesToSync: any = {};
    if (newAttrs.stroke !== undefined) stylesToSync.stroke = newAttrs.stroke;
    if (newAttrs.fill !== undefined) stylesToSync.fill = newAttrs.fill;
    if (newAttrs.strokeWidth !== undefined) stylesToSync.strokeWidth = newAttrs.strokeWidth;
    if (newAttrs.opacity !== undefined) stylesToSync.opacity = newAttrs.opacity;
    if (newAttrs.dash !== undefined) stylesToSync.dash = newAttrs.dash;
    if (newAttrs.fontSize !== undefined) stylesToSync.fontSize = newAttrs.fontSize;
    if (newAttrs.unit !== undefined) stylesToSync.unit = newAttrs.unit;
    
    if (Object.keys(stylesToSync).length > 0 && selectedId === id) {
        setDefaultStyles(prev => ({ ...prev, ...stylesToSync }));
    }
  };

  const handleDelete = (id: string) => {
    const newShapes = shapes.filter(s => s.id !== id);
    pushToHistory(newShapes);
    setSelectedId(null);
  };

  // Manual Save (Marks as Saved)
  const handleSaveProject = async () => {
    if (!project) return;
    setSaving(true);
    // Explicitly set status to 'saved' when clicking the Save button
    await projectService.updateProject(project.id, { 
      annotations: shapes,
      status: 'saved',
      updated_at: new Date().toISOString()
    });
    
    // Update local state to reflect change immediately
    setProject(prev => prev ? ({ ...prev, status: 'saved' }) : null);
    
    setSaving(false);
    setLastSaved(new Date());
  };

  // Open Export Modal
  const openExportModal = () => {
    if (!stageRef.current) {
        console.error("Stage not ready");
        return;
    }
    if (!pdfDoc) {
        alert("Please wait for the document to fully load before exporting.");
        return;
    }
    setExportName(project ? `${project.name}-export` : 'design-export');
    setShowExportModal(true);
  };

  // Reusable helper to replicate React-Konva rendering in vanilla Konva
  const addShapesToLayer = (layer: Konva.Layer, pageShapes: ShapeConfig[]) => {
      const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || hex === 'transparent') return 'transparent';
        let c: any;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        return hex;
      }

      pageShapes.forEach(shape => {
          if(!shape.visible) return;

          const commonProps: any = {
             stroke: shape.stroke,
             strokeWidth: shape.strokeWidth,
             dash: shape.dash,
             opacity: shape.opacity,
          };
          
          if (shape.globalCompositeOperation) {
              commonProps.globalCompositeOperation = shape.globalCompositeOperation;
          }

          if (shape.type === ToolType.RECTANGLE) {
              layer.add(new Konva.Rect({
                  ...commonProps,
                  x: shape.x, y: shape.y, width: shape.width || 0, height: shape.height || 0,
                  fill: hexToRgba(shape.fill, shape.opacity),
                  opacity: 1
              }));
          } else if (shape.type === ToolType.ELLIPSE) {
              const rx = Math.abs(shape.width || 0) / 2;
              const ry = Math.abs(shape.height || 0) / 2;
              layer.add(new Konva.Ellipse({
                  ...commonProps,
                  x: shape.x + (shape.width || 0) / 2,
                  y: shape.y + (shape.height || 0) / 2,
                  radiusX: rx, radiusY: ry,
                  fill: hexToRgba(shape.fill, shape.opacity),
                  opacity: 1
              }));
          } else if (shape.type === ToolType.LINE || shape.type === ToolType.PEN || shape.type === ToolType.ERASER) {
              layer.add(new Konva.Line({
                  ...commonProps,
                  points: shape.points || [],
                  lineCap: 'round', lineJoin: 'round',
                  tension: shape.type === ToolType.PEN ? 0.5 : 0
              }));
          } else if (shape.type === ToolType.ARROW) {
              layer.add(new Konva.Arrow({
                  ...commonProps,
                  points: shape.points || [],
                  fill: shape.stroke,
                  pointerLength: 10, pointerWidth: 10
              }));
          } else if (shape.type === ToolType.TEXT) {
               layer.add(new Konva.Text({
                   x: shape.x, y: shape.y,
                   text: shape.text || '',
                   fontSize: shape.fontSize || 16,
                   fontFamily: shape.fontFamily || 'Inter',
                   fontStyle: shape.fontStyle || 'normal',
                   fill: shape.fill !== 'transparent' ? shape.fill : shape.stroke,
                   opacity: shape.opacity
               }));
          }
      });
  };

  // Perform Multi-Page Export
  const performExport = async () => {
    if (!exportName || !pdfDoc) return;
    
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 50));

    try {
        const numPages = pdfDoc.numPages;
        const renderScale = 2; 
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            hotfixes: ['px_scaling'] 
        });
        
        pdf.deletePage(1);

        for (let i = 1; i <= numPages; i++) {
            // 1. Render PDF Page High Res
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: renderScale });
            
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) continue;

            // Render PDF background
            await page.render({ canvasContext: ctx, viewport }).promise;

            // 2. Render Annotations via Headless Konva
            const pageShapes = shapes.filter(s => s.page === i && s.visible);
            if (pageShapes.length > 0) {
                 const tempDiv = document.createElement('div');
                 const stage = new Konva.Stage({
                     container: tempDiv,
                     width: viewport.width,
                     height: viewport.height,
                     scale: { x: renderScale, y: renderScale }
                 });
                 const layer = new Konva.Layer();
                 stage.add(layer);
                 
                 addShapesToLayer(layer, pageShapes);
                 
                 layer.draw();
                 
                 const konvaCanvas = layer.toCanvas();
                 ctx.drawImage(konvaCanvas, 0, 0);
                 stage.destroy();
            }

            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const pdfPageWidth = viewport.width / renderScale;
            const pdfPageHeight = viewport.height / renderScale;
            
            pdf.addPage([pdfPageWidth, pdfPageHeight], pdfPageWidth > pdfPageHeight ? 'l' : 'p');
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfPageWidth, pdfPageHeight);
        }

        pdf.save(`${exportName}.pdf`);
        setShowExportModal(false);
    } catch (e) {
        console.error("Export failed:", e);
        alert("Failed to export PDF. Please try again.");
    } finally {
        setIsExporting(false);
    }
  };

  const selectedShape = shapes.find(s => s.id === selectedId) || null;

  if (fileMissing) {
    return (
      <div className="flex flex-col h-[100dvh] bg-dark-900 items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6 text-gray-500">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Session File Lost</h1>
        <p className="text-gray-400 max-w-md mb-8">
          The PDF file is missing because it was not found in storage.
          <br/>Please ensure you have created the 'project-files' bucket in Supabase.
        </p>
        <Button onClick={() => navigate('/projects')}>Return to Projects</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-dark-900 text-white overflow-hidden relative">
      {/* Header */}
      <div className="h-14 border-b border-dark-700 bg-dark-800 flex items-center justify-between px-2 md:px-4 z-20 shrink-0 gap-2">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0 overflow-hidden">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="px-2 shrink-0">
            <ChevronLeft size={20} /> <span className="hidden md:inline ml-1">Back</span>
          </Button>
          <div className="flex flex-col justify-center overflow-hidden">
             <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate max-w-[100px] md:max-w-[200px]">{project?.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize hidden sm:inline-block ${project?.status === 'saved' ? 'bg-green-900/30 text-green-400' : 'bg-dark-700 text-gray-400'}`}>
                    {project?.status || 'Draft'}
                </span>
             </div>
             <span className="text-[10px] text-gray-500 hidden sm:block">
               {saving ? 'Saving...' : `Last saved ${lastSaved.toLocaleTimeString()}`}
             </span>
          </div>
        </div>

        {/* Center Desktop: Zoom & Page Nav (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
             <div className="flex items-center gap-2 bg-dark-700/50 rounded-lg p-1">
                  <Button variant="ghost" size="sm" disabled={currentPage <= 1} onClick={() => renderPage(pdfDoc, currentPage - 1)} className="h-7 w-7 p-0">
                    <ChevronLeft size={14} />
                  </Button>
                  <span className="text-xs w-16 text-center font-mono">Page {currentPage}/{pdfDoc?.numPages || 1}</span>
                  <Button variant="ghost" size="sm" disabled={!pdfDoc || currentPage >= pdfDoc.numPages} onClick={() => renderPage(pdfDoc, currentPage + 1)} className="h-7 w-7 p-0">
                    <ChevronRight size={14} />
                  </Button>
             </div>

             <div className="flex items-center gap-2 bg-dark-700/50 rounded-lg p-1">
                  <button className="p-1 hover:text-white text-gray-400 h-7 w-7 flex items-center justify-center" onClick={() => setStageScale(s => Math.max(0.1, s - 0.1))}><ZoomOut size={14} /></button>
                  <span className="text-xs w-10 text-center font-mono">{Math.round(stageScale * 100)}%</span>
                  <button className="p-1 hover:text-white text-gray-400 h-7 w-7 flex items-center justify-center" onClick={() => setStageScale(s => s + 0.1)}><ZoomIn size={14} /></button>
                  <button className="p-1 hover:text-white text-gray-400 h-7 w-7 flex items-center justify-center border-l border-dark-600 ml-1 pl-2" onClick={() => setFitTrigger(n => n + 1)}><Maximize size={14} /></button>
             </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 bg-dark-700 rounded-lg p-0.5">
               <button 
                 onClick={handleUndo} 
                 disabled={historyStep <= 0}
                 className={`p-1.5 rounded ${historyStep > 0 ? 'hover:bg-dark-600 text-gray-200' : 'text-gray-600 cursor-not-allowed'}`}
                 title="Undo"
               >
                 <Undo size={16} />
               </button>
               <button 
                 onClick={handleRedo} 
                 disabled={historyStep >= history.length - 1}
                 className={`p-1.5 rounded ${historyStep < history.length - 1 ? 'hover:bg-dark-600 text-gray-200' : 'text-gray-600 cursor-not-allowed'}`}
                 title="Redo"
               >
                 <Redo size={16} />
               </button>
            </div>

            <Button variant="secondary" size="sm" onClick={handleSaveProject} className="px-2 h-8">
                {project?.status === 'saved' ? <CheckCircle2 size={16} className="text-green-500" /> : <Save size={16} />} 
                <span className="hidden lg:inline ml-2">{project?.status === 'saved' ? 'Saved' : 'Save'}</span>
            </Button>
            <Button variant="primary" size="sm" onClick={openExportModal} className="px-2 h-8" isLoading={isExporting}>
                <Download size={16} /> <span className="hidden lg:inline ml-2">Export</span>
            </Button>
           
           <button 
             onClick={() => setShowProperties(!showProperties)}
             className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${showProperties ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}
           >
             {showProperties ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative min-h-0">
        <EditorToolbar currentTool={currentTool} setTool={setCurrentTool} />
        
        {/* Center Canvas Area + Mobile Controls */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-neutral-900/90 min-h-0">
             <div className="flex-1 relative overflow-hidden flex flex-col w-full h-full min-h-0">
                {isRendering && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                         <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <Canvas 
                  stageRef={stageRef}
                  bgImage={bgImage}
                  pdfDimensions={pdfDimensions}
                  shapes={shapes}
                  currentTool={currentTool}
                  currentPage={currentPage}
                  defaultStyles={defaultStyles}
                  onShapeAdd={handleShapeAdd}
                  onShapeUpdate={handleShapeUpdate}
                  onShapeRemove={handleDelete}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  stageScale={stageScale}
                  stagePos={stagePos}
                  setStageScale={setStageScale}
                  setStagePos={setStagePos}
                  fitTrigger={fitTrigger}
                />
             </div>

             {/* Mobile/Tablet Bottom Bar (Visible < lg) - Fixed at bottom of canvas area */}
             <div className="lg:hidden shrink-0 h-14 bg-dark-800 border-t border-dark-700 flex items-center justify-between px-4 z-30">
                 {/* Page Nav */}
                 <div className="flex items-center gap-2">
                      <button disabled={currentPage <= 1} onClick={() => renderPage(pdfDoc, currentPage - 1)} className="p-2 rounded-lg hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-300">
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm font-medium w-16 text-center text-gray-300 font-mono">
                         {currentPage} / {pdfDoc?.numPages || 1}
                      </span>
                      <button disabled={!pdfDoc || currentPage >= pdfDoc.numPages} onClick={() => renderPage(pdfDoc, currentPage + 1)} className="p-2 rounded-lg hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-300">
                        <ChevronRight size={20} />
                      </button>
                 </div>

                 <div className="w-px h-6 bg-dark-700 mx-2"></div>

                 {/* Zoom Controls */}
                 <div className="flex items-center gap-2">
                      <button onClick={() => setStageScale(s => Math.max(0.1, s - 0.1))} className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-300">
                         <ZoomOut size={20} />
                      </button>
                      <span className="text-sm font-medium w-12 text-center text-gray-300 font-mono">{Math.round(stageScale * 100)}%</span>
                      <button onClick={() => setStageScale(s => s + 0.1)} className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-300">
                         <ZoomIn size={20} />
                      </button>
                      <button onClick={() => setFitTrigger(n => n + 1)} className="p-2 rounded-lg hover:bg-dark-700 text-brand-400 transition-colors ml-1">
                         <Maximize size={20} />
                      </button>
                 </div>
            </div>
        </div>

        {/* Collapsible Properties Panel - Absolute overlay on mobile, static on desktop */}
        {showProperties && (
          <div className="absolute right-0 top-0 bottom-0 z-40 md:relative md:z-0 h-full shadow-2xl md:shadow-none w-[85vw] max-w-sm md:w-64 shrink-0 flex flex-col bg-dark-800 border-l border-dark-700 animate-in slide-in-from-right-10 duration-200">
             {/* Mobile Close Button */}
             <div className="md:hidden flex justify-between items-center p-3 border-b border-dark-700 bg-dark-800/95 backdrop-blur shrink-0">
                <span className="text-sm font-semibold text-white">Properties</span>
                <button onClick={() => setShowProperties(false)} className="p-2 text-gray-400 hover:text-white bg-dark-700 rounded-lg">
                  <X size={18}/>
                </button>
             </div>
             <PropertiesPanel 
                currentTool={currentTool}
                selectedShape={selectedShape}
                defaultStyles={defaultStyles}
                setDefaultStyles={setDefaultStyles}
                updateShape={(id, attrs) => handleShapeUpdate(id, attrs, true)} // Push to history
                deleteShape={handleDelete}
                layers={shapes}
                selectShape={setSelectedId}
              />
          </div>
        )}
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
           <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all scale-100 opacity-100">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-white">Export Full PDF</h3>
                 <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                  Download high-quality PDF with annotations.<br/>
                  <span className="text-xs text-gray-500">Includes all {pdfDoc?.numPages || 1} pages. Large files may take a moment.</span>
              </p>
              
              <input
                 value={exportName}
                 onChange={e => setExportName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && performExport()}
                 className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 mb-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                 placeholder="filename"
                 autoFocus
              />
              
              <div className="flex gap-3">
                 <Button variant="ghost" className="flex-1" onClick={() => setShowExportModal(false)}>Cancel</Button>
                 <Button className="flex-1" onClick={performExport} isLoading={isExporting}>
                    {isExporting ? 'Processing...' : 'Download PDF'}
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};