import React from 'react';

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const RainbowButton: React.FC<RainbowButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="relative group inline-block">
        {/* Glow Effect (Behind) */}
        <div className="absolute top-[-2px] left-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] rounded-xl rainbow-bg opacity-40 blur-[20px] group-hover:opacity-70 group-hover:blur-[30px] transition-all duration-300" />
        
        {/* Border Effect (Behind) */}
        <div className="absolute top-[-2px] left-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] rounded-xl rainbow-bg" />
        
        {/* Main Button Content (On Top) */}
        <button 
            className={`relative flex items-center justify-center gap-2.5 px-8 py-4 bg-black rounded-xl text-white font-bold transition-transform duration-200 group-hover:scale-[1.02] active:scale-[0.98] ${className}`}
            {...props}
        >
            {children}
        </button>

        <style>{`
            .rainbow-bg {
                background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000);
                background-size: 400%;
                animation: rainbow 20s linear infinite;
                z-index: 0;
            }
            @keyframes rainbow {
                0% { background-position: 0 0; }
                50% { background-position: 400% 0; }
                100% { background-position: 0 0; }
            }
        `}</style>
    </div>
  );
};
