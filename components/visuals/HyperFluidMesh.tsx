import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  activeSceneId: string | null;
  theme: 'light' | 'dark';
  viewMode: 'home' | 'player';
}

const HyperFluidMesh = memo(({ activeSceneId, theme, viewMode }: Props) => {

  // 1. 定义主页的“待机”配色 (Home Palette)
  // 修复：增加了一点点饱和度，避免看起来像死机了的纯灰色
  const homePalette = {
    orbs: [
      theme === 'dark' ? 'bg-indigo-950' : 'bg-blue-100',      // 主基调
      theme === 'dark' ? 'bg-slate-900'  : 'bg-purple-100',    // 辅助色
      theme === 'dark' ? 'bg-black'      : 'bg-white',         // 中和色
    ]
  };

  // 2. 决定使用哪套颜色
  // 如果是 Player 模式且选中了场景，用场景色；否则用主页色
  const palette = (viewMode === 'player' && activeSceneId && ELEVATED_PALETTES[activeSceneId])
    ? ELEVATED_PALETTES[activeSceneId]
    : homePalette;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none transition-colors duration-[1500ms]
      ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f8fafc]'}`}
    >
      <style>{`
        /* 120vh 修复移动端回弹露白问题 */
        .mesh-container {
            width: 120vw;
            height: 120dvh;
            position: absolute;
            top: -10%;
            left: -10%;
            will-change: transform;
        }

        @keyframes flow-one {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20vw, -10vh) scale(1.4); }
          66% { transform: translate(-10vw, 20vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes flow-two {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-20vw, -15vh) scale(1.2); }
          66% { transform: translate(15vw, 15vh) scale(0.7); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes flow-three {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(0, 10vh) rotate(180deg) scale(1.3); }
          100% { transform: translate(0, 0) rotate(360deg) scale(1); }
        }
        @keyframes liquid-morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        /* 速度控制：Home 页慢速优雅，Player 页快速活跃 */
        .speed-home { animation-duration: 25s, 30s !important; }
        .speed-player { animation-duration: 12s, 10s !important; }

        .animate-flow-1 { animation: flow-one infinite ease-in-out, liquid-morph infinite ease-in-out; }
        .animate-flow-2 { animation: flow-two infinite ease-in-out, liquid-morph infinite ease-in-out reverse; }
        .animate-flow-3 { animation: flow-three infinite ease-in-out, liquid-morph infinite ease-in-out; }

        .gpu-layer { will-change: transform, border-radius; transform-style: preserve-3d; backface-visibility: hidden; }
      `}</style>

      {/* 噪点层：增加质感 */}
      <div className="absolute inset-0 opacity-[0.06] z-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="mesh-container">
        {/*
           核心层：
           Home 模式：低饱和 (saturate-100)，低不透明度 (opacity-70)，颜色淡雅。
           Player 模式：高饱和 (saturate-200)，高不透明度，颜色浓烈。
        */}
        <div className={`absolute inset-0 filter blur-[90px] contrast-125 transition-all duration-[2000ms]
            ${viewMode === 'home' ? 'saturate-[1.1] opacity-70' : 'saturate-[2] opacity-100'}
            ${theme === 'dark' ? 'mix-blend-hard-light' : 'mix-blend-multiply'}`}>

          {/* Orb 1 */}
          <div className={`gpu-layer absolute top-[-10%] left-[-10%] w-[90vw] h-[90vw] rounded-full animate-flow-1 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[0]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
          />

          {/* Orb 2 */}
          <div className={`gpu-layer absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] rounded-full animate-flow-2 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[1]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-lighten'}`}
          />

          {/* Orb 3 (中间的搅拌球) */}
          <div className={`gpu-layer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full animate-flow-3 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[2]}
             ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-overlay'}`}
          />
        </div>
      </div>

      {/* 玻璃光泽 (Glass Glare) - 让画面看起来更通透 */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000
         ${viewMode === 'home' ? 'opacity-40' : 'opacity-80'}
         ${theme === 'dark'
            ? 'bg-gradient-to-tr from-black/20 via-transparent to-white/5'
            : 'bg-gradient-to-tr from-transparent via-white/30 to-white/50'}`}
      />
    </div>
  );
});

HyperFluidMesh.displayName = "HyperFluidMesh";
export default HyperFluidMesh;