import React, { memo } from "react";

const AuroraBackground = memo(({ activeScene, theme }: { activeScene: any, theme: string }) => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
    <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#080808]' : 'bg-[#f4f6f8]'}`} />
    {!activeScene && (
       <div className={`absolute inset-0 opacity-20 transition-all duration-1000 ${theme === 'dark' ? 'bg-gradient-to-b from-blue-900/20 to-transparent' : 'bg-gradient-to-b from-blue-100/50 to-transparent'}`} />
    )}
  </div>
));

AuroraBackground.displayName = "AuroraBackground";
export default AuroraBackground;