import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  activeSceneId: string | null;
  theme: 'light' | 'dark';
  viewMode: 'home' | 'player';
}

const HyperFluidMesh = memo(({ activeSceneId, theme, viewMode }: Props) => {

  // ---------------------------------------------------------------------------
  // 1. 配色逻辑 (保留自 ViewMode 版本)
  // ---------------------------------------------------------------------------

  // 主页专用配色：增强对比度，防止被混合模式过度冲淡
  const homePalette = {
    orbs: [
      theme === 'dark' ? 'bg-indigo-600' : 'bg-blue-300',
      theme === 'dark' ? 'bg-purple-600' : 'bg-indigo-300',
      theme === 'dark' ? 'bg-teal-600'   : 'bg-purple-200',
    ]
  };

  // 根据模式决定使用哪套颜色
  const palette = (viewMode === 'player' && activeSceneId && ELEVATED_PALETTES[activeSceneId])
    ? ELEVATED_PALETTES[activeSceneId]
    : homePalette;

  return (
    // ---------------------------------------------------------------------------
    // 2. 容器布局 (采用无 ViewMode 版本的激进布局)
    // 使用 -10% 定位和 120% 宽高，确保动画即使大幅度偏移也不会露出背景边缘
    // ---------------------------------------------------------------------------
    <div
      className={`fixed -top-[10%] -left-[10%] w-[120%] h-[120%] z-0 overflow-hidden pointer-events-none select-none transition-colors duration-[1500ms]
      ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f0f2f5]'}`}
      style={{ willChange: 'transform' }} // 强制 GPU 提升
    >
      <style>{`
        /* -----------------------------------------------------------------------
           3. 动画关键帧 (采用无 ViewMode 版本的激进流体轨迹)
           移动幅度大 (30vw)，形变明显
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
           4. 速度控制 (融合逻辑)
           Home: 慢速 (25s+)，营造氛围
           Player: 快速 (12s+)，保持原版 Aggressive 效果
        */
        .speed-home { animation-duration: 25s, 20s !important; }
        .speed-player { animation-duration: 12s, 10s !important; }

        .animate-flow-1 { animation: flow-one infinite ease-in-out, liquid-morph infinite ease-in-out; }
        .animate-flow-2 { animation: flow-two infinite ease-in-out, liquid-morph infinite ease-in-out reverse; }
        .animate-flow-3 { animation: flow-three infinite ease-in-out, liquid-morph infinite ease-in-out; }

        .gpu-layer {
            will-change: transform, border-radius;
            transform-style: preserve-3d;
            backface-visibility: hidden;
        }
      `}</style>

      {/* 噪点层 (保留高透明度 0.08) */}
      <div className="absolute inset-0 opacity-[0.08] z-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="relative w-full h-full">
        {/*
           5. 核心混合层 (融合逻辑)
           Home: 降低饱和度和不透明度，不干扰 UI
           Player: 提高饱和度 (saturate-200) 和对比度，还原极光感
        */}
        <div className={`absolute inset-0 filter blur-[80px] contrast-125 transition-all duration-[2000ms]
            ${viewMode === 'home' ? 'saturate-[1.2] opacity-80' : 'saturate-[2.0] opacity-100'}
            ${theme === 'dark' ? 'mix-blend-hard-light' : 'mix-blend-multiply'}`}>

          {/*
             Blob 1: 使用 Input 2 的大尺寸 (120vw) + Input 1 的混合模式逻辑
          */}
          <div className={`gpu-layer absolute top-0 left-[-20%] w-[120vw] h-[100vw] animate-flow-1 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[0]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
          />

          {/* Blob 2 */}
          <div className={`gpu-layer absolute bottom-0 right-[-20%] w-[120vw] h-[100vw] animate-flow-2 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[1]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-lighten'}`}
          />

          {/* Blob 3 */}
          <div className={`gpu-layer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] animate-flow-3 transition-colors duration-[2500ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${palette.orbs[2]}
             ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-overlay'}`}
          />
        </div>
      </div>

      {/*
         6. 玻璃光泽层 (保留 viewMode 区分逻辑)
         Player 模式下更亮，Home 模式下减弱以免影响文字阅读
      */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000
         ${viewMode === 'home' ? 'opacity-40' : 'opacity-70'}
         ${theme === 'dark'
            ? 'bg-gradient-to-tr from-black/20 via-transparent to-white/5'
            : 'bg-gradient-to-tr from-transparent via-white/30 to-white/50'}`}
      />
    </div>
  );
});

HyperFluidMesh.displayName = "HyperFluidMesh";
export default HyperFluidMesh;