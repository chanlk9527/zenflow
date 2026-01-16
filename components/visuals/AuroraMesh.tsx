import React, { memo } from "react";
// 假设这是你的常量，保留引用
import { ELEVATED_PALETTES } from "@/data/constants";

interface Props {
  isPlaying: boolean;
  activeSceneId: string | null;
  theme: 'light' | 'dark';
}

const AuroraMesh = memo(({ isPlaying, activeSceneId, theme }: Props) => {
  // 获取当前配色方案
  const palette = activeSceneId && ELEVATED_PALETTES[activeSceneId]
    ? ELEVATED_PALETTES[activeSceneId]
    : ELEVATED_PALETTES.focus;

  return (
    <div
      className={`fixed inset-0 z-0 flex items-center justify-center transition-opacity duration-[2000ms] overflow-hidden pointer-events-none select-none
      ${isPlaying ? 'opacity-100' : 'opacity-40'}`}
      aria-hidden="true"
    >
       <style>{`
         /* 定义SVG噪点滤镜，解决渐变色带问题，增加质感 */
         .noise-bg {
           position: absolute;
           top: 0; left: 0; width: 100%; height: 100%;
           opacity: ${theme === 'dark' ? '0.07' : '0.04'};
           pointer-events: none;
           z-index: 10;
           background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
         }

         @keyframes drift-1 {
           0% { transform: translate(0, 0) scale(1); }
           33% { transform: translate(10%, -15%) scale(1.1); }
           66% { transform: translate(-5%, 10%) scale(0.95); }
           100% { transform: translate(0, 0) scale(1); }
         }

         @keyframes drift-2 {
           0% { transform: translate(0, 0) rotate(0deg) scale(1); }
           50% { transform: translate(-15%, -5%) rotate(180deg) scale(1.1); }
           100% { transform: translate(0, 0) rotate(360deg) scale(1); }
         }

         @keyframes drift-3 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(15%, 15%) scale(1.2); }
            100% { transform: translate(0, 0) scale(1); }
         }

         /* 性能优化：告诉浏览器这些元素即将变化 */
         .will-change-transform {
            will-change: transform;
         }

         .animate-drift-1 { animation: drift-1 20s infinite ease-in-out alternate; }
         .animate-drift-2 { animation: drift-2 25s infinite linear; }
         .animate-drift-3 { animation: drift-3 22s infinite ease-in-out alternate; }

         .paused-anim * { animation-play-state: paused !important; }
       `}</style>

       {/* 噪点层 - 放在最上层增加磨砂质感 */}
       <div className="noise-bg mix-blend-overlay" />

       {/* 渐变容器 */}
       <div className={`relative w-full h-full transform scale-125 md:scale-110 flex items-center justify-center
          ${isPlaying ? '' : 'paused-anim'}`}>

          {/*
             模糊层:
             - saturation-150: 增加色彩饱和度
             - blur-3xl: 基础模糊
             - mix-blend: 暗黑模式用 plus-lighter (更通透)，亮色模式用 multiply (更柔和)
          */}
          <div className={`relative w-full h-full filter blur-[100px] md:blur-[130px] saturate-[1.6] transition-all duration-1000
             ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-multiply opacity-70'}`}>

              {/* Orb 1: 主色调 */}
              <div className={`will-change-transform absolute top-1/4 left-1/4 w-[60vw] h-[60vw] md:w-[35vw] md:h-[35vw] rounded-full opacity-70 animate-drift-1 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[0]} ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
              />

              {/* Orb 2: 辅助色 - 旋转流动 */}
              <div className={`will-change-transform absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full opacity-60 animate-drift-2 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[1]} ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
              />

              {/* Orb 3: 强调色 - 中心呼吸 */}
              <div className={`will-change-transform absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] rounded-full opacity-80 animate-drift-3 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[2]} ${theme === 'dark' ? 'mix-blend-plus-lighter' : 'mix-blend-hard-light'}`}
              />
          </div>
       </div>
    </div>
  );
});

AuroraMesh.displayName = "AuroraMesh";
export default AuroraMesh;