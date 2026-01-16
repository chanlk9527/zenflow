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
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-neutral-50 dark:bg-black transition-colors duration-1000`}>
      <style>{`
        /*
           核心技巧：Stripe 风格的关键在于“巨大的旋转”，而不是简单的弹跳。
           这会让颜色看起来像是在慢慢“流过”屏幕。
        */
        @keyframes gradient-rotate {
            0% { transform: rotate(0deg) scale(1.5) translate(0, 0); }
            50% { transform: rotate(180deg) scale(1.6) translate(-5%, -5%); }
            100% { transform: rotate(360deg) scale(1.5) translate(0, 0); }
        }

        @keyframes gradient-pulse {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
        }

        /*
           SVG 噪点：这是让渐变看起来“高级”的秘密武器。
           它打破了数字渐变的平滑感，增加了纸张/磨砂质感。
        */
        .noise-texture {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
        }

        .animate-spin-slow {
            animation: gradient-rotate 40s infinite linear;
        }

        .animate-pulse-slow {
            animation: gradient-pulse 15s infinite ease-in-out;
        }

        .paused-anim * {
            animation-play-state: paused !important;
        }
      `}</style>

      {/*
         容器：使用 opacity 控制播放/暂停时的淡入淡出，
         而不是硬切，保持高级感。
      */}
      <div className={`relative w-full h-full transition-opacity duration-[1500ms]
          ${isPlaying ? 'opacity-100' : 'opacity-20'}
          ${isPlaying ? '' : 'paused-anim'}`}
      >

        {/*
           混合容器：
           theme === 'dark' ? 'saturate-[1.8]' : 'saturate-[2.5]'
           Stripe 的颜色通常饱和度很高，然后通过 blur 晕开。
        */}
        <div className={`absolute inset-0 w-full h-full filter blur-[80px] md:blur-[120px]
            ${theme === 'dark' ? 'saturate-[1.6] contrast-[1.1]' : 'saturate-[2] opacity-80'}`}>

          {/*
             Blob 1: 主色调 (巨大，作为背景基调)
             不再是圆，而是巨大的椭圆，铺满屏幕的一半。
          */}
          <div className={`absolute top-[-20%] left-[-10%] w-[90vw] h-[90vw] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-spin-slow
             ${palette.orbs[0]}
             ${theme === 'dark' ? 'mix-blend-screen opacity-40' : 'mix-blend-multiply opacity-60'}`}
          />

          {/*
             Blob 2: 辅助色 (作为对比)
             放在对角线位置，产生颜色碰撞。
          */}
          <div className={`absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-spin-slow transition-colors duration-[3000ms]
             ${palette.orbs[1]}
             ${theme === 'dark' ? 'mix-blend-screen opacity-40' : 'mix-blend-multiply opacity-60'}`}
             style={{ animationDirection: 'reverse', animationDuration: '50s' }}
          />

          {/*
             Blob 3: 强调色 (游走的“高光”)
             这个小一点，用来在中间穿插，制造层次感。
          */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse-slow transition-colors duration-[3000ms]
             ${palette.orbs[2]}
             ${theme === 'dark' ? 'mix-blend-plus-lighter opacity-60' : 'mix-blend-hard-light opacity-50'}`}
          />

        </div>

        {/*
           这一层至关重要：白色/黑色的蒙版。
           Stripe 的设计通常不是全屏满色，而是颜色在白底上透出来的感觉。
           我们在上面盖一层半透明的白色/黑色，让颜色变得“含蓄”。
        */}
        <div className={`absolute inset-0 w-full h-full
            ${theme === 'dark' ? 'bg-black/30' : 'bg-white/40'}`}
        />

        {/*
           噪点层：放在最上面
           mix-blend-overlay 让噪点只影响亮度，不影响颜色。
           opacity 控制颗粒感的强弱，0.08 是个经验值，既有质感又不脏。
        */}
        <div className={`absolute inset-0 w-full h-full noise-texture opacity-[0.08] mix-blend-overlay pointer-events-none`} />

      </div>
    </div>
  );
});

AuroraMesh.displayName = "AuroraMesh";
export default AuroraMesh;