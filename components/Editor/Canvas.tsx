import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Rect, Circle, Ellipse, Arrow, Text, Transformer, Group, Arc } from 'react-konva';
import { ShapeConfig, ToolType } from '../../types';
import useImage from 'use-image';

interface CanvasProps {
  stageRef: React.MutableRefObject<any>;
  bgImage?: string;
  pdfDimensions: { width: number, height: number } | null;
  shapes: ShapeConfig[];
  currentTool: ToolType;
  currentPage: number;
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
  onShapeUpdate: (id: string, newAttrs: Partial<ShapeConfig>, addToHistory?: boolean) => void;
  onShapeAdd: (shape: ShapeConfig) => void;
  onShapeRemove: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  stageScale: number;
  stagePos: { x: number, y: number };
  setStageScale: (s: number) => void;
  setStagePos: (pos: { x: number, y: number }) => void;
  fitTrigger?: number; // Prop to trigger fit-to-screen
}

const BackgroundImage = ({ src, width, height }: { src: string, width: number, height: number }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={width} height={height} listening={false} />;
};

// Helper to calculate angle and label position
const calculateAngleData = (pts: number[]) => {
  if (!pts || pts.length < 6) return { angle: 0, rotation: 0, labelX: 0, labelY: 0, v: {x:0, y:0}, p1: {x:0, y:0}, p3: {x:0, y:0} };
  const p1 = { x: pts[0], y: pts[1] };
  const v = { x: pts[2], y: pts[3] };
  const p3 = { x: pts[4], y: pts[5] };
  const angle1 = Math.atan2(p1.y - v.y, p1.x - v.x);
  const angle2 = Math.atan2(p3.y - v.y, p3.x - v.x);
  let angleDeg = (angle2 - angle1) * (180 / Math.PI);
  if (angleDeg < 0) angleDeg += 360; 
  let bisectorRad = angle1 + (angleDeg * Math.PI / 180) / 2;
  const labelDist = 45;
  const labelX = v.x + Math.cos(bisectorRad) * labelDist;
  const labelY = v.y + Math.sin(bisectorRad) * labelDist;
  const rotation = angle1 * (180 / Math.PI);
  return { angle: angleDeg, rotation: rotation, labelX, labelY, v, p1, p3 };
};

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

export const Canvas: React.FC<CanvasProps> = ({ 
  stageRef, bgImage, pdfDimensions, shapes, currentTool, currentPage, defaultStyles, onShapeUpdate, onShapeAdd, onShapeRemove, selectedId, onSelect,
  stageScale, stagePos, setStageScale, setStagePos, fitTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const currentShapeId = useRef<string | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textEditPos, setTextEditPos] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic Cursor Logic
  const cursorStyle = (() => {
    if (currentTool === ToolType.PAN) return isDrawing.current ? 'grabbing' : 'grab';
    switch (currentTool) {
      case ToolType.SELECT:
        return 'default';
      case ToolType.PEN:
        const penSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(1px 1px 2px black);"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`);
        return `url("data:image/svg+xml,${penSvg}") 0 24, auto`;
      case ToolType.ERASER:
         // Custom circle cursor for eraser based on size
         const s = defaultStyles.eraserSize || 20;
         const svgSize = Math.max(32, s + 4);
         const c = svgSize / 2;
         const r = s / 2;
         const eraserSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}"><circle cx="${c}" cy="${c}" r="${r}" fill="rgba(255, 255, 255, 0.5)" stroke="black" stroke-width="1"/></svg>`);
         return `url("data:image/svg+xml,${eraserSvg}") ${c} ${c}, auto`;
      case ToolType.TEXT:
        return 'text';
      case ToolType.RECTANGLE:
      case ToolType.ELLIPSE:
      case ToolType.LINE:
      case ToolType.ARROW:
      case ToolType.MEASURE:
      case ToolType.ANGLE:
        return 'crosshair';
      default:
        return 'default';
    }
  })();

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        // Use getBoundingClientRect for more accurate sub-pixel sizing and to avoid scrollbar issues
        const rect = containerRef.current.getBoundingClientRect();
        setSize({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    checkSize();
    
    // Check on resize and orientation change
    window.addEventListener('resize', checkSize);
    window.addEventListener('orientationchange', checkSize);
    
    const observer = new ResizeObserver(checkSize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkSize);
      window.removeEventListener('orientationchange', checkSize);
    };
  }, []);

  useEffect(() => {
    if (size.width > 0 && size.height > 0 && pdfDimensions) {
      // Responsive padding: minimize padding on mobile/tablet to maximize view
      // On small screens, we want to use almost the entire space.
      const isMobile = size.width < 1024; // Treat anything under lg as mobile/tablet for tight fitting
      const padding = isMobile ? 8 : 32; 
      
      const availWidth = size.width - padding;
      const availHeight = size.height - padding;
      
      const scaleW = availWidth / pdfDimensions.width;
      const scaleH = availHeight / pdfDimensions.height;
      
      // Use the smaller scale to fit whole page
      const newScale = Math.min(scaleW, scaleH);
      
      // Center the PDF in the available space
      const newX = (size.width - pdfDimensions.width * newScale) / 2;
      const newY = (size.height - pdfDimensions.height * newScale) / 2;
      
      setStageScale(newScale);
      setStagePos({ x: newX, y: newY });
    }
  }, [size, pdfDimensions, fitTrigger, setStageScale, setStagePos]);

  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      const selectedShape = shapes.find(s => s.id === selectedId);
      if (node && selectedShape && selectedShape.type !== ToolType.ANGLE) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, shapes]);

  useEffect(() => {
    if (editingTextId && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [editingTextId]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.1 || newScale > 8) return;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const getPointerPos = () => {
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(point);
  };

  // Using Pointer Events for better tablet support
  const handlePointerDown = (e: any) => {
    if (editingTextId) {
       // If clicking outside, finish edit
       handleTextComplete();
       return;
    }

    if (currentTool === ToolType.SELECT || currentTool === ToolType.PAN) {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        onSelect(null);
      }
      return;
    }

    if (selectedId) {
      onSelect(null);
    }

    isDrawing.current = true;
    const pos = getPointerPos();
    const id = crypto.randomUUID();
    currentShapeId.current = id;

    const baseShape = {
      id,
      stroke: defaultStyles.stroke,
      strokeWidth: defaultStyles.strokeWidth,
      opacity: defaultStyles.opacity,
      fill: defaultStyles.fill,
      dash: defaultStyles.dash,
      page: currentPage,
      visible: true,
      locked: false,
    };

    let newShape: ShapeConfig | null = null;

    if (currentTool === ToolType.ERASER) {
        newShape = { 
            ...baseShape, 
            type: ToolType.ERASER, 
            x: 0, y: 0, 
            points: [pos.x, pos.y],
            strokeWidth: defaultStyles.eraserSize,
            stroke: '#000000',
            globalCompositeOperation: 'destination-out',
            opacity: 1
        };
    } else if (currentTool === ToolType.RECTANGLE) {
      newShape = { ...baseShape, type: ToolType.RECTANGLE, x: pos.x, y: pos.y, width: 0, height: 0 };
    } else if (currentTool === ToolType.ELLIPSE) {
      newShape = { ...baseShape, type: ToolType.ELLIPSE, x: pos.x, y: pos.y, width: 0, height: 0 };
    } else if (currentTool === ToolType.MEASURE) {
      newShape = { 
        ...baseShape, 
        type: ToolType.MEASURE, 
        x: 0, y: 0, 
        points: [pos.x, pos.y, pos.x, pos.y],
        unit: defaultStyles.unit 
      };
    } else if (currentTool === ToolType.LINE || currentTool === ToolType.PEN || currentTool === ToolType.ARROW) {
      newShape = { ...baseShape, type: currentTool, x: 0, y: 0, points: [pos.x, pos.y, pos.x, pos.y] };
    } else if (currentTool === ToolType.ANGLE) {
      newShape = { 
        ...baseShape, 
        type: ToolType.ANGLE, 
        x: 0, y: 0, 
        points: [pos.x, pos.y, pos.x, pos.y, pos.x, pos.y] 
      };
    } else if (currentTool === ToolType.TEXT) {
       newShape = { 
         ...baseShape, 
         type: ToolType.TEXT, 
         x: pos.x, 
         y: pos.y, 
         text: "", // Start empty
         fontSize: defaultStyles.fontSize, 
         fontFamily: defaultStyles.fontFamily,
         fontStyle: defaultStyles.fontStyle,
         fill: defaultStyles.stroke, 
         strokeWidth: 0 
       };
       isDrawing.current = false;
       setTimeout(() => {
          onSelect(id);
          startTextEdit(id, newShape!);
       }, 50);
    }

    if (newShape) {
      onShapeAdd(newShape);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDrawing.current || !currentShapeId.current) return;
    
    // Konva handles throttling of Pointer events automatically, 
    // but we need to throttle adding points to React state to prevent lag.
    
    const pos = getPointerPos();
    const shapeIndex = shapes.findIndex(s => s.id === currentShapeId.current);
    if (shapeIndex === -1) return;
    
    const shape = shapes[shapeIndex];

    if (shape.type === ToolType.RECTANGLE || shape.type === ToolType.ELLIPSE) {
      onShapeUpdate(shape.id, {
        width: pos.x - shape.x,
        height: pos.y - shape.y
      }, false);
    } else if (shape.type === ToolType.LINE || shape.type === ToolType.ARROW || shape.type === ToolType.MEASURE) {
      const newPoints = [shape.points![0], shape.points![1], pos.x, pos.y];
      onShapeUpdate(shape.id, { points: newPoints }, false);
    } else if (shape.type === ToolType.PEN || shape.type === ToolType.ERASER) {
      // SMOOTHING OPTIMIZATION:
      // Skip adding points that are too close to the previous point.
      // This reduces the number of points React has to render and smoothens the line.
      const len = shape.points!.length;
      if (len >= 2) {
          const lastX = shape.points![len - 2];
          const lastY = shape.points![len - 1];
          const dist = Math.sqrt(Math.pow(pos.x - lastX, 2) + Math.pow(pos.y - lastY, 2));
          
          // 4px threshold offers a good balance between accuracy and smoothness
          if (dist < 4) return; 
      }

      const newPoints = shape.points!.concat([pos.x, pos.y]);
      onShapeUpdate(shape.id, { points: newPoints }, false);
    } else if (shape.type === ToolType.ANGLE) {
      const v = { x: shape.points![2], y: shape.points![3] };
      const p1 = { x: pos.x, y: pos.y };
      const angleRad = Math.atan2(p1.y - v.y, p1.x - v.x);
      const dist = Math.sqrt(Math.pow(p1.x - v.x, 2) + Math.pow(p1.y - v.y, 2));
      const p3Angle = angleRad + (Math.PI / 4); 
      const p3 = {
        x: v.x + Math.cos(p3Angle) * dist,
        y: v.y + Math.sin(p3Angle) * dist
      };
      onShapeUpdate(shape.id, {
        points: [p1.x, p1.y, v.x, v.y, p3.x, p3.y]
      }, false);
    }
  };

  const handlePointerUp = () => {
    if (isDrawing.current && currentShapeId.current) {
        const shape = shapes.find(s => s.id === currentShapeId.current);
        if (shape) {
             onShapeUpdate(shape.id, {}, true);
        }
    }
    isDrawing.current = false;
    currentShapeId.current = null;
  };

  const handleShapeClick = (e: any, id: string) => {
    if (currentTool === ToolType.ERASER) return;
    if (currentTool === ToolType.SELECT) {
      onSelect(id);
    }
  };

  const startTextEdit = (id: string, shape: ShapeConfig) => {
    setEditingTextId(id);
    const stage = stageRef.current;
    
    const absPos = stage.getAbsoluteTransform().point({ x: shape.x, y: shape.y });
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
       setTextEditPos({
         x: absPos.x, 
         y: absPos.y,
         width: (shape.width || 200) * stageScale,
         height: (shape.height || 50) * stageScale
       });
    }
  };

  const handleTextComplete = () => {
    if (!editingTextId) return;
    
    // Check the final value from the ref to be safe
    const textVal = textAreaRef.current?.value;
    const id = editingTextId;
    
    setEditingTextId(null);

    if (textVal === undefined || textVal.trim() === '') {
        onShapeRemove(id);
    } else {
        // Commit final state to history
        onShapeUpdate(id, { text: textVal }, true); 
    }
  };

  const handleTextDblClick = (e: any, id: string) => {
    if (currentTool === ToolType.SELECT) {
      const shape = shapes.find(s => s.id === id);
      if (shape) startTextEdit(id, shape);
    }
  };

  const getMeasurementLabel = (dist: number, unit?: string) => {
    const PPI = 72; 
    const inches = dist / PPI;
    switch (unit) {
      case 'ft': return `${(inches / 12).toFixed(2)} ft`;
      case 'cm': return `${(inches * 2.54).toFixed(2)} cm`;
      case 'in': return `${inches.toFixed(2)} in`;
      case 'mm': default: return `${(inches * 25.4).toFixed(0)} mm`;
    }
  };

  const getDistance = (pts: number[]) => {
    if (!pts || pts.length < 4) return 0;
    const dx = pts[2] - pts[0];
    const dy = pts[3] - pts[1];
    return Math.sqrt(dx*dx + dy*dy);
  };
  
  const handleAnchorDrag = (e: any, shapeId: string, pointIndex: number) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape || !shape.points) return;
    
    const newPoints = [...shape.points];
    newPoints[pointIndex] = e.target.x();
    newPoints[pointIndex + 1] = e.target.y();
    
    onShapeUpdate(shapeId, { points: newPoints });
  };

  return (
    <div 
      className="w-full h-full bg-neutral-900/90 relative overflow-hidden touch-none"
      ref={containerRef}
      style={{ cursor: cursorStyle }}
    >
      {size.width > 0 && (
        <Stage
          width={size.width}
          height={size.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={currentTool === ToolType.PAN}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={stageRef}
          style={{ backgroundColor: '#101010' }} 
        >
          {/* Layer 1: Locked Background PDF */}
          <Layer>
            {pdfDimensions && (
              <Rect 
                x={0} 
                y={0} 
                width={pdfDimensions.width} 
                height={pdfDimensions.height} 
                fill="white" 
                shadowBlur={20}
                shadowColor="black"
                shadowOpacity={0.5}
              />
            )}
            
            {bgImage && pdfDimensions && (
               <BackgroundImage 
                 src={bgImage} 
                 width={pdfDimensions.width} 
                 height={pdfDimensions.height} 
               /> 
            )}
          </Layer>
          
          {/* Layer 2: Annotations (Eraser will only affect this layer) */}
          <Layer>
            {shapes.filter(s => s.page === currentPage).map((shape) => {
               if (!shape.visible) return null;
               if (shape.id === editingTextId) return null;

               const commonProps = {
                 key: shape.id,
                 id: shape.id,
                 stroke: shape.stroke,
                 strokeWidth: shape.strokeWidth,
                 dash: shape.dash,
                 draggable: currentTool === ToolType.SELECT && shape.type !== ToolType.ANGLE && shape.type !== ToolType.ERASER, 
                 onClick: (e: any) => handleShapeClick(e, shape.id),
                 onTap: (e: any) => handleShapeClick(e, shape.id),
                 onDragEnd: (e: any) => {
                   if (shape.type !== ToolType.ANGLE) {
                      onShapeUpdate(shape.id, { x: e.target.x(), y: e.target.y() });
                   }
                 },
                 globalCompositeOperation: shape.globalCompositeOperation as any // Crucial for eraser
               };

               if (shape.type === ToolType.ERASER) {
                   return <Line 
                     {...commonProps}
                     points={shape.points}
                     lineCap="round"
                     lineJoin="round"
                     tension={0.5}
                     stroke="black" // color doesn't matter for destination-out
                     opacity={1} // Full erase strength
                     perfectDrawEnabled={false} // Optimization
                   />;
               }

               if (shape.type === ToolType.RECTANGLE) {
                 return <Rect 
                   {...commonProps} 
                   x={shape.x} 
                   y={shape.y} 
                   width={shape.width} 
                   height={shape.height} 
                   fill={hexToRgba(shape.fill, shape.opacity)} 
                   stroke={shape.stroke}
                   opacity={1}
                 />;
               }
               if (shape.type === ToolType.ELLIPSE) {
                 const radiusX = Math.abs(shape.width || 0) / 2;
                 const radiusY = Math.abs(shape.height || 0) / 2;
                 const centerX = shape.x + (shape.width || 0) / 2;
                 const centerY = shape.y + (shape.height || 0) / 2;
                 return <Ellipse 
                   {...commonProps} 
                   x={centerX} 
                   y={centerY} 
                   radiusX={radiusX}
                   radiusY={radiusY}
                   fill={hexToRgba(shape.fill, shape.opacity)} 
                   stroke={shape.stroke}
                   opacity={1}
                 />;
               }
               if (shape.type === ToolType.LINE || shape.type === ToolType.PEN) {
                 return <Line 
                   {...commonProps} 
                   points={shape.points} 
                   lineCap="round" 
                   lineJoin="round" 
                   tension={shape.type === ToolType.PEN ? 0.5 : 0} 
                   opacity={shape.opacity}
                   // Optimization for Freehand:
                   perfectDrawEnabled={false} 
                   listening={currentTool === ToolType.SELECT} // Only listen for clicks if in Select mode
                   hitStrokeWidth={currentTool === ToolType.SELECT ? 20 : 0} // easier selection
                 />;
               }
               if (shape.type === ToolType.ARROW) {
                  return <Arrow 
                    {...commonProps} 
                    points={shape.points} 
                    fill={shape.stroke} 
                    pointerLength={10} 
                    pointerWidth={10} 
                    opacity={shape.opacity}
                  />;
               }
               if (shape.type === ToolType.TEXT) {
                 return <Text 
                   {...commonProps} 
                   x={shape.x} 
                   y={shape.y} 
                   text={shape.text} 
                   fontSize={shape.fontSize || 16} 
                   fontFamily={shape.fontFamily || 'Inter'}
                   fontStyle={shape.fontStyle || 'normal'}
                   fill={shape.fill !== 'transparent' ? shape.fill : shape.stroke} 
                   strokeWidth={shape.strokeWidth > 1 ? shape.strokeWidth : 0}
                   stroke={shape.stroke}
                   opacity={shape.opacity} 
                   onDblClick={(e) => handleTextDblClick(e, shape.id)}
                   onDblTap={(e) => handleTextDblClick(e, shape.id)}
                 />;
               }
               if (shape.type === ToolType.MEASURE) {
                 const dist = getDistance(shape.points || []);
                 const label = getMeasurementLabel(dist, shape.unit);
                 const midX = (shape.points![0] + shape.points![2]) / 2;
                 const midY = (shape.points![1] + shape.points![3]) / 2;
                 return (
                   <Group {...commonProps} x={0} y={0} opacity={shape.opacity}>
                     <Arrow points={shape.points} stroke={shape.stroke} strokeWidth={shape.strokeWidth} fill={shape.stroke} pointerAtBeginning pointerLength={6} />
                     <Text x={midX} y={midY - 15} text={label} fontSize={14} fill={shape.stroke} fontFamily="Inter" fontStyle="bold" align="center" />
                   </Group>
                 );
               }
               if (shape.type === ToolType.ANGLE && shape.points) {
                  const { angle, rotation, labelX, labelY, v, p1, p3 } = calculateAngleData(shape.points);
                  const isSelected = selectedId === shape.id;
                  return (
                    <Group 
                      key={shape.id} 
                      id={shape.id}
                      onClick={(e) => handleShapeClick(e, shape.id)}
                      onTap={(e) => handleShapeClick(e, shape.id)}
                      opacity={shape.opacity}
                    >
                      <Line points={[v.x, v.y, p1.x, p1.y]} stroke={shape.stroke} strokeWidth={shape.strokeWidth} lineCap="round" />
                      <Line points={[v.x, v.y, p3.x, p3.y]} stroke={shape.stroke} strokeWidth={shape.strokeWidth} lineCap="round" />
                      <Arc 
                        x={v.x} 
                        y={v.y} 
                        innerRadius={0} 
                        outerRadius={24} 
                        angle={angle} 
                        rotation={rotation} 
                        stroke={shape.stroke} 
                        strokeWidth={1}
                        fill={hexToRgba(shape.stroke, 0.2)} 
                        opacity={1}
                      />
                      <Text 
                        x={labelX} 
                        y={labelY}
                        offsetX={10} 
                        offsetY={5}
                        text={`${angle.toFixed(1)}°`}
                        fontSize={14} 
                        fill={shape.stroke}
                        fontStyle="bold"
                        fontFamily="Inter"
                        shadowColor="black"
                        shadowBlur={2}
                        shadowOpacity={0.5}
                      />
                      {isSelected && (
                         <>
                           <Circle x={p1.x} y={p1.y} radius={8} fill="#fbbf24" stroke="white" strokeWidth={2} draggable onDragMove={(e) => handleAnchorDrag(e, shape.id, 0)} />
                           <Circle x={v.x} y={v.y} radius={8} fill="#fbbf24" stroke="white" strokeWidth={2} draggable onDragMove={(e) => handleAnchorDrag(e, shape.id, 2)} />
                           <Circle x={p3.x} y={p3.y} radius={8} fill="#fbbf24" stroke="white" strokeWidth={2} draggable onDragMove={(e) => handleAnchorDrag(e, shape.id, 4)} />
                         </>
                      )}
                    </Group>
                  );
               }
               return null;
            })}
            
            <Transformer 
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
              borderStroke="#3b82f6"
              anchorStroke="#3b82f6"
              anchorFill="#fff"
              anchorSize={8}
            />
          </Layer>
        </Stage>
      )}

      {/* Text Editing Overlay */}
      {editingTextId && textEditPos && (
        <textarea
          ref={textAreaRef}
          placeholder="Type here..."
          style={{
            position: 'absolute',
            top: textEditPos.y,
            left: textEditPos.x,
            fontSize: `${(shapes.find(s => s.id === editingTextId)?.fontSize || 16) * stageScale}px`,
            fontFamily: shapes.find(s => s.id === editingTextId)?.fontFamily || 'Inter',
            fontWeight: shapes.find(s => s.id === editingTextId)?.fontStyle?.includes('bold') ? 'bold' : 'normal',
            fontStyle: shapes.find(s => s.id === editingTextId)?.fontStyle?.includes('italic') ? 'italic' : 'normal',
            color: shapes.find(s => s.id === editingTextId)?.stroke || 'black', 
            background: 'transparent',
            border: '1px dashed #3b82f6',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            padding: 0,
            margin: 0,
            lineHeight: 1,
            zIndex: 100,
            minWidth: '200px', // More space for placeholder
            minHeight: '1.2em'
          }}
          autoFocus
          value={shapes.find(s => s.id === editingTextId)?.text || ''}
          onBlur={handleTextComplete}
          onKeyDown={(e) => {
             if (e.key === 'Enter' && !e.shiftKey) {
               e.preventDefault();
               handleTextComplete();
             }
             if (e.key === 'Escape') {
               e.preventDefault();
               handleTextComplete();
             }
          }}
          onChange={(e) => {
              const val = e.target.value;
              onShapeUpdate(editingTextId, { text: val }, false);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
      )}
    </div>
  );
};