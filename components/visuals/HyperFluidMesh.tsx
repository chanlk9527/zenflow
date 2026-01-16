import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  activeSceneId: string | null;
  theme: 'light' | 'dark';
  viewMode: 'home' | 'player';
}

const HyperFluidMesh = memo(({ activeSceneId, theme, viewMode }: Props) => {

  // ---------------------------------------------------------------------------
  // 1. 配色逻辑 (来自 Input 1，但适配 Input 2 的高饱和度环境)
  // ---------------------------------------------------------------------------
  const homePalette = {
    orbs: [
      theme === 'dark' ? 'bg-indigo-600' : 'bg-blue-400', // 加深颜色以适应强光照
      theme === 'dark' ? 'bg-purple-600' : 'bg-indigo-400',
      theme === 'dark' ? 'bg-teal-600'   : 'bg-purple-300',
    ]
  };

  const palette = (viewMode === 'player' && activeSceneId && ELEVATED_PALETTES[activeSceneId])
    ? ELEVATED_PALETTES[activeSceneId]
    : homePalette;

  return (
    // ---------------------------------------------------------------------------
    // 2. 容器布局 (100% 保留 Input 2)
    // 关键点：-top-[10%] 和 w-[120%] 是产生沉浸感和防止露边的核心
    // ---------------------------------------------------------------------------
    <div
      className={`fixed -top-[10%] -left-[10%] w-[120%] h-[120%] z-0 overflow-hidden pointer-events-none select-none transition-colors duration-700
      ${theme === 'dark' ? 'bg-black' : 'bg-white'}`} // 使用纯黑白，保留 Input 2 的强对比风格
      style={{ willChange: 'transform' }}
    >
      <style>{`
        /* -----------------------------------------------------------------------
           3. 动画关键帧 (100% 保留 Input 2)
           不做任何削弱，保留大位移(30vw)和剧烈缩放(scale 1.5/0.6)
           ----------------------------------------------------------------------- */
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

        @keyframes liquid-morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        /*
           4. 速度控制
           Input 2 原版速度非常快 (12s)，用于 Player 模式。
           Home 模式仅将时间拉长到 22s，但轨迹幅度保持完全一致。
        */
        .speed-player-1 { animation-duration: 12s, 8s !important; }
        .speed-player-2 { animation-duration: 15s, 10s !important; }
        .speed-player-3 { animation-duration: 10s, 12s !important; }

        .speed-home-1 { animation-duration: 22s, 15s !important; }
        .speed-home-2 { animation-duration: 25s, 18s !important; }
        .speed-home-3 { animation-duration: 20s, 20s !important; }

        .animate-flow-base { animation-timing-function: ease-in-out; animation-iteration-count: infinite; }

        /* 绑定动画 */
        .anim-1 { animation-name: flow-one, liquid-morph; }
        .anim-2 { animation-name: flow-two, liquid-morph; animation-direction: normal, reverse; }
        .anim-3 { animation-name: flow-three, liquid-morph; }

        .gpu-layer {
            will-change: transform, border-radius;
            transform-style: preserve-3d;
            backface-visibility: hidden;
        }
      `}</style>

      {/* 噪点层：保留 Input 2 的 0.08 不透明度 */}
      <div
        className="absolute inset-0 opacity-[0.08] z-30 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="relative w-full h-full transition-opacity duration-1000">

        {/*
           5. 核心混合层 (保留 Input 2 的激进滤镜参数)
           blur-80px, saturate-200, contrast-125 都在。
           Home 模式下稍微降一点点 saturate 到 1.5，防止作为背景时过于抢眼，但依然保持鲜艳。
        */}
        <div className={`absolute inset-0 filter blur-[80px] contrast-125 transition-all duration-[2000ms]
            ${viewMode === 'home' ? 'saturate-[1.5] opacity-90' : 'saturate-[2.0] opacity-100'}
            ${theme === 'dark' ? 'mix-blend-hard-light' : 'mix-blend-multiply'}`}>

          {/*
             Blob 1: 100% 保留 Input 2 的尺寸/位置
             size: w-[120vw] h-[100vw]
             pos: left-[-20%]
          */}
          <div className={`gpu-layer animate-flow-base anim-1 absolute top-0 left-[-20%] w-[120vw] h-[100vw] opacity-80 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home-1' : 'speed-player-1'}
             ${palette.orbs[0]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
          />

          {/*
             Blob 2: 100% 保留 Input 2 的尺寸/位置
             size: w-[120vw] h-[100vw]
             pos: right-[-20%]
          */}
          <div className={`gpu-layer animate-flow-base anim-2 absolute bottom-0 right-[-20%] w-[120vw] h-[100vw] opacity-80 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home-2' : 'speed-player-2'}
             ${palette.orbs[1]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-lighten'}`}
          />

          {/*
             Blob 3: 100% 保留 Input 2 的尺寸/位置
             size: w-[100vw] h-[100vw]
             pos: center
          */}
          <div className={`gpu-layer animate-flow-base anim-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] opacity-70 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home-3' : 'speed-player-3'}
             ${palette.orbs[2]}
             ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-overlay'}`}
          />

        </div>
      </div>

      {/*
         6. 高光玻璃层 (保留 Input 2 的光泽感)
         仅在 Home 模式稍微降低不透明度，保留质感
      */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000
         ${viewMode === 'home' ? 'opacity-50' : 'opacity-100'}
         ${theme === 'dark'
            ? 'bg-gradient-to-tr from-black/20 via-transparent to-white/5'
            : 'bg-gradient-to-tr from-transparent via-white/20 to-white/40'}`}
      />

    </div>
  );
});

HyperFluidMesh.displayName = "HyperFluidMesh";
export default HyperFluidMesh;