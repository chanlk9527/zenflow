import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  isPlaying: boolean;
  activeSceneId: string | null;
  theme: 'light' | 'dark';
}

const HyperFluidMesh = memo(({ isPlaying, activeSceneId, theme }: Props) => {
  const palette = activeSceneId && ELEVATED_PALETTES[activeSceneId]
    ? ELEVATED_PALETTES[activeSceneId]
    : ELEVATED_PALETTES.focus;

  return (
    // 修复点：
    // 1. 不再使用 inset-0，而是使用负定位 (-top-[10%])
    // 2. 宽高设为 120%，确保覆盖所有回弹区域
    // 3. 加上 will-change-transform 确保持续渲染
    <div className={`fixed -top-[10%] -left-[10%] w-[120%] h-[120%] z-0 overflow-hidden pointer-events-none select-none transition-colors duration-700
      ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
      style={{ willChange: 'transform' }} // 强制 GPU 渲染整个背景层
    >

      <style>{`
        /* 激进的流动动画 (Aggressive Flow) */
        @keyframes flow-one {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30vw, -40vh) scale(1.5); }
          66% { transform: translate(-20vw, 20vh) scale(0.8); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes flow-two {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30vw, -20vh) scale(1.3); }
          66% { transform: translate(25vw, 25vh) scale(0.6); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes flow-three {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(0vw, 30vh) scale(1.6) rotate(180deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }

        /* 快速形变 (Quick Morph) */
        @keyframes liquid-morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        .animate-flow-1 { animation: flow-one 12s infinite ease-in-out, liquid-morph 8s infinite ease-in-out; }
        .animate-flow-2 { animation: flow-two 15s infinite ease-in-out, liquid-morph 10s infinite ease-in-out reverse; }
        .animate-flow-3 { animation: flow-three 10s infinite ease-in-out, liquid-morph 12s infinite ease-in-out; }

        .gpu-layer {
            will-change: transform, border-radius;
            transform-style: preserve-3d;
            backface-visibility: hidden; /* 防止移动端闪烁 */
        }

        .paused-anim * { animation-play-state: paused !important; }
      `}</style>

      {/* 噪点层：同样铺满 120% */}
      <div
        className="absolute inset-0 opacity-[0.08] z-30 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className={`relative w-full h-full transition-opacity duration-1000
        ${isPlaying ? 'opacity-100' : 'opacity-50'}
        ${isPlaying ? '' : 'paused-anim'}`}>

        {/* 核心混合层 */}
        <div className={`absolute inset-0 filter blur-[80px] saturate-200 contrast-125
            ${theme === 'dark' ? 'mix-blend-hard-light' : 'mix-blend-multiply'}`}>

          {/* Blob 1 */}
          <div className={`gpu-layer absolute top-0 left-[-20%] w-[120vw] h-[100vw] opacity-80 animate-flow-1
             ${palette.orbs[0]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
          />

          {/* Blob 2 */}
          <div className={`gpu-layer absolute bottom-0 right-[-20%] w-[120vw] h-[100vw] opacity-80 animate-flow-2
             ${palette.orbs[1]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-lighten'}`}
          />

          {/* Blob 3 */}
          <div className={`gpu-layer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] opacity-70 animate-flow-3
             ${palette.orbs[2]}
             ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-overlay'}`}
          />

        </div>
      </div>

      {/* 高光玻璃层 */}
      <div className={`absolute inset-0 z-20 pointer-events-none
         ${theme === 'dark'
            ? 'bg-gradient-to-tr from-black/20 via-transparent to-white/5'
            : 'bg-gradient-to-tr from-transparent via-white/20 to-white/40'}`}
      />

    </div>
  );
});

HyperFluidMesh.displayName = "HyperFluidMesh";
export default HyperFluidMesh;