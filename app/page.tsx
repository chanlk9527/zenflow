"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Sun, Loader2, Sparkles, CloudRain, Flame, Bird, SlidersHorizontal,
  ArrowLeft, Radio, Infinity as InfinityIcon, Activity
} from "lucide-react";

// --- 1. 数据配置 (Stable & Verified Sources) ---

type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    app_title: "ZENFLOW // OS",
    select_mode: "SELECT FREQUENCY",
    ready_focus: "SYSTEM READY",
    playing: "BROADCASTING",
    paused: "STANDBY",
    connecting: "ESTABLISHING LINK...",
    mixer_title: "AMBIENCE MIXER",
    timer: {
      title: "CHRONO MODULE",
      work: "FOCUS",
      breath: "BREATH",
      start: "EXECUTE",
      pause: "HALT",
      inhale: "INHALE",
      exhale: "EXHALE",
      hold: "HOLD"
    },
    scenes: {
      focus: { title: "DEEP FOCUS", subtitle: "Lo-Fi / Beats" },
      relax: { title: "CHILL WAVE", subtitle: "Downtempo" },
      cafe: { title: "NIGHT CAFE", subtitle: "Lounge Jazz" },
      sleep: { title: "DREAM STATE", subtitle: "Solo Piano" },
      creative: { title: "NEURAL FLOW", subtitle: "Deep House" }
    }
  },
  cn: {
    app_title: "心流 // 终端",
    select_mode: "选择频率",
    ready_focus: "系统就绪",
    playing: "直播信号",
    paused: "信号挂起",
    connecting: "正在链路...",
    mixer_title: "环境音层",
    timer: {
      title: "时空模块",
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
    mixer_title: "環境音ミキサー",
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
    icon: <Zap size={20} />,
    color: "text-purple-400",
    accentColor: "bg-purple-500",
    gradient: "from-purple-900/40 to-blue-900/40",
    playlist: [
      "https://stream.laut.fm/lofi", // 经典 Lo-Fi
    ]
  },
  {
    id: "relax",
    icon: <Wind size={20} />,
    color: "text-emerald-400",
    accentColor: "bg-emerald-500",
    gradient: "from-emerald-900/40 to-teal-900/40",
    playlist: [
      "https://ice2.somafm.com/groovesalad-128-mp3", // SomaFM Groove Salad (Best Chill)

    ]
  },
  {
    id: "cafe",
    icon: <Coffee size={20} />,
    color: "text-amber-400",
    accentColor: "bg-amber-500",
    gradient: "from-amber-900/40 to-orange-900/40",
    playlist: [
      "https://listen.181fm.com/181-classicalguitar_128k.mp3" // FluxFM Jazz
      "https://ice4.somafm.com/lush-128-mp3" // SomaFM Lush
      "https://ice2.somafm.com/illstreet-128-mp3", // SomaFM Ill Street Lounge (Better than broken kaffeehaus)
    ]
  },
  {
    id: "sleep",
    icon: <Moon size={20} />,
    color: "text-indigo-300",
    accentColor: "bg-indigo-400",
    gradient: "from-indigo-900/40 to-slate-900/40",
    playlist: [
      "https://pianosolo.streamguys1.com/live", // Whisperings Solo Piano Radio (The Gold Standard for Sleep)
    ]
  },
  {
    id: "creative",
    icon: <Sparkles size={20} />,
    color: "text-pink-400",
    accentColor: "bg-pink-500",
    gradient: "from-pink-900/40 to-rose-900/40",
    playlist: [
      "https://ice2.somafm.com/beatblender-128-mp3", // SomaFM Beat Blender
    ]
  },
];

// 使用 Archive.org 的永久直连 MP3，最稳定
const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://actions.google.com/sounds/v1/ambiences/fireplace.ogg" },
  { id: 'birds', icon: Bird, label: "NATURE", url: "https://actions.google.com/sounds/v1/animals/birds_forest_morning.ogg" }
];

// --- 2. 视觉组件 ---

const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.035] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
));
NoiseOverlay.displayName = "NoiseOverlay";

const Visualizer = ({ isPlaying, color }: { isPlaying: boolean, color: string }) => {
  return (
    <div className="flex items-end justify-center gap-[6px] h-8 w-16">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}
          className={`w-1.5 rounded-full ${color.replace('text-', 'bg-')} transition-all duration-300
            ${isPlaying ? 'animate-[bounce_1s_infinite]' : 'h-1.5 opacity-20'}`}
          style={{
            height: isPlaying ? '70%' : '15%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.6 + Math.random() * 0.4}s`
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
      w-full p-6 rounded-3xl border transition-all duration-500
      backdrop-blur-xl flex flex-col gap-6 shadow-xl
      ${theme === 'dark' ? 'bg-[#111]/40 border-white/10' : 'bg-white/60 border-black/5'}
    `}>
      <div className="flex items-center gap-2 opacity-50">
        <SlidersHorizontal size={14} />
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
           {TRANSLATIONS.en.mixer_title}
        </span>
      </div>

      <div className="flex justify-between items-center gap-4 px-2">
        {AMBIENT_SOUNDS.map((sound) => (
          <div key={sound.id} className="flex flex-col items-center gap-4 flex-1 group relative">

            {/* Custom Vertical Slider */}
            <div className="relative h-28 w-12 flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
              {/* Track */}
              <div className={`absolute h-full w-1.5 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}></div>

              {/* Fill */}
              <div
                className={`absolute bottom-0 w-1.5 rounded-full transition-all duration-150 ${accentColor}
                ${!isMasterPlaying && volumes[sound.id] > 0 ? 'opacity-40 saturate-0' : 'opacity-100'}`}
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
                className="absolute w-28 h-12 opacity-0 cursor-pointer z-10"
                style={{ transform: 'rotate(-90deg)' }}
              />

              {/* Thumb (Visual Only) */}
              <div
                className={`absolute w-5 h-5 rounded-full shadow-lg pointer-events-none transition-all duration-150 border-2
                  ${theme === 'dark' ? 'bg-black border-white' : 'bg-white border-gray-300'}
                  ${volumes[sound.id] === 0 ? 'scale-75 opacity-50' : 'scale-100'}
                `}
                style={{ bottom: `calc(${volumes[sound.id] * 100}% - 10px)` }}
              ></div>
            </div>

            <div className={`flex flex-col items-center transition-all duration-300 ${volumes[sound.id] > 0 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
               <sound.icon size={16} className="mb-1.5" />
               <span className="text-[9px] font-mono font-bold tracking-wider">{sound.label}</span>
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
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0); // 0: Inhale, 1: Hold, 2: Exhale

  // Breathing Cycle Logic (4s In, 4s Out)
  useEffect(() => {
    let breathInterval: NodeJS.Timeout;
    if (mode === 'breath' && isRunning) {
      breathInterval = setInterval(() => {
        setBreathPhase(p => (p + 1) % 2); // Simple toggle for now
      }, 4000);
    }
    return () => clearInterval(breathInterval);
  }, [mode, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

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

  const getBreathText = () => {
    if (!isRunning) return t.breath;
    return breathPhase === 0 ? t.inhale : t.exhale;
  };

  return (
    <div className={`
       relative p-6 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-500 w-full max-w-sm flex flex-col justify-between
       ${theme === 'dark' ? 'bg-[#111]/40 border-white/10' : 'bg-white/60 border-white/60'}
    `}>
      {/* Header & Mode Switch */}
      <div className="flex justify-between items-center z-10 mb-6">
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => changeMode('work')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'work' ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'}`}
          >
            {t.work}
          </button>
          <button
            onClick={() => changeMode('breath')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'breath' ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'}`}
          >
            {t.breath}
          </button>
        </div>
        <button onClick={() => {setIsRunning(false); setTimeLeft(initialTime);}} className="opacity-40 hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-full">
          <InfinityIcon size={18} />
        </button>
      </div>

      {/* Main Display */}
      <div className="relative h-48 flex items-center justify-center mb-6">
        {mode === 'breath' ? (
          // Breathing Visualizer
          <div className="relative flex items-center justify-center">
             {/* Outer Ring */}
             <div className={`absolute w-40 h-40 rounded-full border border-current opacity-10 transition-all duration-[4000ms] ease-in-out
                ${isRunning && breathPhase === 0 ? 'scale-110' : 'scale-90'}
             `}></div>

             {/* Inner Glow */}
             <div className={`absolute w-32 h-32 rounded-full opacity-20 transition-all duration-[4000ms] ease-in-out blur-xl
                ${accentColor}
                ${isRunning && breathPhase === 0 ? 'scale-125 opacity-40' : 'scale-75 opacity-10'}
             `}></div>

             {/* Core Circle */}
             <div className={`w-24 h-24 rounded-full ${accentColor} flex items-center justify-center text-white shadow-2xl transition-all duration-[4000ms] ease-in-out z-10
                ${isRunning && breathPhase === 0 ? 'scale-125 shadow-purple-500/50' : 'scale-90 shadow-none'}
             `}>
                <span className="text-xs font-mono font-bold tracking-widest animate-pulse">
                  {getBreathText()}
                </span>
             </div>
          </div>
        ) : (
          // Timer Display
          <div className="flex flex-col items-center">
             <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums select-none transition-all">
                {formatTime(timeLeft)}
             </div>
             <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
                {isRunning ? 'RUNNING' : 'PAUSED'}
             </div>
          </div>
        )}
      </div>

      {/* Slider & Controls */}
      <div className="space-y-6 z-10">
        {/* Time Slider */}
        <div className="group relative h-4 w-full flex items-center">
          <div className="absolute w-full h-1.5 bg-current/5 rounded-full overflow-hidden">
             <div
               className={`h-full rounded-full opacity-50 transition-all duration-300 ${accentColor}`}
               style={{ width: `${(initialTime / 3600) * 100}%` }}
             ></div>
          </div>
          <input
            type="range" min="1" max="60" step="1"
            value={initialTime / 60}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* Slider Thumb visual */}
          <div
            className={`absolute h-4 w-4 rounded-full border-2 border-transparent shadow-sm pointer-events-none transition-all duration-150
              ${theme === 'dark' ? 'bg-white' : 'bg-black'}
              group-hover:scale-125 group-active:scale-110
            `}
            style={{ left: `${(initialTime / 3600) * 100}%`, transform: `translateX(-50%)` }}
          ></div>
          {/* Tooltip on Hover */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">
             {initialTime / 60} MIN
          </div>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] text-white shadow-lg
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");
  const [mainVolume, setMainVolume] = useState(0.7);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[lang];
  const activeScene = activeSceneId ? SCENES_CONFIG.find(s => s.id === activeSceneId) : null;

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

  // Ambience Logic (Sync with Master Play)
  useEffect(() => {
    const refs = { rain: rainRef.current, fire: fireRef.current, birds: birdsRef.current };

    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const el = refs[key as keyof typeof refs];
      if (el) {
        el.volume = vol;
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
    setAmbientVolumes({ rain: 0, fire: 0, birds: 0 });
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 font-sans overflow-hidden select-none
      ${theme === 'dark' ? 'bg-[#0a0a0a] text-gray-200' : 'bg-[#f0f2f5] text-slate-800'}`}>

      <NoiseOverlay />

      {/* Background Ambience */}
      <div className={`fixed inset-0 transition-opacity duration-1000 pointer-events-none z-0
         ${activeScene ? 'opacity-100' : 'opacity-0'}`}>
         <div className={`absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-gradient-to-br rounded-full blur-[120px] opacity-20 animate-pulse
           ${activeScene?.gradient.split(' ')[0] || 'from-transparent'}`}></div>
         <div className={`absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-gradient-to-tl rounded-full blur-[120px] opacity-20
           ${activeScene?.gradient.split(' ')[2] || 'to-transparent'}`}></div>
      </div>

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
        <button onClick={handleBack} className="flex items-center gap-4 group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300
            ${theme === 'dark' ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-white/60 border-black/5 group-hover:bg-white/80'}
            ${activeScene ? 'opacity-100 translate-x-0' : 'opacity-100'}
          `}>
             {activeScene ? <ArrowLeft size={20} /> : <Radio size={20} />}
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
               <Volume2 size={16} className="opacity-50" />
               <input
                 type="range" min="0" max="1" step="0.05"
                 value={mainVolume}
                 onChange={(e) => setMainVolume(parseFloat(e.target.value))}
                 className="w-24 h-1.5 rounded-full appearance-none bg-current opacity-20 hover:opacity-100 cursor-pointer"
               />
             </div>
          )}
          <button onClick={() => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-bold border border-transparent hover:border-current/10 transition-all font-mono">
            {lang.toUpperCase()}
          </button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:rotate-12 hover:scale-110">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Interface */}
      <main className="relative z-10 container mx-auto px-6 h-screen flex flex-col items-center justify-center pt-20 pb-10">

        {!activeScene && (
          <div className="w-full max-w-6xl animate-fade-in-up">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-center mb-16 opacity-90">
              {t.select_mode}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {SCENES_CONFIG.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => enterScene(scene)}
                  className={`
                    group relative h-56 md:h-72 w-full sm:w-[calc(50%-1rem)] lg:w-60 rounded-[2.5rem] border transition-all duration-500 p-8 flex flex-col justify-between overflow-hidden
                    ${theme === 'dark'
                      ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white/50 border-white/50 hover:bg-white/80 shadow-sm hover:shadow-2xl'}
                    hover:-translate-y-2
                  `}
                >
                  <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 ${scene.accentColor}`} />

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all
                     ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white' : 'bg-white/60 border-white/40 text-black'}
                  `}>
                    <div className={scene.color}>{scene.icon}</div>
                  </div>

                  <div className="text-left z-10 space-y-2">
                    <p className={`text-[9px] font-mono font-bold uppercase tracking-widest opacity-60 ${scene.color}`}>
                      {t.scenes[scene.id as keyof typeof t.scenes].subtitle}
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {t.scenes[scene.id as keyof typeof t.scenes].title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeScene && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-24 w-full max-w-6xl animate-fade-in h-full lg:h-auto overflow-y-auto lg:overflow-visible">

            {/* Left: Player Core */}
            <div className="flex-1 flex flex-col items-center gap-10 w-full max-w-md shrink-0">

               <div className="relative group">
                 <div className={`absolute inset-0 rounded-full blur-[100px] opacity-20 animate-pulse ${activeScene.accentColor} ${isPlaying ? 'scale-125' : 'scale-100'}`}></div>

                 <button
                   onClick={() => setIsPlaying(!isPlaying)}
                   className={`
                     relative w-56 h-56 md:w-72 md:h-72 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 z-10
                     ${theme === 'dark' ? 'bg-[#151515] border border-white/10' : 'bg-white border border-white/40'}
                     ${isPlaying ? 'scale-100 shadow-[0_0_50px_rgba(0,0,0,0.3)]' : 'scale-[0.98] opacity-100'}
                   `}
                 >
                    {isLoadingStream && isPlaying ? (
                       <Loader2 size={64} className="animate-spin opacity-50" />
                    ) : isPlaying ? (
                       <Pause size={64} className={`${activeScene.color} fill-current`} />
                    ) : (
                       <Play size={64} className={`${activeScene.color} fill-current ml-3`} />
                    )}
                 </button>

                 <button
                   onClick={() => changeStation(activeScene)}
                   className={`
                      absolute bottom-4 right-4 w-16 h-16 rounded-2xl border backdrop-blur-md flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 z-20
                      ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/80 border-white/40 text-black'}
                   `}
                   title="Next Frequency"
                 >
                   <SkipForward size={24} />
                 </button>
               </div>

               <div className="text-center space-y-4">
                 <div className="flex items-center justify-center gap-3 mb-2">
                    <Activity size={16} className={`opacity-50 ${isPlaying ? 'animate-pulse text-green-500' : ''}`} />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-50">
                      {isLoadingStream ? t.connecting : (isPlaying ? t.playing : t.paused)}
                    </span>
                 </div>
                 <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
                   {t.scenes[activeSceneId as keyof typeof t.scenes].title}
                 </h2>
                 <Visualizer isPlaying={isPlaying && !isLoadingStream} color={activeScene.color} />
               </div>
            </div>

            {/* Right: Tools Module */}
            <div className="flex-1 flex flex-col gap-6 w-full max-w-sm shrink-0">
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