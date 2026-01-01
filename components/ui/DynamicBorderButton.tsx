import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface DynamicBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const DynamicBorderButton: React.FC<DynamicBorderButtonProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationId: number;
    
    const animateBorder = () => {
      const now = Date.now() / 1000;
      const speed = 0.5; // Animation speed from reference
      
      // Calculate positions based on time - math from reference component
      const topX = Math.sin(now * speed) * 100;
      const rightY = Math.cos(now * speed) * 100;
      const bottomX = Math.sin(now * speed + Math.PI) * 100;
      const leftY = Math.cos(now * speed + Math.PI) * 100;
      
      // Apply positions to elements
      if (topRef.current) topRef.current.style.transform = `translateX(${topX}%)`;
      if (rightRef.current) rightRef.current.style.transform = `translateY(${rightY}%)`;
      if (bottomRef.current) bottomRef.current.style.transform = `translateX(${bottomX}%)`;
      if (leftRef.current) leftRef.current.style.transform = `translateY(${leftY}%)`;
      
      animationId = requestAnimationFrame(animateBorder);
    };
    
    animationId = requestAnimationFrame(animateBorder);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <button 
      className={cn(
        "relative group bg-gray-900 rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl",
        className
      )}
      {...props}
    >
      {/* Animated border elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden z-10">
        <div 
          ref={topRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-500 to-transparent"
        ></div>
      </div>
      
      <div className="absolute top-0 right-0 w-[1px] h-full overflow-hidden z-10">
        <div 
          ref={rightRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent"
        ></div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden z-10">
        <div 
          ref={bottomRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-500 to-transparent"
        ></div>
      </div>
      
      <div className="absolute top-0 left-0 w-[1px] h-full overflow-hidden z-10">
        <div 
          ref={leftRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent"
        ></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-20 m-[1px] bg-dark-900/90 backdrop-blur-sm rounded-[7px] px-6 py-2.5 flex items-center justify-center gap-2">
        {children}
      </div>
      
      {/* Hover glow effects */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-brand-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};
