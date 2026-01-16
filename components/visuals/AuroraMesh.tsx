import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  // 修改：移除 isPlaying (我们希望它一直动)，改为传入 distinct mode
  activeSceneId: string | null;
  theme: 'light' | 'dark';
  viewMode: 'home' | 'player'; // 新增：知道当前是在哪个页面
}

const AuroraMesh = memo(({ activeSceneId, theme, viewMode }: Props) => {

  // 1. 定义主页的“中性”配色 (Home Palette)
  // Light: 浅灰/淡蓝/淡紫 (干净)
  // Dark: 深黑/深灰/微光 (深邃)
  const homePalette = {
    orbs: [
      theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200',  // 主球
      theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-200',  // 副球
      theme === 'dark' ? 'bg-slate-900' : 'bg-zinc-100', // 搅拌球
    ]
  };

  // 2. 获取当前配色：如果是 Player 模式且有场景，用场景色；否则用主页色
  const targetPalette = (viewMode === 'player' && activeSceneId && ELEVATED_PALETTES[activeSceneId])
    ? ELEVATED_PALETTES[activeSceneId]
    : homePalette;

  return (
    <div
      className={`fixed -top-[10%] -left-[10%] w-[120vw] z-0 overflow-hidden pointer-events-none select-none transition-colors duration-[2000ms]
      ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f8fafc]'}`}
      style={{
        willChange: 'transform',
        height: '120dvh',
        minHeight: '120vh'
      }}
    >
      <style>{`
        /* 保持之前的动画定义不变，或者稍微调慢一点 flow 动画的时间 */
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
           根据 viewMode 调整动画速度
           主页(Home) = 慢速呼吸感
           播放页(Player) = 快速流动感
        */
        .speed-home { animation-duration: 25s, 20s !important; }
        .speed-player { animation-duration: 12s, 8s !important; }

        .animate-flow-1 { animation: flow-one infinite ease-in-out, liquid-morph infinite ease-in-out; }
        .animate-flow-2 { animation: flow-two infinite ease-in-out, liquid-morph infinite ease-in-out reverse; }
        .animate-flow-3 { animation: flow-three infinite ease-in-out, liquid-morph infinite ease-in-out; }

        .gpu-layer { will-change: transform, border-radius; transform-style: preserve-3d; backface-visibility: hidden; }
      `}</style>

      {/* 噪点层 */}
      <div className="absolute inset-0 opacity-[0.07] z-30 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className={`relative w-full h-full transition-opacity duration-1000 opacity-100`}>
        {/*
           核心逻辑：
           如果 viewMode === 'home'，降低饱和度 (saturate-50) 和透明度 (opacity-50)，让文字更清晰。
           如果 viewMode === 'player'，火力全开 (saturate-200)。
        */}
        <div className={`absolute inset-0 filter blur-[80px] contrast-125 transition-all duration-[2000ms]
            ${viewMode === 'home' ? 'saturate-[0.8] opacity-60' : 'saturate-[2] opacity-100'}
            ${theme === 'dark' ? 'mix-blend-hard-light' : 'mix-blend-multiply'}`}>

          {/* Orb 1 */}
          <div className={`gpu-layer absolute top-0 left-[-20%] w-[120vw] h-[100vw] animate-flow-1 transition-colors duration-[3000ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${targetPalette.orbs[0]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
          />

          {/* Orb 2 */}
          <div className={`gpu-layer absolute bottom-0 right-[-20%] w-[120vw] h-[100vw] animate-flow-2 transition-colors duration-[3000ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${targetPalette.orbs[1]}
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-lighten'}`}
          />

          {/* Orb 3 */}
          <div className={`gpu-layer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] animate-flow-3 transition-colors duration-[3000ms]
             ${viewMode === 'home' ? 'speed-home' : 'speed-player'}
             ${targetPalette.orbs[2]}
             ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-overlay'}`}
          />
        </div>
      </div>

      {/* 玻璃光泽 - 主页时稍微弱一点 */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000
         ${viewMode === 'home' ? 'opacity-30' : 'opacity-100'}
         ${theme === 'dark'
            ? 'bg-gradient-to-tr from-black/20 via-transparent to-white/5'
            : 'bg-gradient-to-tr from-transparent via-white/20 to-white/40'}`}
      />
    </div>
  );
});

AuroraMesh.displayName = "AuroraMesh";
export default AuroraMesh;