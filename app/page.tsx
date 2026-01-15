"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Sun, Loader2, Sparkles, CloudRain, Flame, Bird, SlidersHorizontal,
  ArrowLeft, Radio, Infinity as InfinityIcon
} from "lucide-react";

// --- 1. 数据配置 (已修复所有失效链接) ---

type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    app_title: "ZENFLOW // OS",
    select_mode: "SELECT FREQUENCY",
    ready_focus: "SYSTEM READY",
    playing: "ON AIR",
    paused: "STANDBY",
    connecting: "TUNING...",
    mixer_title: "AMBIENCE LAYER",
    timer: {
      title: "CHRONO MODULE",
      work: "FOCUS",
      breath: "BREATH",
      start: "EXECUTE",
      pause: "HALT",
      reset: "RESET"
    },
    scenes: {
      focus: { title: "DEEP FOCUS", subtitle: "Lo-Fi / Beats" },
      relax: { title: "CHILL WAVE", subtitle: "Downtempo" },
      cafe: { title: "NIGHT CAFE", subtitle: "Jazz / Piano" },
      sleep: { title: "DREAM STATE", subtitle: "Soft Piano" }, // Updated subtitle
      creative: { title: "NEURAL FLOW", subtitle: "Deep House" }
    }
  },
  cn: {
    app_title: "心流 // 终端",
    select_mode: "选择频率",
    ready_focus: "系统就绪",
    playing: "直播信号",
    paused: "信号挂起",
    connecting: "正在调频...",
    mixer_title: "环境音层",
    timer: {
      title: "时空模块",
      work: "专注",
      breath: "呼吸",
      start: "执行",
      pause: "暂停",
      reset: "重置"
    },
    scenes: {
      focus: { title: "深度专注", subtitle: "Lo-Fi 学习波段" },
      relax: { title: "舒缓律动", subtitle: "沙发音乐" },
      cafe: { title: "午夜咖啡", subtitle: "醇厚爵士" },
      sleep: { title: "筑梦空间", subtitle: "轻音钢琴" }, // Updated subtitle
      creative: { title: "神经漫游", subtitle: "电子灵感" }
    }
  },
  jp: {
    app_title: "ゼン・フロー",
    select_mode: "周波数選択",
    ready_focus: "準備完了",
    playing: "放送中",
    paused: "一時停止",
    connecting: "チューニング中...",
    mixer_title: "環境音レイヤー",
    timer: {
      title: "タイマー",
      work: "集中",
      breath: "深呼吸",
      start: "開始",
      pause: "停止",
      reset: "リセット"
    },
    scenes: {
      focus: { title: "集中学習", subtitle: "Lo-Fi ストリーム" },
      relax: { title: "リラックス", subtitle: "チルアウト" },
      cafe: { title: "カフェ・ジャズ", subtitle: "ジャズ・ピアノ" },
      sleep: { title: "睡眠導入", subtitle: "ピアノ・ソロ" }, // Updated subtitle
      creative: { title: "創造性", subtitle: "ディープ・ハウス" }
    }
  }
};

const SCENES_CONFIG = [
  {
    id: "focus",
    icon: <Zap size={20} />,
    color: "text-purple-400",
    accentColor: "bg-purple-500",
    gradient: "from-purple-900/40 to-blue-900/40",
    playlist: [
      "https://stream.laut.fm/lofi",
      "https://stream.laut.fm/study-beats"
    ]
  },
  {
    id: "relax",
    icon: <Wind size={20} />,
    color: "text-emerald-400",
    accentColor: "bg-emerald-500",
    gradient: "from-emerald-900/40 to-teal-900/40",
    playlist: [
      "https://ice2.somafm.com/groovesalad-128-mp3",
      "https://ice2.somafm.com/lush-128-mp3"
    ]
  },
  {
    id: "cafe",
    icon: <Coffee size={20} />,
    color: "text-amber-400",
    accentColor: "bg-amber-500",
    gradient: "from-amber-900/40 to-orange-900/40",
    playlist: [
      "https://listen.181fm.com/181-classicalguitar_128k.mp3"
    ]
  },
  {
    id: "sleep",
    icon: <Moon size={20} />,
    color: "text-indigo-300",
    accentColor: "bg-indigo-400",
    gradient: "from-indigo-900/40 to-slate-900/40",
    playlist: [
      "https://stream.laut.fm/pianosolo", // New: Pure Piano
      "https://stream.laut.fm/sleep_radio" // New: Sleep specific
    ]
  },
  {
    id: "creative",
    icon: <Sparkles size={20} />,
    color: "text-pink-400",
    accentColor: "bg-pink-500",
    gradient: "from-pink-900/40 to-rose-900/40",
    playlist: [
      "https://ice2.somafm.com/beatblender-128-mp3",
      "https://ice2.somafm.com/fluid-128-mp3"
    ]
  },
];

// 使用 Google Actions 提供的稳定 CDN 音源
const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://actions.google.com/sounds/v1/ambiences/fireplace.ogg" },
  { id: 'birds', icon: Bird, label: "NATURE", url: "https://actions.google.com/sounds/v1/animals/birds_forest_morning.ogg" }
];

// --- 2. 视觉组件 ---

const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.04] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
));
NoiseOverlay.displayName = "NoiseOverlay";

const Visualizer = ({ isPlaying, color }: { isPlaying: boolean, color: string }) => {
  return (
    <div className="flex items-end justify-center gap-1.5 h-6 w-12">
      {[1, 2, 3].map((i) => (
        <div key={i}
          className={`w-1 rounded-full ${color.replace('text-', 'bg-')} transition-all duration-300
            ${isPlaying ? 'animate-[bounce_1s_infinite]' : 'h-1 opacity-20'}`}
          style={{
            height: isPlaying ? '80%' : '10%',
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`
          }}
        />
      ))}
    </div>
  );
};

// --- 3. 功能组件 ---

const AmbientMixer = ({ volumes, onVolumeChange, theme, accentColor, isMasterPlaying }: any) => {
  return (
    <div className={`
      w-full p-5 rounded-3xl border transition-all duration-500
      backdrop-blur-xl flex flex-col gap-5
      ${theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/60 border-black/5'}
    `}>
      <div className="flex items-center gap-2 opacity-50">
        <SlidersHorizontal size={12} />
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
           {TRANSLATIONS.en.mixer_title}
        </span>
      </div>

      <div className="flex justify-between items-center gap-4">
        {AMBIENT_SOUNDS.map((sound) => (
          <div key={sound.id} className="flex flex-col items-center gap-3 flex-1 group">
            {/* Custom Vertical Slider */}
            <div className="relative h-24 w-10 flex items-center justify-center">
              {/* Track */}
              <div className={`absolute h-full w-1.5 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}></div>

              {/* Fill */}
              <div
                className={`absolute bottom-0 w-1.5 rounded-full transition-all duration-100 ${accentColor} ${!isMasterPlaying && volumes[sound.id] > 0 ? 'opacity-50' : ''}`}
                style={{ height: `${volumes[sound.id] * 100}%` }}
              ></div>

              {/* Input Overlay (Rotated for Vertical) */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes[sound.id]}
                onChange={(e) => onVolumeChange(sound.id, parseFloat(e.target.value))}
                className="absolute w-24 h-10 opacity-0 cursor-pointer z-10"
                style={{ transform: 'rotate(-90deg)' }}
              />

              {/* Thumb (Visual Only) */}
              <div
                className={`absolute w-4 h-4 rounded-full shadow-lg pointer-events-none transition-all duration-75
                  ${theme === 'dark' ? 'bg-white' : 'bg-white border border-gray-200'}
                  ${volumes[sound.id] === 0 ? 'scale-75 opacity-50' : 'scale-100'}
                `}
                style={{ bottom: `calc(${volumes[sound.id] * 100}% - 8px)` }}
              ></div>
            </div>

            <div className={`flex flex-col items-center transition-colors ${volumes[sound.id] > 0 ? 'opacity-100' : 'opacity-40'}`}>
               <sound.icon size={14} className="mb-1" />
               <span className="text-[9px] font-mono font-bold">{sound.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimerWidget = ({ accentColor, theme, lang }: { accentColor: string, theme: string, lang: LangKey }) => {
  const t = TRANSLATIONS[lang].timer;
  const [mode, setMode] = useState<'work' | 'breath'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60); // Remember the setting
  const [isRunning, setIsRunning] = useState(false);

  // Breathing Guide Animation
  // Cycle: Inhale (4s) -> Hold (2s) -> Exhale (4s) -> Hold (2s) roughly,
  // or a simple sinewave breathing.
  // We will use CSS animation for simplicity.

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play a soft bell here if needed
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const changeMode = (newMode: 'work' | 'breath') => {
    setIsRunning(false);
    setMode(newMode);
    const newTime = newMode === 'work' ? 25 * 60 : 5 * 60;
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = parseInt(e.target.value);
    setIsRunning(false);
    setInitialTime(mins * 60);
    setTimeLeft(mins * 60);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className={`
       relative p-6 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-500 w-full max-w-sm flex flex-col gap-6
       ${theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/60 border-white/60'}
    `}>
      {/* Header & Mode Switch */}
      <div className="flex justify-between items-center z-10">
        <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-lg">
          <button
            onClick={() => changeMode('work')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${mode === 'work' ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'}`}
          >
            {t.work}
          </button>
          <button
            onClick={() => changeMode('breath')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${mode === 'breath' ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'}`}
          >
            {t.breath}
          </button>
        </div>
        <button onClick={resetTimer} className="opacity-40 hover:opacity-100 transition-opacity">
          <InfinityIcon size={16} />
        </button>
      </div>

      {/* Main Display */}
      <div className="relative h-40 flex items-center justify-center">
        {mode === 'breath' && isRunning ? (
          // Breathing Visualizer
          <div className="relative flex items-center justify-center">
             <div className={`absolute w-32 h-32 rounded-full opacity-20 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] ${accentColor}`}></div>
             <div className={`w-20 h-20 rounded-full ${accentColor} flex items-center justify-center text-white shadow-xl animate-[pulse_4s_ease-in-out_infinite] scale-150`}>
                <span className="text-xs font-mono tracking-widest">BREATHE</span>
             </div>
          </div>
        ) : (
          // Timer Display
          <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums select-none scale-y-110">
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Slider & Controls */}
      <div className="space-y-6 z-10">
        {/* Time Slider */}
        <div className="relative h-1.5 w-full bg-current/10 rounded-full group">
          <div
            className={`absolute h-full rounded-full opacity-50 ${accentColor}`}
            style={{ width: `${(initialTime / 3600) * 100}%` }}
          ></div>
          <input
            type="range" min="1" max="60" step="1"
            value={initialTime / 60}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* Slider Thumb visual */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-current shadow-sm pointer-events-none transition-all
              ${theme === 'dark' ? 'bg-white' : 'bg-black'} group-hover:scale-125
            `}
            style={{ left: `${(initialTime / 3600) * 100}%`, transform: `translate(-50%, -50%)` }}
          ></div>
        </div>

        <button
          onClick={toggleTimer}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 text-white shadow-lg
            ${isRunning
               ? (theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/80 hover:bg-black')
               : accentColor
            }
          `}
        >
          {isRunning ? t.pause : t.start}
        </button>
      </div>
    </div>
  );
};

// --- 4. 主程序 ---

export default function ZenFlowApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");

  // Volumes
  const [mainVolume, setMainVolume] = useState(0.7);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[lang];
  const activeScene = activeSceneId ? SCENES_CONFIG.find(s => s.id === activeSceneId) : null;

  // Initialize
  useEffect(() => {
    const savedTheme = localStorage.getItem('zen_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('zen_theme', theme);
  }, [theme]);

  // Main Stream Logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = mainVolume;

    if (isPlaying && currentStreamUrl) {
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => setIsLoadingStream(false)).catch(e => {
          console.error("Stream Error", e);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentStreamUrl, mainVolume]);

  // Ambience Logic (Follows Master Play)
  useEffect(() => {
    const refs = { rain: rainRef.current, fire: fireRef.current, birds: birdsRef.current };

    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const el = refs[key as keyof typeof refs];
      if (el) {
        el.volume = vol;
        // Logic: Ambience plays if Master is playing AND volume > 0
        if (isPlaying && vol > 0) {
          if (el.paused) el.play().catch(() => {});
        } else {
          el.pause();
        }
      }
    });
  }, [ambientVolumes, isPlaying]);

  const changeStation = (scene: typeof SCENES_CONFIG[0]) => {
    setIsLoadingStream(true);
    let nextUrl = scene.playlist[0];
    // Simple randomizer excluding current
    if (scene.playlist.length > 1) {
      const others = scene.playlist.filter(u => u !== currentStreamUrl);
      nextUrl = others[Math.floor(Math.random() * others.length)];
    }
    setCurrentStreamUrl(nextUrl);
    if (!isPlaying) setIsPlaying(true);
  };

  const enterScene = (scene: typeof SCENES_CONFIG[0]) => {
    if (activeSceneId !== scene.id) {
      setActiveSceneId(scene.id);
      changeStation(scene);
    }
  };

  const handleBack = () => {
    setIsPlaying(false);
    setActiveSceneId(null);
    setCurrentStreamUrl("");
    setAmbientVolumes({ rain: 0, fire: 0, birds: 0 }); // Reset mixer
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 font-sans overflow-hidden select-none
      ${theme === 'dark' ? 'bg-[#050505] text-gray-100' : 'bg-[#F2F2F7] text-slate-800'}`}>

      <NoiseOverlay />

      {/* Dynamic Background Gradient */}
      <div className={`fixed inset-0 transition-opacity duration-1000 pointer-events-none z-0
         ${activeScene ? 'opacity-100' : 'opacity-0'}`}>
         <div className={`absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-br rounded-full blur-[100px] opacity-30 animate-pulse
           ${activeScene?.gradient.split(' ')[0] || 'from-transparent'}`}></div>
         <div className={`absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-gradient-to-tl rounded-full blur-[100px] opacity-20
           ${activeScene?.gradient.split(' ')[2] || 'to-transparent'}`}></div>
      </div>

      {/* Hidden Audio Elements */}
      <audio
        ref={audioRef}
        src={currentStreamUrl}
        onPlaying={() => setIsLoadingStream(false)}
        onWaiting={() => setIsLoadingStream(true)}
      />
      {AMBIENT_SOUNDS.map(s => (
        <audio key={s.id} ref={s.id === 'rain' ? rainRef : s.id === 'fire' ? fireRef : birdsRef} src={s.url} loop />
      ))}

      {/* Header */}
      <header className="fixed top-0 w-full p-6 z-50 flex justify-between items-center">
        <button onClick={handleBack} className="flex items-center gap-3 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300
            ${theme === 'dark' ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-white/60 border-black/5 group-hover:bg-white/80'}
            ${activeScene ? 'opacity-100 translate-x-0' : 'opacity-100'}
          `}>
             {activeScene ? <ArrowLeft size={18} /> : <Radio size={18} />}
          </div>
          <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity hidden sm:block">
            {t.app_title}
          </span>
        </button>

        <div className="flex items-center gap-3">
          {activeScene && (
             <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md transition-all
               ${theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/40 border-black/5'}
             `}>
               <Volume2 size={14} className="opacity-50" />
               <input
                 type="range" min="0" max="1" step="0.05"
                 value={mainVolume}
                 onChange={(e) => setMainVolume(parseFloat(e.target.value))}
                 className="w-24 h-1 rounded-full appearance-none bg-current opacity-20 hover:opacity-100 cursor-pointer"
               />
             </div>
          )}
          <button onClick={() => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold border border-transparent hover:border-current/10 transition-all">
            {lang.toUpperCase()}
          </button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:rotate-12 hover:scale-110">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 h-screen flex flex-col items-center justify-center pt-16">

        {!activeScene && (
          <div className="w-full max-w-6xl animate-fade-in-up">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-center mb-16 opacity-90">
              {t.select_mode}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {SCENES_CONFIG.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => enterScene(scene)}
                  className={`
                    group relative h-56 md:h-64 w-full sm:w-[calc(50%-1rem)] lg:w-56 rounded-[2.5rem] border transition-all duration-500 p-6 flex flex-col justify-between overflow-hidden
                    ${theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white/60 border-white/50 hover:bg-white/80 shadow-sm hover:shadow-xl'}
                    hover:-translate-y-2
                  `}
                >
                  {/* Hover Glow */}
                  <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${scene.accentColor}`} />

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all
                     ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white/50 border-white/50'}
                  `}>
                    <div className={scene.color}>{scene.icon}</div>
                  </div>

                  <div className="text-left z-10">
                    <p className={`text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mb-1 ${scene.color}`}>
                      {t.scenes[scene.id as keyof typeof t.scenes].subtitle}
                    </p>
                    <h3 className="text-xl font-bold tracking-tight">
                      {t.scenes[scene.id as keyof typeof t.scenes].title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeScene && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-5xl animate-fade-in">

            {/* Player Controls */}
            <div className="flex-1 flex flex-col items-center gap-8 w-full max-w-sm">

               {/* Album Art / Play Button */}
               <div className="relative group">
                 <div className={`absolute inset-0 rounded-full blur-[80px] opacity-20 animate-pulse ${activeScene.accentColor} ${isPlaying ? 'scale-110' : 'scale-100'}`}></div>
                 <button
                   onClick={() => setIsPlaying(!isPlaying)}
                   className={`
                     relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500
                     ${theme === 'dark' ? 'bg-[#111] border border-white/10' : 'bg-white border border-white/60'}
                     ${isPlaying ? 'scale-100' : 'scale-95 opacity-90'}
                   `}
                 >
                    {isLoadingStream && isPlaying ? (
                       <Loader2 size={48} className="animate-spin opacity-50" />
                    ) : isPlaying ? (
                       <Pause size={48} className={`${activeScene.color} fill-current`} />
                    ) : (
                       <Play size={48} className={`${activeScene.color} fill-current ml-2`} />
                    )}
                 </button>

                 {/* Next Station Button */}
                 <button
                   onClick={() => changeStation(activeScene)}
                   className={`
                      absolute bottom-0 right-0 w-14 h-14 rounded-full border backdrop-blur-md flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95
                      ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/80 border-white/40'}
                   `}
                 >
                   <SkipForward size={20} />
                 </button>
               </div>

               <div className="text-center space-y-2">
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <Visualizer isPlaying={isPlaying && !isLoadingStream} color={activeScene.color} />
                 </div>
                 <h2 className="text-3xl font-bold tracking-tight">
                   {t.scenes[activeSceneId as keyof typeof t.scenes].title}
                 </h2>
                 <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-50">
                   {isLoadingStream ? t.connecting : (isPlaying ? t.playing : t.paused)}
                 </p>
               </div>
            </div>

            {/* Tools Column */}
            <div className="flex-1 flex flex-col gap-6 w-full max-w-sm">
               <AmbientMixer
                 volumes={ambientVolumes}
                 onVolumeChange={(id: string, val: number) => setAmbientVolumes(p => ({...p, [id]: val}))}
                 theme={theme}
                 accentColor={activeScene.accentColor}
                 isMasterPlaying={isPlaying}
               />

               <TimerWidget
                 accentColor={activeScene.accentColor}
                 theme={theme}
                 lang={lang}
               />
            </div>

          </div>
        )}

      </main>
    </div>
  );
}