"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Volume1, VolumeX, Wind, SkipForward,
  Sun, Monitor, Signal, AlertCircle, Bell, Loader2, Sparkles,
  CloudRain, Flame, Bird, SlidersHorizontal, ArrowLeft, Radio
} from "lucide-react";

// --- 1. 配置与数据 ---

type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    app_title: "ZENFLOW // OS",
    select_mode: "SELECT FREQUENCY",
    ready_focus: "SYSTEM READY",
    system_idle: "SYSTEM IDLE",
    tap_wake: "TAP TO RESUME",
    playing: "ON AIR",
    paused: "STANDBY",
    connecting: "TUNING...",
    error: "SIGNAL LOST",
    mixer_title: "AMBIENCE MIXER",
    timer: {
      title: "CHRONO",
      work: "FOCUS",
      break: "REST",
      start: "INITIATE",
      pause: "HALT",
      ended: "SESSION END"
    },
    scenes: {
      focus: { title: "DEEP FOCUS", subtitle: "Lo-Fi / Beats" },
      relax: { title: "CHILL WAVE", subtitle: "Downtempo" },
      cafe: { title: "NIGHT CAFE", subtitle: "Jazz / Piano" },
      sleep: { title: "DREAM STATE", subtitle: "Ambient / Theta" },
      creative: { title: "NEURAL FLOW", subtitle: "Deep House" }
    }
  },
  cn: {
    app_title: "心流 // 终端",
    select_mode: "选择频率",
    ready_focus: "系统就绪",
    system_idle: "系统待机",
    tap_wake: "点击唤醒",
    playing: "直播信号",
    paused: "信号挂起",
    connecting: "正在调频...",
    error: "信号丢失",
    mixer_title: "环境音混频",
    timer: {
      title: "专注终端",
      work: "专注",
      break: "小憩",
      start: "启动",
      pause: "暂停",
      ended: "任务完成"
    },
    scenes: {
      focus: { title: "深度专注", subtitle: "Lo-Fi 学习波段" },
      relax: { title: "舒缓律动", subtitle: "沙发音乐" },
      cafe: { title: "午夜咖啡", subtitle: "爵士与钢琴" },
      sleep: { title: "深层睡眠", subtitle: "白噪音与氛围" },
      creative: { title: "神经漫游", subtitle: "电子灵感" }
    }
  },
  jp: {
    app_title: "ゼン・フロー",
    select_mode: "周波数選択",
    ready_focus: "準備完了",
    system_idle: "スタンバイ",
    tap_wake: "タップして再開",
    playing: "放送中",
    paused: "一時停止",
    connecting: "チューニング中...",
    error: "接続エラー",
    mixer_title: "環境音ミキサー",
    timer: {
      title: "タイマー",
      work: "集中",
      break: "休憩",
      start: "開始",
      pause: "停止",
      ended: "終了"
    },
    scenes: {
      focus: { title: "集中学習", subtitle: "Lo-Fi ストリーム" },
      relax: { title: "リラックス", subtitle: "チルアウト" },
      cafe: { title: "カフェ・ジャズ", subtitle: "ジャズ・ピアノ" },
      sleep: { title: "睡眠導入", subtitle: "アンビエント" },
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
    shadow: "shadow-purple-500/20",
    gradient: "from-purple-900/40 to-blue-900/40",
    playlist: ["https://stream.laut.fm/lofi", "https://ice4.somafm.com/groovesalad-128-mp3"]
  },
  {
    id: "relax",
    icon: <Wind size={20} />,
    color: "text-emerald-400",
    accentColor: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
    gradient: "from-emerald-900/40 to-teal-900/40",
    playlist: ["https://ice2.somafm.com/groovesalad-128-mp3", "https://ice2.somafm.com/lush-128-mp3"]
  },
  {
    id: "cafe",
    icon: <Coffee size={20} />,
    color: "text-amber-400",
    accentColor: "bg-amber-500",
    shadow: "shadow-amber-500/20",
    gradient: "from-amber-900/40 to-orange-900/40",
    playlist: ["https://listen.181fm.com/181-classicalguitar_128k.mp3", "https://stream.laut.fm/kaffeehaus"]
  },
  {
    id: "sleep",
    icon: <Moon size={20} />,
    color: "text-indigo-400",
    accentColor: "bg-indigo-500",
    shadow: "shadow-indigo-500/20",
    gradient: "from-indigo-900/40 to-violet-900/40",
    playlist: ["https://ice2.somafm.com/dronezone-128-mp3", "https://ice2.somafm.com/deepspaceone-128-mp3"]
  },
  {
    id: "creative",
    icon: <Sparkles size={20} />,
    color: "text-pink-400",
    accentColor: "bg-pink-500",
    shadow: "shadow-pink-500/20",
    gradient: "from-pink-900/40 to-rose-900/40",
    playlist: ["https://ice2.somafm.com/beatblender-128-mp3", "https://ice2.somafm.com/fluid-128-mp3"]
  },
];

const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://cdn.pixabay.com/download/audio/2022/07/04/audio_b28741e15e.mp3" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_c3c137fa69.mp3" },
  { id: 'birds', icon: Bird, label: "FOREST", url: "https://cdn.pixabay.com/download/audio/2022/02/10/audio_55e2d1eb96.mp3" }
];

// --- 2. 纯视觉组件 ---

const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
));
NoiseOverlay.displayName = "NoiseOverlay";

const Visualizer = ({ isPlaying, color }: { isPlaying: boolean, color: string }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-8 w-12">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}
          className={`w-1 rounded-full ${color.replace('text-', 'bg-')} transition-all duration-300
            ${isPlaying ? 'animate-[bounce_1s_infinite]' : 'h-1 opacity-20'}`}
          style={{
            height: isPlaying ? '60%' : '10%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.6 + Math.random() * 0.5}s`
          }}
        />
      ))}
    </div>
  );
};

// --- 3. 功能组件 ---

// 修复后的混音台组件
const AmbientMixer = ({
  volumes,
  onVolumeChange,
  theme,
  accentColor
}: {
  volumes: { [key: string]: number },
  onVolumeChange: (id: string, val: number) => void,
  theme: string,
  accentColor: string
}) => {
  return (
    <div className={`
      w-full p-6 rounded-2xl border transition-all duration-500
      backdrop-blur-xl flex flex-col gap-4
      ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/60 border-black/5'}
    `}>
      <div className="flex items-center gap-2 opacity-50 mb-2">
        <SlidersHorizontal size={14} />
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Signal Mixer</span>
      </div>
      <div className="flex justify-between items-stretch h-32">
        {AMBIENT_SOUNDS.map((sound) => (
          <div key={sound.id} className="flex flex-col items-center justify-between flex-1 group">
            {/* 垂直滑块容器 - 修复交互逻辑 */}
            <div className="relative h-20 w-8 flex items-center justify-center">
              {/* 背景槽 */}
              <div className={`absolute h-full w-1 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}></div>
              {/* 激活条 */}
              <div
                className={`absolute bottom-0 w-1 rounded-full transition-all duration-150 ${accentColor}`}
                style={{ height: `${volumes[sound.id] * 100}%` }}
              ></div>
              {/* 实际的 Input - 旋转90度覆盖 */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volumes[sound.id]}
                onChange={(e) => onVolumeChange(sound.id, parseFloat(e.target.value))}
                className="absolute w-20 h-8 opacity-0 cursor-pointer z-10"
                style={{ transform: 'rotate(-90deg)' }}
              />
              {/* 滑块头 (视觉装饰) */}
              <div
                className={`absolute w-3 h-3 rounded-full shadow-lg pointer-events-none transition-all duration-75
                  ${theme === 'dark' ? 'bg-white' : 'bg-white border border-gray-200'}`}
                style={{ bottom: `calc(${volumes[sound.id] * 100}% - 6px)` }}
              ></div>
            </div>

            <button
              onClick={() => onVolumeChange(sound.id, volumes[sound.id] > 0 ? 0 : 0.5)}
              className={`mt-2 flex flex-col items-center gap-1 transition-all active:scale-95
                ${volumes[sound.id] > 0 ? 'opacity-100' : 'opacity-40 hover:opacity-70'}
              `}
            >
              <sound.icon size={16} />
              <span className="text-[8px] font-mono font-bold tracking-wider">{sound.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimerWidget = ({ accentColor, theme, lang }: { accentColor: string, theme: string, lang: LangKey }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const t = TRANSLATIONS[lang].timer;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className={`
       relative p-6 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-500 w-full max-w-xs overflow-hidden
       ${theme === 'dark' ? 'bg-black/40 border-white/10 shadow-black/40' : 'bg-white/70 border-white/60 shadow-xl'}
    `}>
      {/* 呼吸灯背景 */}
      {isRunning && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[60px] opacity-20 animate-pulse ${accentColor}`}></div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full flex justify-between items-center opacity-50 mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{t.title}</span>
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-current opacity-20'}`}></div>
        </div>

        <div className="text-6xl font-mono font-bold tracking-tighter tabular-nums mb-8 select-none">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-3 w-full">
           <button
             onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
             className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all
               ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}
             `}>
             {t.work}
           </button>
           <button
             onClick={() => setIsRunning(!isRunning)}
             className={`flex-[2] py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white transition-all shadow-lg active:scale-95
               ${accentColor} hover:brightness-110
             `}>
             {isRunning ? t.pause : t.start}
           </button>
        </div>
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
  const [isLoading, setIsLoading] = useState(false);
  const [mainVolume, setMainVolume] = useState(0.6);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[lang];
  const activeScene = activeSceneId ? SCENES_CONFIG.find(s => s.id === activeSceneId) : null;

  // Initialize
  useEffect(() => {
    // Prevent hydration mismatch
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeSceneId) {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeSceneId]);

  // Main Audio Effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = mainVolume;

    if (isPlaying && currentStreamUrl) {
      // 只有当 URL 存在时才播放
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(e => {
          console.error("Auto-play blocked:", e);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentStreamUrl, mainVolume]);

  // Ambient Audio Effect - 修复声音不同步的问题
  useEffect(() => {
    const refs = { rain: rainRef.current, fire: fireRef.current, birds: birdsRef.current };

    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const audio = refs[key as keyof typeof refs];
      if (audio) {
        audio.volume = vol; // 实时更新音量
        // 环境音只有在主开关开启且音量大于0时播放
        if (isPlaying && vol > 0) {
          if (audio.paused) audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      }
    });
  }, [ambientVolumes, isPlaying]);

  const changeStation = (scene: typeof SCENES_CONFIG[0]) => {
    setIsLoading(true);
    // 简单的随机播放逻辑，避免重复
    let nextUrl = scene.playlist[0];
    if (scene.playlist.length > 1) {
      const remaining = scene.playlist.filter(u => u !== currentStreamUrl);
      nextUrl = remaining[Math.floor(Math.random() * remaining.length)];
    }
    setCurrentStreamUrl(nextUrl);
    // Audio onCanPlay will turn off loading
  };

  const handleSceneEnter = (scene: typeof SCENES_CONFIG[0]) => {
    if (activeSceneId !== scene.id) {
      setActiveSceneId(scene.id);
      setIsPlaying(true);
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
    <div className={`min-h-screen transition-colors duration-700 font-sans selection:bg-purple-500/30 overflow-hidden
      ${theme === 'dark' ? 'bg-[#0a0a0a] text-gray-100' : 'bg-[#f4f4f5] text-slate-800'}`}>

      {/* Global Noise & Ambient BG */}
      <NoiseOverlay />
      <div className={`fixed inset-0 transition-opacity duration-1000 pointer-events-none z-0
         ${activeScene ? 'opacity-100' : 'opacity-0'}`}>
         <div className={`absolute top-0 left-0 w-[60vw] h-[60vw] bg-gradient-to-br rounded-full blur-[120px] opacity-20 animate-pulse
           ${activeScene?.gradient.split(' ')[0] || 'from-gray-500/0'}`}></div>
         <div className={`absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-gradient-to-tl rounded-full blur-[120px] opacity-20
           ${activeScene?.gradient.split(' ')[2] || 'to-gray-500/0'}`}></div>
      </div>

      {/* Invisible Audio Elements */}
      <audio
        ref={audioRef}
        src={currentStreamUrl}
        preload="auto"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setIsPlaying(false); }}
      />
      {AMBIENT_SOUNDS.map(s => <audio key={s.id} ref={s.id === 'rain' ? rainRef : s.id === 'fire' ? fireRef : birdsRef} src={s.url} loop />)}

      {/* Header */}
      <header className="fixed top-0 w-full p-6 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBack}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300
            ${theme === 'dark' ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-white/50 border-black/5 group-hover:bg-white/80'}
            ${activeScene ? 'opacity-100 translate-x-0' : 'opacity-100'}
          `}>
             {activeScene ? <ArrowLeft size={18} /> : <Radio size={18} />}
          </div>
          <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity hidden sm:block">
            {t.app_title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeScene && (
             <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border mr-2 backdrop-blur-md transition-all
               ${theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/40 border-black/5'}
             `}>
               <Volume2 size={14} className="opacity-50" />
               <input
                 type="range" min="0" max="1" step="0.01"
                 value={mainVolume}
                 onChange={(e) => setMainVolume(parseFloat(e.target.value))}
                 className="w-20 h-1 rounded-full appearance-none bg-current opacity-20 hover:opacity-100 cursor-pointer"
               />
             </div>
          )}
          <button onClick={() => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold border border-transparent hover:border-current/10 transition-all">
            {lang.toUpperCase()}
          </button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:rotate-45">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-6 h-screen flex flex-col items-center justify-center">

        {/* Scene Selection Grid */}
        {!activeScene && (
          <div className="w-full max-w-5xl animate-fade-in-up">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-xs font-mono font-bold tracking-[0.3em] opacity-40 uppercase">{t.ready_focus}</h2>
               <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">{t.select_mode}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {SCENES_CONFIG.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneEnter(scene)}
                  className={`
                    group relative h-64 rounded-[2rem] border transition-all duration-500 overflow-hidden text-left p-6 flex flex-col justify-between
                    ${theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white/60 border-white/50 hover:bg-white/80 shadow-sm hover:shadow-xl'}
                    hover:-translate-y-2
                  `}
                >
                  <div className={`absolute top-0 right-0 p-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 ${scene.accentColor}`}></div>

                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-300
                    ${theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/50 border-white/40'}
                    group-hover:scale-110
                  `}>
                    <div className={`${scene.color}`}>{scene.icon}</div>
                  </div>

                  <div className="space-y-1 relative z-10">
                    <p className={`text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 ${scene.color}`}>
                      {t.scenes[scene.id as keyof typeof t.scenes].subtitle}
                    </p>
                    <h3 className="text-xl font-bold tracking-tight group-hover:tracking-wide transition-all">
                      {t.scenes[scene.id as keyof typeof t.scenes].title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Player Interface */}
        {activeScene && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 w-full max-w-5xl animate-fade-in pb-12 pt-20">

            {/* Left Column: Player & Meta */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8 w-full max-w-sm">

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md
                 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/50 border-black/5'}
              `}>
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin opacity-50" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                )}
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-60">
                  {isLoading ? t.connecting : (isPlaying ? t.playing : t.paused)}
                </span>
              </div>

              {/* Title Block */}
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                  {t.scenes[activeSceneId as keyof typeof t.scenes].title}
                </h1>
                <p className={`text-sm font-mono font-bold uppercase tracking-widest opacity-50 ${activeScene.color}`}>
                  {t.scenes[activeSceneId as keyof typeof t.scenes].subtitle}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`
                    w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90
                    ${isPlaying ? activeScene.accentColor + ' text-white' : (theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50')}
                  `}
                >
                  {isPlaying ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-1" />}
                </button>

                <button
                  onClick={() => changeStation(activeScene)}
                  className={`
                    w-14 h-14 rounded-2xl border flex items-center justify-center transition-all hover:rotate-12 active:scale-90
                    ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-black/10 bg-white/50 hover:bg-white/80'}
                  `}
                  title="Next Frequency"
                >
                  <SkipForward size={20} className="opacity-70" />
                </button>

                <Visualizer isPlaying={isPlaying && !isLoading} color={activeScene.color} />
              </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="flex-1 flex flex-col gap-6 w-full max-w-sm">
              <AmbientMixer
                volumes={ambientVolumes}
                onVolumeChange={(id, val) => setAmbientVolumes(p => ({ ...p, [id]: val }))}
                theme={theme}
                accentColor={activeScene.accentColor}
              />
              <TimerWidget accentColor={activeScene.accentColor} theme={theme} lang={lang} />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}