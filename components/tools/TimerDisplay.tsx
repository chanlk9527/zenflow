import React, { useState, useEffect } from "react";

// 内置的呼吸引导组件
const BreathingGuide = ({ isRunning, activeSceneColor, onPhaseChange, phase }: { isRunning: boolean, activeSceneColor: string, onPhaseChange: (phase: 'in' | 'out') => void, phase: 'in' | 'out' }) => {
  if (!isRunning) return null;
  const bgClass = activeSceneColor ? activeSceneColor.replace('text-', 'bg-') : 'bg-blue-500';

  return (
    <div className="absolute inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden rounded-[2.5rem]">
       <div
          className={`w-44 aspect-square rounded-full transition-all duration-[4000ms] ease-in-out flex-shrink-0 opacity-10
          ${bgClass}
          ${phase === 'in' ? 'scale-110' : 'scale-75'}`}
       />
    </div>
  );
};

interface TimerDisplayProps {
  time: number;
  isRunning: boolean;
  mode: string;
  theme: string;
  translations: any;
  activeSceneColor: string;
}

const TimerDisplay = ({ time, isRunning, mode, theme, translations, activeSceneColor }: TimerDisplayProps) => {
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [countdown, setCountdown] = useState<number | null>(null);

  // 简单的判断逻辑，实际项目中可以使用枚举
  const isBreathMode = (mode === translations.timer_modes.breath);

  useEffect(() => {
    if (!isRunning || !isBreathMode) return;
    setBreathPhase('in');
    const interval = setInterval(() => {
      setBreathPhase(p => (p === 'in' ? 'out' : 'in'));
    }, 4000);
    return () => clearInterval(interval);
  }, [isRunning, isBreathMode]);

  const shouldShowBreathGuide = isBreathMode && isRunning;

  return (
    <div className="text-center relative py-6 w-full flex flex-col items-center justify-center flex-1">
      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm rounded-xl">
          <span className="text-6xl font-black animate-ping">{countdown}</span>
        </div>
      )}

      {isBreathMode && (
        <BreathingGuide
          isRunning={isRunning && countdown === null}
          activeSceneColor={activeSceneColor}
          onPhaseChange={() => {}}
          phase={breathPhase}
        />
      )}

      <div className={`text-6xl font-mono font-bold tracking-tighter tabular-nums leading-none relative z-10 transition-colors duration-300 select-none
          ${shouldShowBreathGuide ? 'opacity-90' : 'opacity-100'}`}>
        {Math.floor(time / 60).toString().padStart(2, '0')}:{Math.floor(time % 60).toString().padStart(2, '0')}
      </div>

      <div className="mt-4 h-8 flex items-center justify-center relative z-10 w-full">
         {shouldShowBreathGuide ? (
           <span className={`text-xs font-bold uppercase transition-all duration-[4000ms] ease-in-out flex items-center gap-2
              ${breathPhase === 'in' ? 'tracking-[0.6em] text-base opacity-100 scale-110' : 'tracking-[0.1em] text-xs opacity-60 scale-90'}
           `}>
             {breathPhase === 'in' ? translations.breath_guide.in : translations.breath_guide.out}
           </span>
         ) : (
           <div className="flex items-center justify-center gap-2">
             <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${isRunning ? (activeSceneColor ? activeSceneColor.replace('text-', 'bg-') : 'bg-green-500') : 'bg-gray-400'}`}></span>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{mode}</span>
           </div>
         )}
      </div>
    </div>
  );
};

export default TimerDisplay;