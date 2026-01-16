import React, { memo } from "react";
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  isPlaying: boolean;
  activeSceneId: string | null;
  theme: 'light' | 'dark';
}

const AuroraMesh = memo(({ isPlaying, activeSceneId, theme }: Props) => {
  const palette = activeSceneId && ELEVATED_PALETTES[activeSceneId]
    ? ELEVATED_PALETTES[activeSceneId]
    : ELEVATED_PALETTES.focus;

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none select-none transition-colors duration-1000
      ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#ffffff]'}`}>

      <style>{`
        /*
           核心魔法：Border-radius 变形动画
           这是让圆球看起来像"液体"的关键。
           我们在旋转的同时，改变四个角的半径，让它看起来在不断蠕动。
        */
        @keyframes morph-flow {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0, 0) rotate(0deg); }
          25% { border-radius: 45% 55% 50% 50% / 55% 45% 40% 60%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: translate(10%, 5%) rotate(120deg); }
          75% { border-radius: 45% 55% 40% 60% / 55% 45% 50% 50%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0, 0) rotate(360deg); }
        }

        /*
           呼吸效果：让颜色忽深忽浅
        */
        @keyframes deep-breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }

        .animate-morph-slow { animation: morph-flow 25s infinite linear; }
        .animate-morph-mid { animation: morph-flow 20s infinite linear reverse; }
        .animate-morph-fast { animation: morph-flow 18s infinite linear; }
        .animate-breathe { animation: deep-breathe 10s infinite ease-in-out; }

        .paused-anim * { animation-play-state: paused !important; }

        /*
           手机端专属优化：开启 GPU 加速，防止发热卡顿
        */
        .gpu-accelerated {
            transform: translate3d(0,0,0);
            will-change: transform, border-radius;
        }
      `}</style>

      {/*
         第一层：SVG 噪点 (增强高级感)
         在手机的高 PPI 屏幕上，这能有效防止渐变出现波纹(Banding)。
      */}
      <div
        className="absolute inset-0 opacity-[0.06] z-20 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/*
         容器：在手机上，我们需要让容器比屏幕大很多 (150%)，
         这样用户看到的只是局部，不会看到球体的边缘。
      */}
      <div className={`relative w-full h-full flex items-center justify-center scale-150 md:scale-125 transition-opacity duration-[2000ms]
         ${isPlaying ? 'opacity-100' : 'opacity-40'}
         ${isPlaying ? '' : 'paused-anim'}`}>

         {/*
            第二层：高斯模糊混合层
            theme === 'dark' ? plus-lighter (霓虹感) : multiply (水彩感)
         */}
         <div className={`relative w-full h-full filter blur-[60px] md:blur-[100px]
            ${theme === 'dark' ? 'saturate-[2] mix-blend-hard-light' : 'saturate-[1.8] mix-blend-multiply'}`}>

            {/*
               流体 1：主色
               位置：左上 -> 往右下流动
            */}
            <div className={`gpu-accelerated absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full mix-blend-multiply opacity-80 animate-morph-slow transition-colors duration-[3000ms]
               ${palette.orbs[0]}
               ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
            />

            {/*
               流体 2：对比色
               位置：右下 -> 往左上流动
            */}
            <div className={`gpu-accelerated absolute bottom-[-10%] right-[-20%] w-[85vw] h-[90vw] rounded-full mix-blend-multiply opacity-80 animate-morph-mid transition-colors duration-[3000ms]
               ${palette.orbs[1]}
               ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
            />

            {/*
               流体 3：高光色
               位置：中心 -> 呼吸并变形
               这个层在 Dark 模式下非常重要，提供那种"发光"的感觉
            */}
            <div className={`gpu-accelerated absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full opacity-60 animate-morph-fast transition-colors duration-[3000ms]
               ${palette.orbs[2]}
               ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-overlay'}`}
            />
         </div>
      </div>

      {/*
         第三层：氛围晕影 (Vignette)
         给屏幕四周加一点点暗角，让视线集中在中心，这能显著提升画面的"电影感"。
      */}
      <div className={`absolute inset-0 z-10 pointer-events-none
         ${theme === 'dark'
            ? 'bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]'
            : 'bg-[radial-gradient(circle_at_center,transparent_50%,rgba(255,255,255,0.6)_100%)]'}`}
      />

    </div>
  );
});

AuroraMesh.displayName = "AuroraMesh";
export default AuroraMesh;