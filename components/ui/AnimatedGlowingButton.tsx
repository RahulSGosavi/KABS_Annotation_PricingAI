import React from 'react';
import { cn } from '../../lib/utils';

interface AnimatedGlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  containerClassName?: string;
}

export const AnimatedGlowingButton: React.FC<AnimatedGlowingButtonProps> = ({ 
  children, 
  className,
  containerClassName,
  ...props 
}) => {
  return (
    <div className={cn("relative flex items-center justify-center group isolate", containerClassName)}>
      {/* Outer Glow - Layer 1 */}
      <div className="absolute z-[-1] -inset-[1px] rounded-xl overflow-hidden blur-[3px] opacity-75 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rotate-60 
            bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)] 
            transition-all duration-2000 group-hover:-rotate-120" />
      </div>

      {/* Middle Glow - Layer 2 */}
      <div className="absolute z-[-1] -inset-[1px] rounded-xl overflow-hidden blur-[3px] opacity-75 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rotate-[82deg]
            bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)] 
            transition-all duration-2000 group-hover:-rotate-[98deg]" />
      </div>

      {/* Inner Glow - Layer 3 */}
      <div className="absolute z-[-1] -inset-[1px] rounded-xl overflow-hidden blur-[0.5px] opacity-100">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rotate-70 brightness-130
            bg-[conic-gradient(#1c191c,#402fb5_5%,#1c191c_14%,#1c191c_50%,#cf30aa_60%,#1c191c_64%)] 
            transition-all duration-2000 group-hover:-rotate-110" />
      </div>

      {/* Button Content */}
      <button 
        className={cn(
            "relative z-10 bg-[#010201] text-white rounded-lg w-full h-full flex items-center justify-center transition-transform active:scale-95 px-6 py-3 font-medium tracking-wide",
            className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};
