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

const ELEVATED_PALETTES: Record<string, { orbs: [string, string, string] }> = {
  focus: {
    orbs: ["bg-[#7c3aed]", "bg-[#2dd4bf]", "bg-[#f472b6]"]
  },
  relax: {
    orbs: ["bg-[#059669]", "bg-[#facc15]", "bg-[#38bdf8]"]
  },
  cafe: {
    orbs: ["bg-[#d97706]", "bg-[#e11d48]", "bg-[#fbbf24]"]
  },
  sleep: {
    orbs: ["bg-[#1e3a8a]", "bg-[#4f46e5]", "bg-[#8b5cf6]"]
  },
  creative: {
    orbs: ["bg-[#db2777]", "bg-[#9333ea]", "bg-[#f97316]"]
  }
};

const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://actions.google.com/sounds/v1/ambiences/daytime_forrest_bonfire.ogg" },
  { id: 'birds', icon: Bird, label: "FOREST", url: "https://archive.org/download/birdsounds_202001/quiet%20bird.ogg" }
];

// --- 2. 视觉组件 ---

const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.035] mix-blend-overlay will-change-transform"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
));
NoiseOverlay.displayName = "NoiseOverlay";

const AuroraBackground = memo(({ activeScene, theme }: { activeScene: any, theme: string }) => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
    <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#080808]' : 'bg-[#f4f6f8]'}`} />
    {!activeScene && (
       <div className={`absolute inset-0 opacity-20 transition-all duration-1000 ${theme === 'dark' ? 'bg-gradient-to-b from-blue-900/20 to-transparent' : 'bg-gradient-to-b from-blue-100/50 to-transparent'}`} />
    )}
  </div>
));
AuroraBackground.displayName = "AuroraBackground";

const AppleStyleMesh = memo(({ isPlaying, activeSceneId, theme }: { isPlaying: boolean, activeSceneId: string | null, theme: 'light' | 'dark' }) => {
  const palette = activeSceneId && ELEVATED_PALETTES[activeSceneId]
    ? ELEVATED_PALETTES[activeSceneId]
    : ELEVATED_PALETTES.focus;

  return (
    <div className={`fixed inset-0 z-0 flex items-center justify-center transition-opacity duration-[2000ms] overflow-hidden pointer-events-none ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>
       <style>{`
         @keyframes blob-bounce {
           0% { transform: translate(0, 0) scale(1); }
           33% { transform: translate(30px, -50px) scale(1.1); }
           66% { transform: translate(-20px, 20px) scale(0.9); }
           100% { transform: translate(0, 0) scale(1); }
         }
         @keyframes blob-spin-slow {
           0% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(180deg) scale(1.2); }
           100% { transform: rotate(360deg) scale(1); }
         }
         @keyframes blob-flow {
           0% { transform: translate(0, 0) rotate(0deg); }
           33% { transform: translate(10%, 10%) rotate(120deg); }
           66% { transform: translate(-5%, -10%) rotate(240deg); }
           100% { transform: translate(0, 0) rotate(360deg); }
         }
         .mesh-mask {
            mask-image: radial-gradient(circle at center, black 30%, transparent 95%);
            -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 95%);
         }
         .animate-blob-1 { animation: blob-flow 25s infinite linear; }
         .animate-blob-2 { animation: blob-flow 30s infinite linear reverse; }
         .animate-blob-3 { animation: blob-bounce 20s infinite ease-in-out; }

         .paused-anim * { animation-play-state: paused !important; }
       `}</style>

       <div className={`relative w-[200%] h-[200%] md:w-[150%] md:h-[150%] mesh-mask flex items-center justify-center
          ${isPlaying ? '' : 'paused-anim'}`}>

          <div className={`relative w-full h-full filter blur-[80px] md:blur-[100px] saturate-[1.5] transition-all duration-1000
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply opacity-80'}`}>

              <div className={`absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full opacity-60 animate-blob-1 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[0]} mix-blend-screen`} />

              <div className={`absolute bottom-1/4 right-1/4 w-[50%] h-[50%] rounded-full opacity-60 animate-blob-2 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[1]} mix-blend-screen`} />

              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full opacity-80 animate-blob-3 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[2]} mix-blend-plus-lighter`} />
          </div>
       </div>
    </div>
  );
});
AppleStyleMesh.displayName = "AppleStyleMesh";

// --- 3. 微组件 ---

const SoundKnob = ({ volume, onChange, icon: Icon, label, activeColor, theme }: any) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fillColor = activeColor || (theme === 'dark' ? 'bg-white' : 'bg-black');

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    if (barRef.current) {
       barRef.current.setPointerCapture(e.pointerId);
    }
    updateVolume(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if(isDragging) {
         updateVolume(e.clientY);
     }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (barRef.current) {
        barRef.current.releasePointerCapture(e.pointerId);
    }
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
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative w-12 h-32 rounded-full p-1 flex flex-col justify-end overflow-hidden cursor-ns-resize transition-colors duration-300 touch-none
          ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
      >
        <div
          className={`w-full rounded-full transition-all duration-75 ${fillColor} ${isDragging ? 'opacity-100' : 'opacity-80'}`}
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
    </div>
  );
};

const TimerDisplay = ({ time, isRunning, mode, theme, translations, activeSceneColor, onStart, onStop }: any) => {
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [countdown, setCountdown] = useState<number | null>(null);
  const isBreathMode = (mode === 'BREATH' || mode === '呼吸' || mode === '呼吸');

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
  // --- FIXED: Use a map for stable ambient refs ---
  const ambientRefs = useRef<{[key: string]: HTMLAudioElement}>({});

  const t = TRANSLATIONS[lang];
  const activeScene = SCENES_CONFIG.find(s => s.id === activeSceneId);

  // Auto Theme
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour >= 21 || hour < 6) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };
    checkTime();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting.m;
    if (hour < 18) return t.greeting.a;
    return t.greeting.e;
  };

  // Main Audio Effect
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = mainVolume;
    if (isMainPlaying && currentStreamUrl) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
         playPromise
           .then(() => setIsLoadingStream(false))
           .catch(() => setIsMainPlaying(false));
      }
    } else {
      audioRef.current.pause();
    }
  }, [isMainPlaying, currentStreamUrl, mainVolume]);

  // --- FIXED: Ambient Sounds Playback Logic & Independence ---
  useEffect(() => {
    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const el = ambientRefs.current[key];
      if (el) {
        // 1. Independent Volume Control
        el.volume = vol;
        el.muted = false; // Force unmute just in case

        // 2. Play/Pause Logic with Promise handling
        if (vol > 0) {
           if (el.paused) {
             const playPromise = el.play();
             if (playPromise !== undefined) {
                 playPromise.catch(error => {
                     // Auto-play policy or rapid switching might cause aborts, safe to ignore
                     // console.log("Audio play interrupted:", error);
                 });
             }
           }
        } else {
           if (!el.paused) {
             el.pause();
           }
        }
      }
    });
  }, [ambientVolumes]); // Only depends on ambientVolumes, totally independent of main audio

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
      ${theme === 'dark' ? 'text-gray-100 bg-[#050505]' : 'text-slate-800 bg-[#f4f6f8]'}`}>

      <NoiseOverlay />
      <AuroraBackground activeScene={activeScene} theme={theme} />

      {/* Main Stream Audio */}
      <audio
        ref={audioRef}
        src={currentStreamUrl}
        onPlaying={() => setIsLoadingStream(false)}
        onWaiting={() => setIsLoadingStream(true)}
        crossOrigin="anonymous"
      />

      {/* Ambient Sounds - Independent Player */}
      {AMBIENT_SOUNDS.map(s => (
        <audio
            key={s.id}
            ref={(el) => { if (el) ambientRefs.current[s.id] = el; }}
            src={s.url}
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
        />
      ))}

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border backdrop-blur-md transition-colors
              ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/5'}`}>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px] md:auto-rows-[180px] pb-24">
            <button onClick={() => enterScene(SCENES_CONFIG[0])}
              className={`md:col-span-2 row-span-2 rounded-[2rem] p-8 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group
                ${theme === 'dark'
                   ? 'bg-[#121212] border border-white/5 hover:bg-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-white/5'
                   : 'bg-white/60 border border-white/40 shadow-sm'}`}>
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
                  ${theme === 'dark'
                     ? 'bg-[#121212] border border-white/5 hover:bg-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-white/5'
                     : 'bg-white/60 border border-white/40 shadow-sm'}
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
      <main className={`fixed inset-0 z-20 w-full overflow-y-auto overflow-x-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
         ${viewMode === 'player' ? 'translate-x-0 opacity-100' : 'translate-x-[20%] opacity-0 pointer-events-none'}`}>

        <AppleStyleMesh isPlaying={isMainPlaying} activeSceneId={activeSceneId} theme={theme} />

        <div className="flex flex-col min-h-[100dvh] w-full relative">

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

            {/* Center Play Button Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px] z-30 py-8">
               <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
                  <div className="flex items-center gap-4 relative z-20">
                    <button
                      onClick={() => setIsMainPlaying(!isMainPlaying)}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl transition-transform active:scale-90
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
            <div className="w-full px-6 pb-24 md:pb-12 flex-shrink-0 relative z-30">
              <div className={`max-w-md mx-auto rounded-[2.5rem] overflow-hidden backdrop-blur-3xl border shadow-2xl transition-all duration-500
                 ${theme === 'dark' ? 'bg-[#121212]/60 border-white/10 shadow-black/50' : 'bg-white/50 border-white/40 shadow-xl'}`}>

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
                          activeColor={activeScene?.bg}
                          theme={theme}
                        />
                      ))}
                   </div>

                   {/* Timer Panel */}
                   <div className={`absolute inset-0 px-6 pb-6 flex flex-col items-center justify-center gap-4 transition-all duration-500
                      ${activeTab === 'timer' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}>

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
        </div>

      </main>

    </div>
  );
}