"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Wind, SkipForward,
  Loader2, Sparkles, CloudRain, Flame, Bird, SlidersHorizontal,
  ArrowLeft, RotateCcw, Timer as TimerIcon
} from "lucide-react";

// --- 1. 数据配置 ---

type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    greeting: { m: "Good Morning", a: "Good Afternoon", e: "Good Evening" },
    tagline: "Design your soundscape.",
    app_title: "ZENFLOW",
    playing: "ON AIR",
    paused: "PAUSED",
    connecting: "TUNING...",
    mixer: "MIXER",
    timer: "TIMER",
    timer_modes: { focus: "FOCUS", breath: "BREATH" },
    breath_guide: { in: "INHALE", out: "EXHALE", hold: "HOLD", ready: "READY" },
    scenes: {
      focus: { title: "Deep Focus", subtitle: "Lo-Fi Beats", desc: "For intense work sessions." },
      relax: { title: "Chill Wave", subtitle: "Downtempo", desc: "Unwind and decompress." },
      cafe: { title: "Night Cafe", subtitle: "Jazz Lounge", desc: "Warmth of the city." },
      sleep: { title: "Dream State", subtitle: "Solo Piano", desc: "Drift into silence." },
      creative: { title: "Neural Flow", subtitle: "Deep House", desc: "Spark creativity." }
    }
  },
  cn: {
    greeting: { m: "早上好", a: "下午好", e: "晚上好" },
    tagline: "定制你的心流声景。",
    app_title: "心流终端",
    playing: "正在广播",
    paused: "已暂停",
    connecting: "调频中...",
    mixer: "混音台",
    timer: "计时器",
    timer_modes: { focus: "专注", breath: "呼吸" },
    breath_guide: { in: "吸气", out: "呼气", hold: "保持", ready: "准备" },
    scenes: {
      focus: { title: "深度专注", subtitle: "Lo-Fi 学习", desc: "为深度工作而生。" },
      relax: { title: "舒缓律动", subtitle: "沙发音乐", desc: "放松身心，卸下疲惫。" },
      cafe: { title: "午夜咖啡", subtitle: "爵士长廊", desc: "城市的温暖角落。" },
      sleep: { title: "筑梦空间", subtitle: "纯净钢琴", desc: "在静谧中入眠。" },
      creative: { title: "神经漫游", subtitle: "电子灵感", desc: "激发大脑创造力。" }
    }
  },
  jp: {
    greeting: { m: "おはよう", a: "こんにちは", e: "こんばんは" },
    tagline: "あなただけの音風景。",
    app_title: "ゼン・フロー",
    playing: "放送中",
    paused: "停止中",
    connecting: "接続中...",
    mixer: "ミキサー",
    timer: "タイマー",
    timer_modes: { focus: "集中", breath: "呼吸" },
    breath_guide: { in: "吸う", out: "吐く", hold: "止める", ready: "準備" },
    scenes: {
      focus: { title: "集中学習", subtitle: "Lo-Fi", desc: "深い集中のために。" },
      relax: { title: "リラックス", subtitle: "チルアウト", desc: "心を落ち着かせる。" },
      cafe: { title: "カフェ", subtitle: "ジャズ", desc: "都会の隠れ家。" },
      sleep: { title: "睡眠導入", subtitle: "ピアノ", desc: "静寂への誘い。" },
      creative: { title: "創造性", subtitle: "ハウス", desc: "インスピレーション。" }
    }
  }
};

// 定义每个场景的复杂流体配色方案
// base: 基础背景色
// orbs: 三个浮动球体的颜色（通常包含：主色深色、互补色、高光色）
const SCENE_PALETTES: Record<string, { base: string, orbs: [string, string, string] }> = {
  focus: {
    base: "bg-[#240b36]", //以此为底
    orbs: ["bg-purple-600", "bg-indigo-500", "bg-fuchsia-400"] // 紫色系混入蓝紫和粉紫
  },
  relax: {
    base: "bg-[#0f2027]",
    orbs: ["bg-emerald-600", "bg-teal-500", "bg-cyan-300"] // 绿色系混入青色和荧光绿
  },
  cafe: {
    base: "bg-[#3e1e14]",
    orbs: ["bg-amber-700", "bg-orange-600", "bg-rose-500"] // 琥珀色系混入深橙和玫瑰红
  },
  sleep: {
    base: "bg-[#0b1026]",
    orbs: ["bg-indigo-800", "bg-slate-700", "bg-violet-900"] // 深蓝系混入灰蓝和深紫
  },
  creative: {
    base: "bg-[#2c001e]",
    orbs: ["bg-pink-600", "bg-rose-500", "bg-purple-500"] // 粉色系混入玫瑰和紫色
  }
};

const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://actions.google.com/sounds/v1/ambiences/daytime_forrest_bonfire.ogg" },
  { id: 'birds', icon: Bird, label: "FOREST", url: "https://archive.org/download/birdsounds_202001/quiet%20bird.ogg" }
];

// --- 2. 视觉组件 ---

const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.03] mix-blend-overlay will-change-transform"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
));
NoiseOverlay.displayName = "NoiseOverlay";

const AuroraBackground = memo(({ activeScene, theme }: { activeScene: any, theme: string }) => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
    <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f2f4f6]'}`} />
    <div className={`absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] rounded-full blur-[120px] opacity-30 animate-[pulse_8s_ease-in-out_infinite] transition-all duration-1000 transform-gpu
      ${activeScene ? activeScene.gradient.split(' ')[0] : (theme === 'dark' ? 'bg-indigo-900' : 'bg-blue-200')}`} />
    <div className={`absolute bottom-[-20%] right-[-10%] w-[100vw] h-[100vw] rounded-full blur-[120px] opacity-30 animate-[pulse_10s_ease-in-out_infinite_reverse] transition-all duration-1000 transform-gpu
      ${activeScene ? activeScene.gradient.split(' ')[2] : (theme === 'dark' ? 'bg-purple-900' : 'bg-pink-200')}`} />
  </div>
));
AuroraBackground.displayName = "AuroraBackground";

// [NEW] Apple Music Style Fluid Mesh Visualizer
const FluidMeshVisualizer = memo(({ isPlaying, activeSceneId, theme }: { isPlaying: boolean, activeSceneId: string | null, theme: string }) => {
  // 获取当前场景的配色，如果没有选中则默认使用 Focus 的配色
  const palette = activeSceneId && SCENE_PALETTES[activeSceneId]
    ? SCENE_PALETTES[activeSceneId]
    : SCENE_PALETTES.focus;

  return (
    <div className={`absolute inset-[-60px] md:inset-[-80px] rounded-full z-[-1] overflow-hidden transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>

       {/* 注入流体动画的关键帧样式 */}
       <style jsx>{`
         @keyframes drift-1 {
           0% { transform: translate(0, 0) rotate(0deg) scale(1); }
           33% { transform: translate(30px, -50px) rotate(120deg) scale(1.2); }
           66% { transform: translate(-20px, 40px) rotate(240deg) scale(0.9); }
           100% { transform: translate(0, 0) rotate(360deg) scale(1); }
         }
         @keyframes drift-2 {
           0% { transform: translate(0, 0) rotate(0deg) scale(1); }
           33% { transform: translate(-40px, 30px) rotate(-90deg) scale(1.1); }
           66% { transform: translate(30px, -20px) rotate(-180deg) scale(0.95); }
           100% { transform: translate(0, 0) rotate(-360deg) scale(1); }
         }
         @keyframes drift-3 {
           0% { transform: translate(0, 0) scale(1); }
           50% { transform: translate(0, 20px) scale(1.3); }
           100% { transform: translate(0, 0) scale(1); }
         }
         @keyframes breathe-container {
           0%, 100% { transform: scale(1); }
           50% { transform: scale(1.02); }
         }
         .animate-fluid-play * {
            animation-play-state: running;
         }
         .animate-fluid-pause * {
            animation-play-state: paused;
         }
       `}</style>

       {/* 容器背景色：确保光球融合时有底色 */}
       <div className={`absolute inset-0 transition-colors duration-1000 ${palette.base} opacity-60`} />

       {/* 模糊层：核心魔法，极高的模糊度融合所有色块 */}
       <div className={`absolute inset-0 filter blur-[60px] md:blur-[90px] mix-blend-hard-light saturate-150 ${isPlaying ? 'animate-fluid-play' : 'animate-fluid-pause'}`}>

          {/* Orb 1: 主律动球 - 顺时针大范围游走 */}
          <div className={`absolute top-0 -left-10 w-[70%] h-[70%] rounded-full opacity-80 mix-blend-screen animate-[drift-1_18s_ease-in-out_infinite] transition-colors duration-1000 ${palette.orbs[0]}`} />

          {/* Orb 2: 互补色球 - 逆时针游走，制造碰撞色 */}
          <div className={`absolute bottom-0 -right-10 w-[70%] h-[70%] rounded-full opacity-80 mix-blend-screen animate-[drift-2_23s_ease-in-out_infinite] transition-colors duration-1000 ${palette.orbs[1]}`} />

          {/* Orb 3: 高光球 - 位于中心，负责产生亮斑和深度 */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full opacity-60 mix-blend-overlay animate-[drift-3_15s_ease-in-out_infinite] transition-colors duration-1000 ${palette.orbs[2]}`} />
       </div>

       {/* 纹理叠加：增加一点噪点，让渐变看起来更有质感而非廉价的模糊 */}
       <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

       {/* 呼吸边框：当音乐播放时，整个容器会有极微小的呼吸感 */}
       <div className={`absolute inset-0 rounded-full border border-white/10 ${isPlaying ? 'animate-[breathe-container_8s_ease-in-out_infinite]' : ''}`} />
    </div>
  );
});
FluidMeshVisualizer.displayName = "FluidMeshVisualizer";


// --- 3. 微组件 ---

const SoundKnob = ({ volume, onChange, icon: Icon, label, activeColor, theme }: any) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateVolume(e.clientY);
    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
  };

  const handleGlobalMove = (e: PointerEvent) => {
    updateVolume(e.clientY);
  };

  const handleGlobalUp = () => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handleGlobalMove);
    window.removeEventListener('pointerup', handleGlobalUp);
  };

  const updateVolume = (clientY: number) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const percentage = 1 - (clientY - rect.top) / rect.height;
    const newVolume = Math.max(0, Math.min(1, percentage));
    onChange(newVolume);
  };

  return (
    <div className="flex flex-col items-center gap-2 group w-14 select-none touch-none">
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        className={`relative w-12 h-32 rounded-full p-1 flex flex-col justify-end overflow-hidden cursor-ns-resize
          ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}
      >
        <div
          className={`w-full rounded-full transition-all duration-75 ${activeColor} ${isDragging ? 'opacity-100' : 'opacity-80'}`}
          style={{ height: `${volume * 100}%` }}
        />
        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none transition-colors duration-300
          ${volume > 0.1 ? 'text-white mix-blend-overlay' : (theme === 'dark' ? 'text-white/30' : 'text-black/30')}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-widest opacity-40 uppercase">{label}</span>
        <span className="text-[9px] font-mono opacity-30">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

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
       <div
          className={`absolute w-44 aspect-square rounded-full transition-all duration-[4000ms] ease-in-out blur-[40px] flex-shrink-0
          ${bgClass}
          ${phase === 'in' ? 'scale-125 opacity-40' : 'scale-90 opacity-10'}`}
       />
    </div>
  );
};

const TimerDisplay = ({ time, isRunning, mode, theme, translations, activeSceneColor, onStart, onStop }: any) => {
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [countdown, setCountdown] = useState<number | null>(null);
  const isBreathMode = (mode === 'BREATH' || mode === '呼吸' || mode === '呼吸');

  const handleInternalStart = () => {
    if (isBreathMode) {
      setCountdown(3);
      let count = 3;
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown(null);
          onStart();
        }
      }, 1000);
    } else {
      onStart();
    }
  };

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

      <div className="absolute -bottom-14 left-0 right-0 flex gap-4 w-full z-10 px-6">
          <button className="flex-1 py-3 rounded-2xl bg-current/5 hover:bg-current/10 font-bold text-[10px] tracking-widest uppercase transition-colors pointer-events-none opacity-0">Placeholder</button>
      </div>
    </div>
  );
};

// --- 4. 主程序 ---

export default function ZenFlowRedesignV2() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'home' | 'player'>('home');

  // Player State
  const [isMainPlaying, setIsMainPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [mainVolume, setMainVolume] = useState(0.8);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });

  // Tools State
  const [activeTab, setActiveTab] = useState<'mixer' | 'timer'>('mixer');
  const [timerState, setTimerState] = useState({ mode: 'focus', time: 25 * 60, initial: 25 * 60, running: false });
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[lang];
  const activeScene = SCENES_CONFIG.find(s => s.id === activeSceneId);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting.m;
    if (hour < 18) return t.greeting.a;
    return t.greeting.e;
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = mainVolume;
    if (isMainPlaying && currentStreamUrl) {
      audioRef.current.play().then(() => setIsLoadingStream(false)).catch(() => setIsMainPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isMainPlaying, currentStreamUrl, mainVolume]);

  useEffect(() => {
    const refs = { rain: rainRef.current, fire: fireRef.current, birds: birdsRef.current };
    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const el = refs[key as keyof typeof refs];
      if (el) {
        el.volume = vol;
        if (vol > 0 && el.paused) {
            el.play().catch(() => {});
        } else if (vol === 0) {
            el.pause();
        }
      }
    });
  }, [ambientVolumes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerState.running && timerState.time > 0) {
      interval = setInterval(() => setTimerState(p => ({ ...p, time: p.time - 1 })), 1000);
    } else if (timerState.time === 0) {
      setTimerState(p => ({ ...p, running: false }));
    }
    return () => clearInterval(interval);
  }, [timerState.running, timerState.time]);

  const enterScene = (scene: typeof SCENES_CONFIG[0]) => {
    if (activeSceneId !== scene.id) {
      setActiveSceneId(scene.id);
      setCurrentStreamIndex(0);
      setCurrentStreamUrl(scene.playlist[0]);
      setIsMainPlaying(true);
    }
    setViewMode('player');
  };

  const handleNextTrack = () => {
    if (!activeScene) return;
    const nextIndex = (currentStreamIndex + 1) % activeScene.playlist.length;
    setCurrentStreamIndex(nextIndex);
    setCurrentStreamUrl(activeScene.playlist[nextIndex]);
    setIsMainPlaying(true);
  };

  const handleStartTimer = () => {
      if(timerState.mode === 'breath') {
          setCountdownNum(3);
          let c = 3;
          const i = setInterval(() => {
              c--;
              setCountdownNum(c);
              if(c <= 0) {
                  clearInterval(i);
                  setCountdownNum(null);
                  setTimerState(p => ({ ...p, running: true }));
              }
          }, 1000);
      } else {
          setTimerState(p => ({ ...p, running: true }));
      }
  };

  const stopTimer = () => setTimerState(p => ({ ...p, running: false }));
  const resetTimer = () => setTimerState(p => ({ ...p, running: false, time: p.initial }));

  const switchTimerMode = () => {
    const newMode = timerState.mode === 'focus' ? 'breath' : 'focus';
    const newTime = newMode === 'focus' ? 25 * 60 : 5 * 60;
    setTimerState({ mode: newMode, time: newTime, initial: newTime, running: false });
  };

  const handleTimeSliderChange = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerState(p => ({ ...p, time: seconds, initial: seconds, running: false }));
  };

  return (
    <div className={`relative h-[100dvh] w-full overflow-hidden font-sans select-none transition-colors duration-500 overscroll-none
      ${theme === 'dark' ? 'text-gray-100' : 'text-slate-800'}`}>

      <NoiseOverlay />
      <AuroraBackground activeScene={activeScene} theme={theme} />
      <audio ref={audioRef} src={currentStreamUrl} onPlaying={() => setIsLoadingStream(false)} onWaiting={() => setIsLoadingStream(true)} />
      {AMBIENT_SOUNDS.map(s => <audio key={s.id} ref={s.id === 'rain' ? rainRef : s.id === 'fire' ? fireRef : birdsRef} src={s.url} loop />)}

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border backdrop-blur-md
              ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/10'}`}>
              ZF
           </div>
           {viewMode === 'home' && <span className="font-bold tracking-widest text-xs uppercase opacity-50">{t.app_title}</span>}
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <button onClick={() => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en')} className="text-xs font-bold opacity-50 hover:opacity-100">{lang.toUpperCase()}</button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="text-xs font-bold opacity-50 hover:opacity-100">{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
        </div>
      </header>

      {/* --- VIEW: HOME --- */}
      <main className={`absolute inset-0 z-10 w-full h-full pt-24 px-6 pb-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto
         ${viewMode === 'home' ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none'}`}>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{getGreeting()}.</h1>
            <p className="opacity-50 text-sm md:text-base font-medium">{t.tagline}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px] md:auto-rows-[180px] pb-10">
            <button onClick={() => enterScene(SCENES_CONFIG[0])}
              className={`md:col-span-2 row-span-2 rounded-[2rem] p-8 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group
                ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/40 shadow-sm'}`}>
               <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${SCENES_CONFIG[0].gradient}`} />
               <div className="relative z-10">
                 <div className="inline-flex p-3 rounded-xl bg-white/10 backdrop-blur-md mb-4 text-purple-300">
                    <Zap size={24} />
                 </div>
                 <h2 className="text-3xl font-bold">{t.scenes.focus.title}</h2>
                 <p className="opacity-60 mt-2 max-w-xs">{t.scenes.focus.desc}</p>
               </div>
               <div className="relative z-10 flex items-center gap-2 opacity-50 text-xs font-bold tracking-widest uppercase group-hover:opacity-100 transition-opacity">
                  <Play size={12} fill="currentColor" /> Play Now
               </div>
            </button>

            {SCENES_CONFIG.slice(1).map((scene, i) => (
              <button key={scene.id} onClick={() => enterScene(scene)}
                className={`rounded-[2rem] p-6 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group
                  ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/40 shadow-sm'}
                  ${i === 1 ? 'md:row-span-2' : ''}
                `}>
                 <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${scene.gradient}`} />
                 <div className="relative z-10 flex justify-between items-start">
                    <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-sm ${scene.color}`}>{scene.icon}</div>
                 </div>
                 <div className="relative z-10">
                   <h3 className="text-lg font-bold leading-tight">{t.scenes[scene.id as keyof typeof t.scenes].title}</h3>
                   <p className="text-[10px] uppercase font-bold tracking-wider opacity-40 mt-1">{t.scenes[scene.id as keyof typeof t.scenes].subtitle}</p>
                 </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* --- VIEW: PLAYER --- */}
      <main className={`fixed inset-0 z-20 flex flex-col overflow-y-auto overflow-x-hidden w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
         ${viewMode === 'player' ? 'translate-x-0 opacity-100' : 'translate-x-[20%] opacity-0 pointer-events-none'}`}>

        {/* Top Controls */}
        <div className="w-full max-w-md mx-auto px-6 pt-24 pb-4 flex justify-between items-end flex-shrink-0 relative z-30">
          <button onClick={() => setViewMode('home')} className="p-4 -ml-4 rounded-full hover:bg-white/10 transition-colors z-50">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-end text-right pointer-events-none">
             <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{isMainPlaying ? t.playing : t.paused}</span>
             <h2 className="text-xl font-bold">{activeScene ? t.scenes[activeSceneId as keyof typeof t.scenes].title : '...'}</h2>
          </div>
        </div>

        {/* Center Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[350px] flex-shrink-0">
           <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">

              {/* [UPDATED] 使用新的流体视觉组件 */}
              <FluidMeshVisualizer
                    isPlaying={isMainPlaying}
                    activeSceneId={activeSceneId}
                    theme={theme}
              />

              <div className="flex items-center gap-4 relative z-20">
                <button
                  onClick={() => setIsMainPlaying(!isMainPlaying)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl transition-transform active:scale-90
                     ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/60 border-white/50'}`}>
                  {isLoadingStream && isMainPlaying ? <Loader2 className="animate-spin" /> :
                   isMainPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                </button>

                {activeScene && activeScene.playlist.length > 1 && (
                  <button
                    onClick={handleNextTrack}
                    className={`absolute -right-16 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90
                       ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/30 hover:bg-white/60'}`}
                  >
                    <SkipForward size={18} className="opacity-70" />
                  </button>
                )}
              </div>
           </div>
        </div>

        {/* Bottom Command Deck */}
        <div className="w-full px-6 pb-12 flex-shrink-0 relative z-30">
          <div className={`max-w-md mx-auto rounded-[2.5rem] overflow-hidden backdrop-blur-2xl border shadow-2xl transition-all duration-500
             ${theme === 'dark' ? 'bg-[#121212]/80 border-white/10 shadow-black/50' : 'bg-white/70 border-white/60 shadow-xl'}`}>

             {/* Tab Switcher */}
             <div className="flex p-2 gap-2">
               <button onClick={() => setActiveTab('mixer')}
                 className={`flex-1 py-3 rounded-3xl text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-2 transition-all
                   ${activeTab === 'mixer' ? (theme === 'dark' ? 'bg-white/10 shadow-inner' : 'bg-white shadow-sm') : 'opacity-40 hover:opacity-70'}`}>
                   <SlidersHorizontal size={14} /> {t.mixer}
               </button>
               <button onClick={() => setActiveTab('timer')}
                 className={`flex-1 py-3 rounded-3xl text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-2 transition-all
                   ${activeTab === 'timer' ? (theme === 'dark' ? 'bg-white/10 shadow-inner' : 'bg-white shadow-sm') : 'opacity-40 hover:opacity-70'}`}>
                   <TimerIcon size={14} /> {t.timer}
               </button>
             </div>

             <div className="h-56 px-6 pb-6 relative">
               {/* Mixer Panel */}
               <div className={`absolute inset-0 px-6 pb-6 flex items-center justify-between transition-all duration-500
                  ${activeTab === 'mixer' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
                  {AMBIENT_SOUNDS.map(s => (
                    <SoundKnob key={s.id}
                      icon={s.icon}
                      label={s.label}
                      volume={ambientVolumes[s.id]}
                      onChange={(v: number) => setAmbientVolumes(p => ({...p, [s.id]: v}))}
                      activeColor={activeScene?.bg} theme={theme}
                    />
                  ))}
               </div>

               {/* Timer Panel */}
               <div className={`absolute inset-0 px-6 pb-6 flex flex-col items-center justify-center gap-4 transition-all duration-500
                  ${activeTab === 'timer' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}>

                  {/* 倒计时覆盖层 */}
                  {countdownNum !== null && countdownNum > 0 && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
                          <span className="text-6xl font-black text-white animate-bounce">{countdownNum}</span>
                      </div>
                  )}

                  <TimerDisplay
                     time={timerState.time}
                     isRunning={timerState.running}
                     mode={t.timer_modes[timerState.mode as keyof typeof t.timer_modes]}
                     theme={theme}
                     translations={t}
                     activeSceneColor={activeScene?.color}
                  />

                  {/* 时间控制滑块 */}
                  <div className="w-full flex items-center gap-3 px-2 z-10">
                     <span className="text-[9px] font-bold opacity-30">1m</span>
                     <input
                        type="range"
                        min="1" max="60"
                        value={Math.floor(timerState.initial / 60)}
                        onChange={(e) => handleTimeSliderChange(parseInt(e.target.value))}
                        disabled={timerState.running}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-current z-20 disabled:opacity-50"
                     />
                     <span className="text-[9px] font-bold opacity-30">60m</span>
                  </div>

                  <div className="flex gap-4 w-full z-10">
                     <button onClick={switchTimerMode} disabled={timerState.running} className="flex-1 py-3 rounded-2xl bg-current/5 hover:bg-current/10 font-bold text-[10px] tracking-widest uppercase transition-colors disabled:opacity-30">
                       {timerState.mode === 'focus' ? t.timer_modes.breath : t.timer_modes.focus}
                     </button>

                     <button onClick={timerState.running ? stopTimer : handleStartTimer} className={`flex-1 py-3 rounded-2xl font-bold text-[10px] tracking-widest uppercase text-white shadow-lg active:scale-95 transition-all
                        ${timerState.running ? 'bg-zinc-800' : activeScene?.bg || 'bg-black'}`}>
                        {timerState.running ? 'STOP' : 'START'}
                     </button>

                     <button onClick={resetTimer} className="w-12 flex items-center justify-center rounded-2xl bg-current/5 hover:bg-current/10 transition-colors" title="Reset Timer">
                        <RotateCcw size={16} />
                     </button>
                  </div>
               </div>
             </div>
          </div>
        </div>

      </main>

    </div>
  );
}