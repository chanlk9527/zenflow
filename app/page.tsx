"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Sun, Loader2, Sparkles, CloudRain, Flame, Bird, SlidersHorizontal,
  ArrowLeft, RotateCcw, Infinity as InfinityIcon, Timer as TimerIcon,
  Quote, MoreHorizontal, Power
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
    breath_guide: { in: "INHALE", out: "EXHALE", hold: "HOLD" },
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
    breath_guide: { in: "吸气", out: "呼气", hold: "保持" },
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
    breath_guide: { in: "吸う", out: "吐く", hold: "止める" },
    scenes: {
      focus: { title: "集中学習", subtitle: "Lo-Fi", desc: "深い集中のために。" },
      relax: { title: "リラックス", subtitle: "チルアウト", desc: "心を落ち着かせる。" },
      cafe: { title: "カフェ", subtitle: "ジャズ", desc: "都会の隠れ家。" },
      sleep: { title: "睡眠導入", subtitle: "ピアノ", desc: "静寂への誘い。" },
      creative: { title: "創造性", subtitle: "ハウス", desc: "インスピレーション。" }
    }
  }
};

const SCENES_CONFIG = [
  {
    id: "focus",
    icon: <Zap size={24} />,
    color: "text-purple-400",
    bg: "bg-purple-500",
    gradient: "from-purple-900/80 via-indigo-900/60 to-blue-900/60",
    playlist: ["https://stream.laut.fm/lofi"]
  },
  {
    id: "relax",
    icon: <Wind size={24} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    gradient: "from-emerald-900/80 via-teal-900/60 to-cyan-900/60",
    playlist: ["https://ice2.somafm.com/groovesalad-128-mp3"]
  },
  {
    id: "cafe",
    icon: <Coffee size={24} />,
    color: "text-amber-400",
    bg: "bg-amber-500",
    gradient: "from-amber-900/80 via-orange-900/60 to-red-900/60",
    playlist: [
      "https://listen.181fm.com/181-classicalguitar_128k.mp3",
      "https://ice4.somafm.com/lush-128-mp3",
      "https://ice2.somafm.com/illstreet-128-mp3"
    ]
  },
  {
    id: "sleep",
    icon: <Moon size={24} />,
    color: "text-indigo-300",
    bg: "bg-indigo-400",
    gradient: "from-indigo-900/80 via-slate-900/60 to-black/80",
    playlist: ["https://pianosolo.streamguys1.com/live"]
  },
  {
    id: "creative",
    icon: <Sparkles size={24} />,
    color: "text-pink-400",
    bg: "bg-pink-500",
    gradient: "from-pink-900/80 via-rose-900/60 to-purple-900/60",
    playlist: ["https://ice2.somafm.com/beatblender-128-mp3"]
  },
];

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

// 修改点：呼吸引导组件优化
// 1. 去除了内部的文字渲染，将文字状态提升，防止重叠
// 2. 接收 activeSceneColor 以保持颜色一致
// 3. 强制 aspect-square 确保正圆
const BreathingGuide = ({ isRunning, theme, activeSceneColor, onPhaseChange }: { isRunning: boolean, theme: string, activeSceneColor: string, onPhaseChange: (phase: 'in' | 'out') => void }) => {
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (!isRunning) return;
    onPhaseChange('in');
    setBreathPhase('in');

    const interval = setInterval(() => {
      setBreathPhase(p => {
        const next = p === 'in' ? 'out' : 'in';
        onPhaseChange(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!isRunning) return null;

  // 提取颜色类名，例如 bg-purple-500
  const bgClass = activeSceneColor ? activeSceneColor.replace('text-', 'bg-') : 'bg-blue-500';
  const borderClass = activeSceneColor ? activeSceneColor.replace('text-', 'border-') : 'border-blue-500';

  return (
    <div className="absolute inset-0 z-[-1] flex items-center justify-center pointer-events-none">
       {/* 背景引导圈 - 修正为 aspect-square 确保是正圆 */}
       <div
          className={`w-64 aspect-square rounded-full border-2 transition-all duration-[4000ms] ease-in-out flex-shrink-0
          ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}
          ${borderClass} ${theme === 'dark' ? 'border-opacity-20' : 'border-opacity-30'}
          ${breathPhase === 'in' ? 'scale-110 opacity-100' : 'scale-75 opacity-50'}`}
       />
       {/* 核心光晕 - 颜色跟随播放器 */}
       <div
          className={`absolute w-64 aspect-square rounded-full transition-all duration-[4000ms] ease-in-out blur-3xl opacity-20 flex-shrink-0
          ${bgClass}
          ${breathPhase === 'in' ? 'scale-100' : 'scale-50'}`}
       />
    </div>
  );
};

// 修改点：TimerDisplay
// 1. 动态切换显示的文字，避免重叠
const TimerDisplay = ({ time, isRunning, mode, theme, translations, activeSceneColor }: any) => {
  const [breathText, setBreathText] = useState(translations.breath_guide.in);
  const isBreathMode = (mode === 'BREATH' || mode === '呼吸' || mode === '呼吸'); // 兼容各语言

  // 当呼吸模式运行时，用动态文字替换静态的“呼吸”标签
  const shouldShowBreathGuide = isBreathMode && isRunning;

  return (
    <div className="text-center relative py-8 w-full flex flex-col items-center">

      {/* 呼吸背景圆圈 */}
      {isBreathMode && (
        <BreathingGuide
          isRunning={isRunning}
          theme={theme}
          activeSceneColor={activeSceneColor}
          onPhaseChange={(phase) => setBreathText(phase === 'in' ? translations.breath_guide.in : translations.breath_guide.out)}
        />
      )}

      {/* 时间数字 */}
      <div className={`text-6xl font-mono font-bold tracking-tighter tabular-nums leading-none relative z-10 transition-colors duration-300 select-none
          ${shouldShowBreathGuide ? 'opacity-90' : 'opacity-100'}`}>
        {Math.floor(time / 60).toString().padStart(2, '0')}:{Math.floor(time % 60).toString().padStart(2, '0')}
      </div>

      {/* 标签区域：根据状态互斥显示 */}
      <div className="mt-3 h-6 flex items-center justify-center relative z-10 w-full">
         {shouldShowBreathGuide ? (
           // 状态1：呼吸运行时，显示动态提示
           <span className="text-sm font-bold tracking-[0.4em] uppercase animate-pulse transition-all duration-1000 text-current opacity-80">
             {breathText}
           </span>
         ) : (
           // 状态2：默认显示模式名称
           <div className="flex items-center justify-center gap-2">
             <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${isRunning ? (activeSceneColor ? activeSceneColor.replace('text-', 'bg-') : 'bg-green-500') : 'bg-gray-400'}`}></span>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{mode}</span>
           </div>
         )}
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [mainVolume, setMainVolume] = useState(0.8);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });

  // Tools State
  const [activeTab, setActiveTab] = useState<'mixer' | 'timer'>('mixer');
  const [timerState, setTimerState] = useState({ mode: 'focus', time: 25 * 60, initial: 25 * 60, running: false });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[lang];
  const activeScene = SCENES_CONFIG.find(s => s.id === activeSceneId);

  // Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting.m;
    if (hour < 18) return t.greeting.a;
    return t.greeting.e;
  };

  // Audio Effect
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = mainVolume;
    if (isPlaying && currentStreamUrl) {
      audioRef.current.play().then(() => setIsLoadingStream(false)).catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentStreamUrl, mainVolume]);

  useEffect(() => {
    const refs = { rain: rainRef.current, fire: fireRef.current, birds: birdsRef.current };
    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const el = refs[key as keyof typeof refs];
      if (el) {
        el.volume = vol;
        if (isPlaying && vol > 0 && el.paused) el.play().catch(() => {});
        else if (!isPlaying || vol === 0) el.pause();
      }
    });
  }, [ambientVolumes, isPlaying]);

  // Timer Logic
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
      setCurrentStreamIndex(0); // 重置索引
      setCurrentStreamUrl(scene.playlist[0]);
      setIsPlaying(true);
    }
    setViewMode('player');
  };

  const handleNextTrack = () => {
    if (!activeScene) return;
    const nextIndex = (currentStreamIndex + 1) % activeScene.playlist.length;
    setCurrentStreamIndex(nextIndex);
    setCurrentStreamUrl(activeScene.playlist[nextIndex]);
    setIsPlaying(true);
  };

  const toggleTimer = () => setTimerState(p => ({ ...p, running: !p.running }));
  const resetTimer = () => setTimerState(p => ({ ...p, running: false, time: p.initial }));

  const switchTimerMode = () => {
    const newMode = timerState.mode === 'focus' ? 'breath' : 'focus';
    const newTime = newMode === 'focus' ? 25 * 60 : 5 * 60; // 呼吸模式默认 5 分钟
    setTimerState({ mode: newMode, time: newTime, initial: newTime, running: false });
  };

  const handleTimeSliderChange = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerState(p => ({ ...p, time: seconds, initial: seconds, running: false }));
  };

  return (
    <div className={`relative min-h-[100dvh] w-full overflow-hidden font-sans select-none transition-colors duration-500 overscroll-none
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

      {/* --- VIEW: HOME (Bento Dashboard) --- */}
      <main className={`relative z-10 w-full min-h-[100dvh] pt-24 px-6 pb-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto
         ${viewMode === 'home' ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none absolute'}`}>

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
             <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{isPlaying ? t.playing : t.paused}</span>
             <h2 className="text-xl font-bold">{activeScene ? t.scenes[activeSceneId as keyof typeof t.scenes].title : '...'}</h2>
          </div>
        </div>

        {/* Center Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[350px] flex-shrink-0">
           <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">

              {/* 修改点：加强播放器光效动感 */}
              {viewMode === 'player' && [1, 2, 3].map(i => (
                <div key={i} className={`absolute inset-0 rounded-full border opacity-20 mix-blend-screen transition-all duration-[3s]
                  ${theme === 'dark' ? 'border-white/30' : 'border-black/10'}
                  ${isPlaying ? 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]' : ''}`}
                  style={{ animationDelay: `${i * 0.8}s` }} // 加快一点频率
                />
              ))}

              {/* 光晕背景增加 pulse 动画 */}
              <div className={`absolute w-40 h-40 rounded-full blur-[60px] opacity-50 transition-all duration-1000 animate-pulse ${activeScene?.bg}`} />

              <div className="flex items-center gap-4 relative z-20">
                {/* Play Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl transition-transform active:scale-90
                     ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/60 border-white/50'}`}>
                  {isLoadingStream && isPlaying ? <Loader2 className="animate-spin" /> :
                   isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                </button>

                {/* Next Track Button */}
                {activeScene && activeScene.playlist.length > 1 && (
                  <button
                    onClick={handleNextTrack}
                    className={`absolute -right-16 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90
                       ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/30 hover:bg-white/60'}`}
                    aria-label="Next Sound"
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
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-current z-20"
                     />
                     <span className="text-[9px] font-bold opacity-30">60m</span>
                  </div>

                  <div className="flex gap-4 w-full z-10">
                     <button onClick={switchTimerMode} className="flex-1 py-3 rounded-2xl bg-current/5 hover:bg-current/10 font-bold text-[10px] tracking-widest uppercase transition-colors">
                       {timerState.mode === 'focus' ? t.timer_modes.breath : t.timer_modes.focus}
                     </button>
                     <button onClick={toggleTimer} className={`flex-1 py-3 rounded-2xl font-bold text-[10px] tracking-widest uppercase text-white shadow-lg active:scale-95 transition-all
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