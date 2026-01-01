import React, { useState } from 'react';
import { ShapeConfig, ToolType } from '../../types';
import { Layers, Settings2, Trash2, Eye, EyeOff, Bold, Italic } from 'lucide-react';

interface PropertiesPanelProps {
  currentTool: ToolType;
  selectedShape: ShapeConfig | null;
  defaultStyles: { 
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
  };
  setDefaultStyles: (styles: any) => void;
  updateShape: (id: string, attrs: Partial<ShapeConfig>) => void;
  deleteShape: (id: string) => void;
  layers: ShapeConfig[];
  selectShape: (id: string | null) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  currentTool,
  selectedShape, 
  defaultStyles,
  setDefaultStyles,
  updateShape, 
  deleteShape,
  layers,
  selectShape
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'layers'>('props');

  const displayLayers = [...layers].reverse();

  // Helper to update either selected shape or default styles
  const handleStyleChange = (key: string, value: any) => {
    if (selectedShape) {
      updateShape(selectedShape.id, { [key]: value });
    } else {
      setDefaultStyles({ ...defaultStyles, [key]: value });
    }
  };

  const handleAngleChange = (newAngle: number) => {
    if (!selectedShape || selectedShape.type !== ToolType.ANGLE || !selectedShape.points) return;
    
    const pts = selectedShape.points;
    const p1 = { x: pts[0], y: pts[1] };
    const v = { x: pts[2], y: pts[3] };
    const oldP3 = { x: pts[4], y: pts[5] };
    
    const angle1 = Math.atan2(p1.y - v.y, p1.x - v.x);
    const targetAngleRad = angle1 + (newAngle * Math.PI / 180);
    
    // Preserve length of arm 2
    const dist = Math.sqrt(Math.pow(oldP3.x - v.x, 2) + Math.pow(oldP3.y - v.y, 2));
    
    const newP3 = {
      x: v.x + Math.cos(targetAngleRad) * dist,
      y: v.y + Math.sin(targetAngleRad) * dist
    };
    
    updateShape(selectedShape.id, {
      points: [p1.x, p1.y, v.x, v.y, newP3.x, newP3.y]
    });
  };

  const getCurrentAngle = () => {
    if (!selectedShape || selectedShape.type !== ToolType.ANGLE || !selectedShape.points) return 0;
    const pts = selectedShape.points;
    const p1 = { x: pts[0], y: pts[1] };
    const v = { x: pts[2], y: pts[3] };
    const p3 = { x: pts[4], y: pts[5] };
    
    const angle1 = Math.atan2(p1.y - v.y, p1.x - v.x);
    const angle2 = Math.atan2(p3.y - v.y, p3.x - v.x);
    
    let diff = (angle2 - angle1) * (180 / Math.PI);
    if (diff < 0) diff += 360;
    return Math.round(diff * 10) / 10;
  };

  const currentStyles = selectedShape || defaultStyles;
  const isDefaultMode = !selectedShape;
  
  // Show text options if Text object selected OR if in Text tool mode (setting defaults)
  const showTextOptions = (selectedShape?.type === ToolType.TEXT) || (isDefaultMode && currentTool === ToolType.TEXT);
  const showEraserOptions = currentTool === ToolType.ERASER;

  // Font Options
  const fontFamilies = [
    { name: 'Inter', label: 'Inter (Default)' },
    { name: 'Roboto', label: 'Roboto (Standard)' },
    { name: 'Merriweather', label: 'Merriweather (Formal)' },
    { name: 'Fira Code', label: 'Fira Code (Tech)' },
    { name: 'Oswald', label: 'Oswald (Label)' },
    { name: 'Lato', label: 'Lato (Clean)' }
  ];

  // PDF Standard Colors
  const colors = [
    '#FF0000', '#0000FF', '#008000', '#000000', '#FFFFFF', '#FFFF00', '#FFA500', '#800080',
  ];

  return (
    <div className="w-full h-full bg-dark-800 border-l border-dark-700 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-dark-700 shrink-0">
        <button 
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'props' ? 'text-brand-500 border-b-2 border-brand-500 bg-dark-700/50' : 'text-gray-400 hover:text-white'}`}
        >
          <Settings2 size={16} /> Properties
        </button>
        <button 
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'layers' ? 'text-brand-500 border-b-2 border-brand-500 bg-dark-700/50' : 'text-gray-400 hover:text-white'}`}
        >
          <Layers size={16} /> Layers
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'props' ? (
          <div className="space-y-6">
            <div className="pb-2 border-b border-dark-700 mb-2">
               <h3 className="text-sm font-bold text-white">
                 {showEraserOptions ? "Eraser Settings" : (isDefaultMode ? "Default Styles" : "Selected Object")}
               </h3>
               <p className="text-xs text-gray-500">
                 {showEraserOptions ? "Adjust brush size" : (isDefaultMode ? "Settings for next new object" : `Editing ${selectedShape.type}`)}
               </p>
            </div>

            {/* ERASER SPECIFIC */}
            {showEraserOptions && (
               <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">Brush Size: {defaultStyles.eraserSize}px</label>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={defaultStyles.eraserSize} 
                    onChange={(e) => setDefaultStyles({...defaultStyles, eraserSize: parseInt(e.target.value)})}
                    className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-center mt-4">
                     <div 
                        className="rounded-full bg-white/50 border border-white"
                        style={{ width: defaultStyles.eraserSize, height: defaultStyles.eraserSize }}
                     />
                  </div>
               </div>
            )}

            {!showEraserOptions && (
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 mb-3 tracking-wider">Appearance</h3>

              {/* Angle Tool Specific - Angle Value */}
              {selectedShape && selectedShape.type === ToolType.ANGLE && (
                 <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Angle (degrees)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={getCurrentAngle()} 
                        onChange={(e) => handleAngleChange(parseFloat(e.target.value))}
                        className="w-full bg-dark-900 text-white text-sm border border-dark-600 rounded px-2 py-2 focus:outline-none focus:border-brand-500"
                        step="0.1"
                      />
                      <button onClick={() => handleAngleChange(45)} className="px-2 py-1 bg-dark-700 text-xs rounded hover:bg-dark-600">45°</button>
                      <button onClick={() => handleAngleChange(90)} className="px-2 py-1 bg-dark-700 text-xs rounded hover:bg-dark-600">90°</button>
                    </div>
                 </div>
              )}
              
              {/* Text Only Properties */}
              {showTextOptions && (
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">Typography</label>
                  <select 
                    value={currentStyles.fontFamily || 'Inter'}
                    onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                    className="w-full bg-dark-900 text-white text-sm border border-dark-600 rounded px-2 py-2 mb-3 focus:outline-none focus:border-brand-500"
                  >
                    {fontFamilies.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                  </select>

                  <div className="flex gap-2 mb-3">
                     <button
                       onClick={() => handleStyleChange('fontStyle', currentStyles.fontStyle?.includes('bold') ? currentStyles.fontStyle.replace('bold', '').trim() : (currentStyles.fontStyle || '') + ' bold')}
                       className={`flex-1 py-1.5 rounded text-xs border ${currentStyles.fontStyle?.includes('bold') ? 'bg-brand-900 border-brand-500 text-brand-400' : 'bg-dark-900 border-dark-600 text-gray-400'}`}
                     >
                       <Bold size={14} className="mx-auto" />
                     </button>
                     <button
                       onClick={() => handleStyleChange('fontStyle', currentStyles.fontStyle?.includes('italic') ? currentStyles.fontStyle.replace('italic', '').trim() : (currentStyles.fontStyle || '') + ' italic')}
                       className={`flex-1 py-1.5 rounded text-xs border ${currentStyles.fontStyle?.includes('italic') ? 'bg-brand-900 border-brand-500 text-brand-400' : 'bg-dark-900 border-dark-600 text-gray-400'}`}
                     >
                       <Italic size={14} className="mx-auto" />
                     </button>
                  </div>
                  
                  <label className="text-xs text-gray-400 mb-1 block">Size: {currentStyles.fontSize}px</label>
                  <input 
                    type="range" min="8" max="72" value={currentStyles.fontSize || 16} 
                    onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                    className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Stroke Color */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Stroke / Text Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => handleStyleChange('stroke', c)}
                      className={`w-6 h-6 rounded-full border border-gray-600 ${currentStyles.stroke === c ? 'ring-2 ring-white scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Style (Dash) */}
              {!showTextOptions && (
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Line Style</label>
                <div className="flex gap-2 bg-dark-900 p-1 rounded-lg border border-dark-600">
                  <button onClick={() => handleStyleChange('dash', [])} className={`flex-1 h-8 rounded flex items-center justify-center ${(!currentStyles.dash || currentStyles.dash.length === 0) ? 'bg-dark-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <svg width="24" height="2" className="overflow-visible"><line x1="0" y1="1" x2="24" y2="1" stroke="currentColor" strokeWidth="2" /></svg>
                  </button>
                  <button onClick={() => handleStyleChange('dash', [6, 4])} className={`flex-1 h-8 rounded flex items-center justify-center ${(currentStyles.dash && currentStyles.dash.length > 0 && currentStyles.dash[0] >= 5) ? 'bg-dark-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <svg width="24" height="2" className="overflow-visible"><line x1="0" y1="1" x2="24" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" /></svg>
                  </button>
                  <button onClick={() => handleStyleChange('dash', [2, 4])} className={`flex-1 h-8 rounded flex items-center justify-center ${(currentStyles.dash && currentStyles.dash.length > 0 && currentStyles.dash[0] < 5) ? 'bg-dark-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <svg width="24" height="2" className="overflow-visible"><line x1="0" y1="1" x2="24" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </div>
              )}

              {/* Fill Color */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Fill</label>
                <div className="flex gap-2 flex-wrap">
                  {['transparent', '#FF0000', '#ffff95', '#0000FF', '#008000', '#FFFFFF'].map(c => (
                    <button
                      key={c}
                      onClick={() => handleStyleChange('fill', c)}
                      className={`w-6 h-6 rounded-full border border-gray-600 relative ${currentStyles.fill === c ? 'ring-2 ring-white scale-110' : ''}`}
                      style={{ backgroundColor: c === 'transparent' ? 'transparent' : c }}
                    >
                       {c === 'transparent' && <div className="absolute inset-0 border-r border-red-500 transform rotate-45" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke Width */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">{showTextOptions ? 'Outline Width (0 for none)' : 'Line Width'}: {currentStyles.strokeWidth}px</label>
                <input 
                  type="range" min="0" max="20" value={currentStyles.strokeWidth} 
                  onChange={(e) => handleStyleChange('strokeWidth', parseInt(e.target.value))}
                  className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Opacity: {Math.round(currentStyles.opacity * 100)}%</label>
                <input 
                  type="range" min="0.1" max="1" step="0.1"
                  value={currentStyles.opacity} 
                  onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
                  className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Measurement Units */}
              {((selectedShape && selectedShape.type === ToolType.MEASURE) || (!selectedShape && currentTool === ToolType.MEASURE)) && (
                 <div className="mb-4 pt-4 border-t border-dark-700">
                    <label className="text-xs text-gray-400 mb-2 block">Measurement Unit</label>
                    <select 
                      value={currentStyles.unit || 'mm'}
                      onChange={(e) => handleStyleChange('unit', e.target.value)}
                      className="w-full bg-dark-900 text-white text-sm border border-dark-600 rounded px-2 py-1 focus:outline-none focus:border-brand-500"
                    >
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="in">Inches (in)</option>
                      <option value="ft">Feet (ft)</option>
                    </select>
                 </div>
              )}
            </div>
            )}

            {selectedShape && !showEraserOptions && (
              <div className="pt-4 border-t border-dark-700">
                 <button 
                  onClick={() => deleteShape(selectedShape.id)}
                  className="w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                 >
                   <Trash2 size={16} /> Delete Object
                 </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayLayers.length === 0 ? (
               <p className="text-center text-gray-500 mt-4 text-sm">No annotations yet.</p>
            ) : (
              displayLayers.map((shape, idx) => (
                <div 
                  key={shape.id}
                  onClick={() => selectShape(shape.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm ${selectedShape?.id === shape.id ? 'bg-brand-900/30 border border-brand-500/30' : 'hover:bg-dark-700 border border-transparent'}`}
                >
                  <span className="truncate flex-1 text-gray-300">
                    {shape.type} {displayLayers.length - idx}
                  </span>
                  <div className="flex items-center gap-1">
                     <button 
                       onClick={(e) => { e.stopPropagation(); updateShape(shape.id, { visible: !shape.visible }); }}
                       className="p-1 hover:text-white text-gray-500"
                     >
                       {shape.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); deleteShape(shape.id); }}
                       className="p-1 hover:text-red-400 text-gray-500"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};