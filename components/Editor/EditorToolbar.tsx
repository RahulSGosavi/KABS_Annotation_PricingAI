import React, { useState } from 'react';
import { ToolType } from '../../types';
import { 
  MousePointer2, 
  Hand, 
  Pen, 
  Minus, 
  MoveRight, 
  Square, 
  Circle, 
  Type, 
  Ruler, 
  Eraser,
  Triangle
} from 'lucide-react';

interface EditorToolbarProps {
  currentTool: ToolType;
  setTool: (t: ToolType) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ currentTool, setTool }) => {
  const [hoveredTool, setHoveredTool] = useState<{ label: string; top: number; left: number } | null>(null);

  const tools = [
    { type: ToolType.SELECT, icon: MousePointer2, label: 'Select' },
    { type: ToolType.PAN, icon: Hand, label: 'Pan' },
    { type: ToolType.PEN, icon: Pen, label: 'Freehand' },
    { type: ToolType.LINE, icon: Minus, label: 'Line' },
    { type: ToolType.ARROW, icon: MoveRight, label: 'Arrow' },
    { type: ToolType.RECTANGLE, icon: Square, label: 'Rectangle' },
    { type: ToolType.ELLIPSE, icon: Circle, label: 'Ellipse' },
    { type: ToolType.TEXT, icon: Type, label: 'Text' },
    { type: ToolType.MEASURE, icon: Ruler, label: 'Measure' },
    { type: ToolType.ANGLE, icon: Triangle, label: 'Angle' },
    { type: ToolType.ERASER, icon: Eraser, label: 'Eraser' },
  ];

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTool({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12 // 12px gap from the button
    });
  };

  const handleMouseLeave = () => {
    setHoveredTool(null);
  };

  return (
    <>
      <div className="w-18 bg-dark-800 border-r border-dark-700 flex flex-col items-center py-4 gap-3 z-10 shrink-0 h-full overflow-y-auto custom-scrollbar">
        {tools.map((tool) => {
          const isActive = currentTool === tool.type;
          return (
            <div key={tool.type} className="shrink-0">
              <button
                onClick={() => setTool(tool.type)}
                onMouseEnter={(e) => handleMouseEnter(e, tool.label)}
                onMouseLeave={handleMouseLeave}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <tool.icon size={24} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Fixed Tooltip Overlay - Renders outside the scroll container */}
      {hoveredTool && (
        <div 
            className="fixed z-50 px-3 py-1.5 bg-dark-900 border border-dark-600 text-white text-xs font-medium rounded-lg shadow-xl pointer-events-none hidden md:block animate-in fade-in duration-150"
            style={{ 
                top: hoveredTool.top, 
                left: hoveredTool.left,
                transform: 'translateY(-50%)' 
            }}
        >
            {hoveredTool.label}
            {/* Arrow pointing left */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-dark-900 border-l border-b border-dark-600 transform rotate-45"></div>
        </div>
      )}
    </>
  );
};