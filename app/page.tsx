"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Sun, Loader2, Sparkles, CloudRain, Flame, Bird, SlidersHorizontal,
  ArrowLeft, Radio, Infinity as InfinityIcon, Activity, Timer as TimerIcon,
  Minimize2
} from "lucide-react";

// --- 1. 数据配置 (保持原样，未修改音源) ---

type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    app_title: "ZENFLOW",
    select_mode: "SELECT FREQUENCY",
    ready_focus: "SYSTEM READY",
    playing: "ON AIR",
    paused: "STANDBY",
    connecting: "LINKING...",
    mixer_title: "AMBIENCE",
    timer: {
      title: "CHRONO",
      work: "FOCUS",
      breath: "BREATH",
      start: "START",
      pause: "PAUSE",
      inhale: "INHALE",
      exhale: "EXHALE",
      hold: "HOLD"
    },
    scenes: {
      focus: { title: "DEEP FOCUS", subtitle: "Lo-Fi Beats" },
      relax: { title: "CHILL WAVE", subtitle: "Downtempo" },
      cafe: { title: "NIGHT CAFE", subtitle: "Lounge Jazz" },
      sleep: { title: "DREAM STATE", subtitle: "Solo Piano" },
      creative: { title: "NEURAL FLOW", subtitle: "Deep House" }
    }
  },
  cn: {
    app_title: "心流终端",
    select_mode: "选择频率",
    ready_focus: "系统就绪",
    playing: "正在广播",
    paused: "信号挂起",
    connecting: "建立链路...",
    mixer_title: "环境音",
    timer: {
      title: "时空",
      work: "专注",
      breath: "呼吸",
      start: "启动",
      pause: "暂停",
      inhale: "吸气",
      exhale: "呼气",
      hold: "保持"
    },
    scenes: {
      focus: { title: "深度专注", subtitle: "Lo-Fi 学习波段" },
      relax: { title: "舒缓律动", subtitle: "沙发音乐" },
      cafe: { title: "午夜咖啡", subtitle: "爵士廊" },
      sleep: { title: "筑梦空间", subtitle: "纯净钢琴" },
      creative: { title: "神经漫游", subtitle: "电子灵感" }
    }
  },
  jp: {
    app_title: "ゼン・フロー",
    select_mode: "周波数選択",
    ready_focus: "準備完了",
    playing: "放送中",
    paused: "一時停止",
    connecting: "接続中...",
    mixer_title: "環境音",
    timer: {
      title: "タイマー",
      work: "集中",
      breath: "呼吸",
      start: "開始",
      pause: "停止",
      inhale: "吸って",
      exhale: "吐いて",
      hold: "止めて"
    },
    scenes: {
      focus: { title: "集中学習", subtitle: "Lo-Fi ストリーム" },
      relax: { title: "リラックス", subtitle: "チルアウト" },
      cafe: { title: "カフェ・ジャズ", subtitle: "ラウンジ・ジャズ" },
      sleep: { title: "睡眠導入", subtitle: "ピアノ・ソロ" },
      creative: { title: "創造性", subtitle: "ディープ・ハウス" }
    }
  }
};

const SCENES_CONFIG = [
  {
    id: "focus",
    icon: <Zap size={24} />,
    color: "text-purple-400",
    accentColor: "bg-purple-500",
    glow: "shadow-purple-500/50",
    gradient: "from-purple-900/60 via-indigo-900/40 to-blue-900/40",
    playlist: ["https://stream.laut.fm/lofi"]
  },
  {
    id: "relax",
    icon: <Wind size={24} />,
    color: "text-emerald-400",
    accentColor: "bg-emerald-500",
    glow: "shadow-emerald-500/50",
    gradient: "from-emerald-900/60 via-teal-900/40 to-cyan-900/40",
    playlist: ["https://ice2.somafm.com/groovesalad-128-mp3"]
  },
  {
    id: "cafe",
    icon: <Coffee size={24} />,
    color: "text-amber-400",
    accentColor: "bg-amber-500",
    glow: "shadow-amber-500/50",
    gradient: "from-amber-900/60 via-orange-900/40 to-red-900/40",
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
    accentColor: "bg-indigo-400",
    glow: "shadow-indigo-500/50",
    gradient: "from-indigo-900/60 via-slate-900/40 to-black/80",
    playlist: ["https://pianosolo.streamguys1.com/live"]
  },
  {
    id: "creative",
    icon: <Sparkles size={24} />,
    color: "text-pink-400",
    accentColor: "bg-pink-500",
    glow: "shadow-pink-500/50",
    gradient: "from-pink-900/60 via-rose-900/40 to-purple-900/40",
    playlist: ["https://ice2.somafm.com/beatblender-128-mp3"]
  },
];

const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://actions.google.com/sounds/v1/ambiences/daytime_forrest_bonfire.ogg" },
  { id: 'birds', icon: Bird, label: "NATURE", url: "https://archive.org/download/birdsounds_202001/quiet%20bird.ogg" }
];

// --- 2. 核心 UI 组件 ---

const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.04] mix-blend-overlay will-change-transform"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
));
NoiseOverlay.displayName = "NoiseOverlay";

// 玻璃拟态容器
const GlassCard = ({ children, className = "", theme }: { children: React.ReactNode, className?: string, theme: string }) => (
  <div className={`
    backdrop-blur-2xl border shadow-xl transition-all duration-500
    ${theme === 'dark'
      ? 'bg-[#1a1a1a]/40 border-white/5 shadow-black/20'
      : 'bg-white/60 border-white/60 shadow-indigo-100/50'}
    ${className}
  `}>
    {children}
  </div>
);

// --- 3. 功能模块 ---

const AmbientMixer = ({ volumes, onVolumeChange, theme, accentColor }: any) => {
  return (
    <div className="flex justify-between items-center gap-2 h-full px-4">
      {AMBIENT_SOUNDS.map((sound) => (
        <div key={sound.id} className="flex flex-col items-center gap-3 group">
          <div className="relative h-24 w-10 flex items-center justify-center touch-none">
            {/* Track */}
            <div className={`absolute h-full w-1 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}></div>
            {/* Fill */}
            <div
              className={`absolute bottom-0 w-1 rounded-full transition-all duration-150 ${accentColor}`}
              style={{ height: `${volumes[sound.id] * 100}%` }}
            ></div>
            {/* Slider Input */}
            <input
              type="range" min="0" max="1" step="0.01"
              value={volumes[sound.id]}
              onChange={(e) => onVolumeChange(sound.id, parseFloat(e.target.value))}
              className="absolute w-24 h-10 opacity-0 cursor-pointer z-10 -rotate-90 touch-none"
            />
            {/* Knob */}
            <div
              className={`absolute w-4 h-4 rounded-full shadow-sm pointer-events-none transition-all duration-150 border-[1.5px]
                ${theme === 'dark' ? 'bg-[#1a1a1a] border-white' : 'bg-white border-gray-400'}
                ${volumes[sound.id] === 0 ? 'scale-75 opacity-50 grayscale' : 'scale-100'}
              `}
              style={{ bottom: `calc(${volumes[sound.id] * 100}% - 8px)` }}
            ></div>
          </div>
          <div className={`flex flex-col items-center gap-1 transition-all ${volumes[sound.id] > 0 ? 'opacity-100' : 'opacity-40'}`}>
            <sound.icon size={14} />
          </div>
        </div>
      ))}
    </div>
  );
};

const TimerWidget = ({ accentColor, theme, lang }: { accentColor: string, theme: string, lang: LangKey }) => {
  const t = TRANSLATIONS[lang].timer;
  const [mode, setMode] = useState<'work' | 'breath'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'breath' && isRunning) {
      interval = setInterval(() => setBreathPhase(p => (p + 1) % 2), 4000);
    }
    return () => clearInterval(interval);
  }, [mode, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0 && mode === 'work') {
      interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const changeMode = (newMode: 'work' | 'breath') => {
    setIsRunning(false);
    setMode(newMode);
    const newTime = newMode === 'work' ? 25 * 60 : 5 * 60;
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="flex flex-col h-full justify-between py-2 px-4">
      <div className="flex justify-between items-center mb-2">
         <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg">
           {['work', 'breath'].map((m) => (
             <button key={m} onClick={() => changeMode(m as any)}
               className={`px-3 py-1 rounded-[6px] text-[9px] font-bold uppercase transition-all ${mode === m ? 'bg-white/90 text-black shadow-sm' : 'opacity-40 hover:opacity-100'}`}>
               {t[m as keyof typeof t]}
             </button>
           ))}
         </div>
         <button onClick={() => {setIsRunning(false); setTimeLeft(initialTime);}} className="opacity-40 hover:opacity-100 p-1">
           <InfinityIcon size={14} />
         </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {mode === 'breath' ? (
          <div className="relative flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full border border-current opacity-10 transition-all duration-[4000ms] ease-in-out ${isRunning && breathPhase === 0 ? 'scale-150' : 'scale-100'}`} />
            <div className={`absolute w-12 h-12 rounded-full ${accentColor} blur-xl opacity-40 transition-all duration-[4000ms] ${isRunning && breathPhase === 0 ? 'scale-150' : 'scale-75'}`} />
            <span className="absolute text-[10px] font-bold tracking-widest uppercase animate-pulse">
               {isRunning ? (breathPhase === 0 ? t.inhale : t.exhale) : t.breath}
            </span>
          </div>
        ) : (
          <div className="text-4xl font-mono font-bold tracking-tighter tabular-nums">{formatTime(timeLeft)}</div>
        )}
      </div>

      <div className="space-y-3 mt-2">
        <input
           type="range" min="1" max="60" value={initialTime / 60}
           onChange={(e) => { setIsRunning(false); const t = parseInt(e.target.value) * 60; setInitialTime(t); setTimeLeft(t); }}
           className={`w-full h-1 rounded-full appearance-none cursor-pointer bg-current/10 opacity-50 hover:opacity-100 transition-opacity accent-${accentColor.replace('bg-', '')}`}
        />
        <button onClick={() => setIsRunning(!isRunning)}
          className={`w-full py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest text-white shadow-lg active:scale-95 transition-all ${isRunning ? 'bg-zinc-800' : accentColor}`}>
          {isRunning ? t.pause : t.start}
        </button>
      </div>
    </div>
  );
};

// --- 4. 主程序 ---

export default function ZenFlowRedesign() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");
  const [mainVolume, setMainVolume] = useState(0.8);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });

  // Tool State (Mobile Switcher)
  const [activeTool, setActiveTool] = useState<'mixer' | 'timer'>('mixer');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[lang];
  const activeScene = SCENES_CONFIG.find(s => s.id === activeSceneId);

  useEffect(() => {
    const savedTheme = localStorage.getItem('zen_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => { localStorage.setItem('zen_theme', theme); }, [theme]);

  // Audio Logic
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

  const enterScene = (scene: typeof SCENES_CONFIG[0]) => {
    if (activeSceneId !== scene.id) {
      setActiveSceneId(scene.id);
      setIsLoadingStream(true);
      setCurrentStreamUrl(scene.playlist[Math.floor(Math.random() * scene.playlist.length)]);
      setIsPlaying(true);
    }
  };

  return (
    <div className={`relative min-h-[100dvh] w-full overflow-hidden transition-colors duration-1000 font-sans select-none
      ${theme === 'dark' ? 'bg-[#050505] text-gray-100' : 'bg-[#f4f5f7] text-slate-800'}`}>

      <NoiseOverlay />

      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none transition-all duration-1000 z-0">
        <div className={`absolute inset-0 bg-gradient-to-b opacity-80 transition-colors duration-1000
           ${theme === 'dark' ? 'from-[#0a0a0a] to-black' : 'from-slate-50 to-white'}`} />

        <div className={`absolute top-[-20%] left-[-20%] w-[90vw] h-[90vw] rounded-full blur-[100px] opacity-20 animate-[pulse_8s_infinite] transition-all duration-1000
           ${activeScene ? activeScene.gradient.split(' ')[0] : (theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-300')}`} />

        <div className={`absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-20 animate-[pulse_10s_infinite_reverse] transition-all duration-1000
           ${activeScene ? activeScene.gradient.split(' ')[2] : (theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-200')}`} />
      </div>

      {/* Audio Elements */}
      <audio ref={audioRef} src={currentStreamUrl} onPlaying={() => setIsLoadingStream(false)} onWaiting={() => setIsLoadingStream(true)} />
      {AMBIENT_SOUNDS.map(s => <audio key={s.id} ref={s.id === 'rain' ? rainRef : s.id === 'fire' ? fireRef : birdsRef} src={s.url} loop />)}

      {/* Top Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <button
             onClick={() => { setIsPlaying(false); setActiveSceneId(null); setAmbientVolumes({rain:0, fire:0, birds:0}); }}
             className={`flex items-center justify-center w-10 h-10 rounded-full border backdrop-blur-md transition-all duration-300 group
               ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-black/5 bg-white/50 hover:bg-white/80'}
               ${!activeScene ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}
             `}>
             <ArrowLeft size={18} />
           </button>
           <div className="flex flex-col">
             <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">{t.app_title}</span>
             {activeScene && <span className="text-xs font-bold tracking-wide animate-fade-in">{t.scenes[activeScene.id as keyof typeof t.scenes].title}</span>}
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en')}
             className="text-[10px] font-mono font-bold w-8 h-8 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 border border-transparent hover:border-current transition-all">
             {lang.toUpperCase()}
           </button>
           <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
             className="w-10 h-10 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-current/5 transition-all">
             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 w-full h-full min-h-[100dvh] flex flex-col justify-center items-center p-6">

        {/* 1. SCENE SELECTION (Grid View) */}
        {!activeScene && (
          <div className="w-full max-w-5xl animate-fade-in-up mt-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-center mb-12 opacity-90">
              {t.select_mode}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {SCENES_CONFIG.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => enterScene(scene)}
                  className={`
                    group relative overflow-hidden rounded-[2rem] p-6 h-40 sm:h-64 flex flex-col justify-between text-left transition-all duration-500
                    hover:-translate-y-1 border
                    ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white/60 border-white/50 hover:border-white/80 shadow-sm'}
                  `}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700 ${scene.accentColor}`} />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/20'}`}>
                    <div className={`${scene.color}`}>{scene.icon}</div>
                  </div>
                  <div>
                    <div className={`text-[9px] font-mono font-bold uppercase tracking-wider opacity-50 mb-1 ${scene.color}`}>{t.scenes[scene.id as keyof typeof t.scenes].subtitle}</div>
                    <div className="text-lg font-bold">{t.scenes[scene.id as keyof typeof t.scenes].title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. ACTIVE PLAYER INTERFACE */}
        {activeScene && (
          <div className="w-full max-w-xl flex flex-col items-center justify-between h-full pt-12 pb-6 md:pb-12 gap-8 md:gap-12 animate-fade-in">

            {/* A. The "Monolith" Player */}
            <div className="relative flex-1 flex flex-col items-center justify-center w-full">
               {/* Visualizer Ring */}
               <div className={`absolute w-64 h-64 md:w-80 md:h-80 rounded-full border border-current opacity-5 transition-all duration-300 ${isPlaying ? 'scale-105' : 'scale-95'}`} />
               <div className={`absolute w-64 h-64 md:w-80 md:h-80 rounded-full blur-[80px] opacity-20 animate-pulse transition-colors duration-1000 ${activeScene.accentColor}`} />

               {/* Main Button */}
               <button
                 onClick={() => setIsPlaying(!isPlaying)}
                 className={`
                   relative w-40 h-40 md:w-56 md:h-56 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center transition-all duration-500 z-10
                   backdrop-blur-2xl border shadow-2xl group
                   ${theme === 'dark' ? 'bg-[#151515]/80 border-white/10' : 'bg-white/80 border-white/50'}
                   ${isPlaying ? activeScene.glow : ''}
                   active:scale-95
                 `}
               >
                 {isLoadingStream && isPlaying ? (
                    <Loader2 size={40} className="animate-spin opacity-50" />
                 ) : isPlaying ? (
                    <div className="flex gap-2">
                       <div className={`w-3 bg-current rounded-full animate-[bounce_1s_infinite] ${activeScene.color} h-8`} style={{animationDelay: '0s'}}></div>
                       <div className={`w-3 bg-current rounded-full animate-[bounce_1s_infinite] ${activeScene.color} h-12`} style={{animationDelay: '0.1s'}}></div>
                       <div className={`w-3 bg-current rounded-full animate-[bounce_1s_infinite] ${activeScene.color} h-8`} style={{animationDelay: '0.2s'}}></div>
                    </div>
                 ) : (
                    <Play size={48} className={`${activeScene.color} fill-current ml-2 opacity-90 group-hover:scale-110 transition-transform`} />
                 )}
               </button>

               {/* Status Text */}
               <div className="absolute -bottom-12 flex flex-col items-center gap-2">
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-current/5 border-current/10 backdrop-blur-sm">
                   <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                   <span className="text-[9px] font-mono font-bold tracking-widest opacity-60">
                     {isLoadingStream ? t.connecting : (isPlaying ? t.playing : t.paused)}
                   </span>
                 </div>
               </div>
            </div>

            {/* B. Control Deck (Unified Mixer & Timer) */}
            <GlassCard theme={theme} className="w-full rounded-[2.5rem] overflow-hidden flex flex-col shrink-0">
              {/* Deck Tabs */}
              <div className="flex border-b border-current/5">
                <button
                  onClick={() => setActiveTool('mixer')}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] transition-all
                    ${activeTool === 'mixer' ? 'bg-current/5 opacity-100' : 'opacity-40 hover:opacity-70'}`}
                >
                  <SlidersHorizontal size={14} /> {t.mixer_title}
                </button>
                <div className="w-[1px] bg-current/5"></div>
                <button
                  onClick={() => setActiveTool('timer')}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] transition-all
                    ${activeTool === 'timer' ? 'bg-current/5 opacity-100' : 'opacity-40 hover:opacity-70'}`}
                >
                  <TimerIcon size={14} /> {t.timer.title}
                </button>
              </div>

              {/* Deck Content Area */}
              <div className="relative h-48 md:h-40 bg-current/[0.02]">
                {activeTool === 'mixer' ? (
                  <div className="h-full animate-fade-in">
                    <AmbientMixer
                      volumes={ambientVolumes}
                      onVolumeChange={(id: string, val: number) => setAmbientVolumes((p: any) => ({...p, [id]: val}))}
                      theme={theme}
                      accentColor={activeScene.accentColor}
                    />
                  </div>
                ) : (
                  <div className="h-full animate-fade-in">
                    <TimerWidget accentColor={activeScene.accentColor} theme={theme} lang={lang} />
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Master Volume (Floating) */}
            <div className="w-full px-8 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
               <Volume2 size={16} />
               <div className="flex-1 h-1 bg-current/10 rounded-full overflow-hidden">
                 <div className="h-full bg-current rounded-full" style={{width: `${mainVolume * 100}%`}} />
               </div>
               <input
                 type="range" min="0" max="1" step="0.05"
                 value={mainVolume} onChange={(e) => setMainVolume(parseFloat(e.target.value))}
                 className="absolute inset-x-8 opacity-0 h-8 cursor-pointer"
               />
            </div>

          </div>
        )}

      </main>
    </div>
  );
}