import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  isPlaying: boolean;
  activeSceneId: string | null;
  theme: 'light' | 'dark';
}

const AppleStyleMesh = memo(({ isPlaying, activeSceneId, theme }: Props) => {
  const palette = activeSceneId && ELEVATED_PALETTES[activeSceneId]
    ? ELEVATED_PALETTES[activeSceneId]
    : ELEVATED_PALETTES.focus;

  return (
    <div className={`fixed inset-0 z-0 flex items-center justify-center transition-opacity duration-[2000ms] overflow-hidden pointer-events-none ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>
       <style>{`
         @keyframes blob-bounce {
           0% { transform: translate(0, 0) scale(1); }
           33% { transform: translate(30px, -50px) scale(1.1); }
           66% { transform: translate(-20px, 20px) scale(0.9); }
           100% { transform: translate(0, 0) scale(1); }
         }
         @keyframes blob-spin-slow {
           0% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(180deg) scale(1.2); }
           100% { transform: rotate(360deg) scale(1); }
         }
         @keyframes blob-flow {
           0% { transform: translate(0, 0) rotate(0deg); }
           33% { transform: translate(10%, 10%) rotate(120deg); }
           66% { transform: translate(-5%, -10%) rotate(240deg); }
           100% { transform: translate(0, 0) rotate(360deg); }
         }
         .mesh-mask {
            mask-image: radial-gradient(circle at center, black 30%, transparent 95%);
            -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 95%);
         }
         .animate-blob-1 { animation: blob-flow 25s infinite linear; }
         .animate-blob-2 { animation: blob-flow 30s infinite linear reverse; }
         .animate-blob-3 { animation: blob-bounce 20s infinite ease-in-out; }

         .paused-anim * { animation-play-state: paused !important; }
       `}</style>

       <div className={`relative w-[200%] h-[200%] md:w-[150%] md:h-[150%] mesh-mask flex items-center justify-center
          ${isPlaying ? '' : 'paused-anim'}`}>

          <div className={`relative w-full h-full filter blur-[80px] md:blur-[100px] saturate-[1.5] transition-all duration-1000
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply opacity-80'}`}>

              <div className={`absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full opacity-60 animate-blob-1 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[0]} mix-blend-screen`} />

              <div className={`absolute bottom-1/4 right-1/4 w-[50%] h-[50%] rounded-full opacity-60 animate-blob-2 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[1]} mix-blend-screen`} />

              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full opacity-80 animate-blob-3 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[2]} mix-blend-plus-lighter`} />
          </div>
       </div>
    </div>
  );
});

AppleStyleMesh.displayName = "AppleStyleMesh";
export default AppleStyleMesh;