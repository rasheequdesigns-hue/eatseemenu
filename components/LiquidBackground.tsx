import React from 'react';

interface LiquidBackgroundProps {
  children: React.ReactNode;
}

export function LiquidBackground({ children }: LiquidBackgroundProps) {
  return (
    <div className="min-h-screen w-full bg-[#00080f] relative overflow-y-auto">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px] animate-float-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-800/10 rounded-full blur-[120px] animate-float-medium"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-full w-full">
        {children}
      </div>
    </div>
  );
}

