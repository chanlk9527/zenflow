import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  activeSceneId: string | null;
  theme: 'light' | 'dark';
  viewMode: 'home' | 'player';
}

const HyperFluidMesh = memo(({ activeSceneId, theme, viewMode }: Props) => {

  // 🎨 修复点 1: 加强主页配色的对比度
  // 之前的颜色太淡，被混合模式吃掉了。现在使用更明显的颜色。
  const homePalette = {
    orbs: [
      // Light模式: 用 -300/-400 级，而不是 -100 (Multiply模式下颜色越深越明显)
      // Dark模式: 用 -600/-500 级，而不是 -900 (Screen模式下颜色越亮越明显)
      theme === 'dark' ? 'bg-indigo-600' : 'bg-blue-300',
      theme === 'dark' ? 'bg-purple-600' : 'bg-indigo-300',
      theme === 'dark' ? 'bg-teal-600'   : 'bg-purple-200',
    ]
  };

  // 决定使用哪套颜色
  const palette = (viewMode === 'player' && activeSceneId && ELEVATED_PALETTES[activeSceneId])
    ? ELEVATED_PALETTES[activeSceneId]
    : homePalette;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none transition-colors duration-[1500ms]
      ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f0f2f5]'}`} // Light背景稍微灰一点点，让白色高光更明显
    >
      <style>{`
        .mesh-container {
            width: 140vw; /* 加大尺寸，防止移动时露边 */
            height: 140dvh;
            position: absolute;
            top: -20%;
            left: -20%;
            will-change: transform;
        }

        /* 修复点 2: 调整主页动画轨迹，让它们更靠近中心 */
        @keyframes flow-one {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15vw, -10vh) scale(1.2); }
          66% { transform: translate(-10vw, 15vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes flow-two {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-15vw, -10vh) scale(1.1); }
          66% { transform: translate(15vw, 10vh) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes flow-three {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(0, 5vh) rotate(180deg) scale(1.2); }
          100% { transform: translate(0, 0) rotate(360deg) scale(1); }
        }
        @keyframes liquid-morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        .speed-home { animation-duration: 25s, 30s !important; }
        .speed-player { animation-duration: 12s, 10s !important; }

        .animate-flow-1 { animation: flow-one infinite ease-in-out, liquid-morph infinite ease-in-out; }
        .animate-flow-2 { animation: flow-two infinite ease-in-out, liquid-morph infinite ease-in-out reverse; }
        .animate-flow-3 { animation: flow-three infinite ease-in-out, liquid-morph infinite ease-in-out; }

        .gpu-layer { will-change: transform, border-radius; transform-style: preserve-3d; backface-visibility: hidden; }
      `}</style>

      {/* 噪点层 */}
      <div className="absolute inset-0 opacity-[0.05] z-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="mesh-container">
        {/*
           🎨 修复点 3: 可见性调整
           Home: opacity 提高到 0.9 (之前是 0.7)，saturate 1.2 (保持柔和但可见)
           Player: saturate 2.2 (保持强烈的极光感)
        */}
        <div className={`absolute inset-0 filter blur-[80px] contrast-125 transition-all duration-[2000ms]
            ${viewMode === 'home' ? 'saturate-[1.2] opacity-90' : 'saturate-[2.2] opacity-100'}
            ${theme === 'dark' ? 'mix-blend-hard-light' : 'mix-blend-multiply'}`}>

          {/* Orb 1 */}
          <div className={`gpu-layer absolute top-[-5%] left-[-5%] w-[80vw] h-[80vw] rounded-full animate-flow-1 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[0]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
          />

          {/* Orb 2 */}
          <div className={`gpu-layer absolute bottom-[-5%] right-[-5%] w-[80vw] h-[80vw] rounded-full animate-flow-2 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[1]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-lighten'}`}
          />

          {/* Orb 3 */}
          <div className={`gpu-layer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full animate-flow-3 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[2]}
             ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-overlay'}`}
          />
        </div>
      </div>

      {/* 玻璃光泽 */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000
         ${viewMode === 'home' ? 'opacity-50' : 'opacity-80'}
         ${theme === 'dark'
            ? 'bg-gradient-to-tr from-black/20 via-transparent to-white/5'
            : 'bg-gradient-to-tr from-transparent via-white/40 to-white/60'}`}
      />
    </div>
  );
});

HyperFluidMesh.displayName = "HyperFluidMesh";
export default HyperFluidMesh;