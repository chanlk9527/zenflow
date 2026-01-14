"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Radio, Sun, Monitor, Timer, Signal, AlertCircle, Bell, Loader2
} from "lucide-react";

// --- 1. 多语言字典配置 ---
type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    app_title: "ZENFLOW",
    select_mode: "SELECT FREQUENCY",
    ready_focus: "System Ready",
    system_idle: "SYSTEM IDLE",
    tap_wake: "Click to resume session",
    playing: "LIVE SIGNAL ACTIVE",
    paused: "SIGNAL PAUSED",
    error: "Signal Lost. Retrying...",
    timer: {
      title: "FOCUS TIMER",
      work: "WORK",
      break: "BREAK",
      start: "INITIATE",
      pause: "HALT",
      ended: "SESSION COMPLETE"
    },
    scenes: {
      focus: { title: "LO-FI STUDY", subtitle: "Laut.fm Stream" },
      relax: { title: "GROOVE SALAD", subtitle: "SomaFM Chill" },
      sleep: { title: "DRONE ZONE", subtitle: "SomaFM Ambient" },
      creative: { title: "BEAT BLENDER", subtitle: "Deep House" }
    }
  },
  cn: {
    app_title: "心流电台",
    select_mode: "选择频率",
    ready_focus: "系统就绪",
    system_idle: "系统待机",
    tap_wake: "点击唤醒",
    playing: "直播信号已连接",
    paused: "信号暂停",
    error: "连接中断，重试中...",
    timer: {
      title: "专注计时器",
      work: "工作",
      break: "休息",
      start: "启动",
      pause: "暂停",
      ended: "计时结束"
    },
    scenes: {
      focus: { title: "深度专注", subtitle: "Lo-Fi 学习频道" },
      relax: { title: "舒缓律动", subtitle: "Groove Salad 经典" },
      sleep: { title: "深层睡眠", subtitle: "Drone 氛围音乐" },
      creative: { title: "灵感激发", subtitle: "Deep House 电子" }
    }
  },
  jp: {
    app_title: "ゼン・フロー",
    select_mode: "周波数選択",
    ready_focus: "準備完了",
    system_idle: "スタンバイ",
    tap_wake: "タップして再開",
    playing: "接続中",
    paused: "一時停止",
    error: "接続エラー...",
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
      relax: { title: "リラックス", subtitle: "チルアウト・ビート" },
      sleep: { title: "睡眠導入", subtitle: "ドローン・アンビエント" },
      creative: { title: "創造性", subtitle: "ディープ・ハウス" }
    }
  }
};

// --- 2. 静态数据配置 ---
const SCENES_CONFIG = [
  {
    id: "focus",
    freq: "LIVE",
    icon: <Zap size={24} />,
    color: "text-purple-500 dark:text-purple-400",
    bgGradient: "from-purple-500/20 via-fuchsia-500/20 to-indigo-500/20",
    accent: "bg-purple-500 dark:bg-purple-400",
    playlist: ["https://stream.laut.fm/lofi"]
  },
  {
    id: "relax",
    freq: "LIVE",
    icon: <Wind size={24} />,
    color: "text-teal-600 dark:text-emerald-400",
    bgGradient: "from-teal-500/20 via-emerald-500/20 to-cyan-500/20",
    accent: "bg-teal-500 dark:bg-emerald-400",
    playlist: ["https://ice2.somafm.com/groovesalad-128-mp3"]
  },
  {
    id: "sleep",
    freq: "LIVE",
    icon: <Moon size={24} />,
    color: "text-indigo-600 dark:text-violet-400",
    bgGradient: "from-indigo-500/20 via-purple-500/20 to-slate-500/20",
    accent: "bg-indigo-500 dark:bg-violet-400",
    playlist: ["https://ice2.somafm.com/dronezone-128-mp3"]
  },
  {
    id: "creative",
    freq: "LIVE",
    icon: <Coffee size={24} />,
    color: "text-orange-600 dark:text-amber-400",
    bgGradient: "from-orange-500/20 via-amber-500/20 to-red-500/20",
    accent: "bg-orange-500 dark:bg-amber-400",
    playlist: ["https://ice2.somafm.com/beatblender-128-mp3"]
  },
];

// --- 3. 视觉增强组件 ---

// 噪点覆盖层：增加高级胶片质感
const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
));
NoiseOverlay.displayName = "NoiseOverlay";

// 极光背景：缓慢移动的彩色光斑
const AuroraBackground = ({ activeScene }: { activeScene: any }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className={`absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-30 animate-aurora-1 mix-blend-screen
         ${activeScene ? activeScene.bgGradient.split(' ')[0].replace('/20', '/30') : 'bg-blue-500/10'} transition-colors duration-1000`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-30 animate-aurora-2 mix-blend-screen
         ${activeScene ? activeScene.bgGradient.split(' ')[2].replace('/20', '/30') : 'bg-purple-500/10'} transition-colors duration-1000 delay-1000`}></div>
      {/* 网格纹理 */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
};

// 动态时钟
const LiveClock = memo(() => {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <h1 className="text-[15vw] leading-none font-bold font-mono tracking-tighter opacity-90 select-none will-change-contents min-h-[1em] drop-shadow-2xl">
      {time}
    </h1>
  );
});
LiveClock.displayName = "LiveClock";

// --- 4. 番茄钟组件 ---
const PomodoroTimer = ({ accentColor, theme, lang }: { accentColor: string, theme: string, lang: LangKey }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sliderValue, setSliderValue] = useState(25);
  const t = TRANSLATIONS[lang].timer;
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    alarmRef.current = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3");
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (alarmRef.current) alarmRef.current.play().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const setPreset = (minutes: number) => {
    setIsTimerRunning(false);
    setSliderValue(minutes);
    setTimeLeft(minutes * 60);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    setIsTimerRunning(false);
    setSliderValue(minutes);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative w-full max-w-sm lg:w-80 p-6 rounded-3xl border backdrop-blur-xl transition-all duration-500 order-2 hover:shadow-2xl
       ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/60 border-black/5 shadow-lg hover:bg-white/80'}
    `}>
      <div className="flex items-center justify-between mb-6 opacity-60">
         <div className="flex items-center gap-2">
            <Timer size={14} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">{t.title}</span>
         </div>
         {timeLeft === 0 && <Bell size={16} className="text-yellow-500 animate-bounce" />}
      </div>

      <div className="text-center mb-8">
        <div className={`text-6xl font-mono font-bold tabular-nums tracking-tighter mb-8 transition-all
           ${isTimerRunning ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}
           ${timeLeft === 0 ? 'text-green-500 animate-pulse' : ''}
        `}>
          {timeLeft === 0 ? "00:00" : formatTime(timeLeft)}
        </div>

        {/* 升级版波轮滑块 */}
        <div className="mb-6 px-1 group relative">
          <input
            type="range" min="1" max="90" step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-current opacity-20 hover:opacity-50 transition-opacity z-10 relative"
          />
          {/* 自定义进度条背景 */}
          <div className={`absolute top-0 left-1 h-1.5 rounded-full pointer-events-none transition-all duration-300 opacity-80 ${accentColor.replace('bg-', 'bg-')}`}
               style={{width: `${(sliderValue / 90) * 100}%`}}></div>

          <div className="flex justify-between text-[9px] font-mono opacity-30 mt-2 uppercase tracking-widest">
             <span>1m</span>
             <span className="group-hover:opacity-100 opacity-0 transition-opacity text-current font-bold">{sliderValue} mins</span>
             <span>90m</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[25, 5].map(min => (
             <button key={min} onClick={() => setPreset(min)}
               className={`py-2 text-[10px] font-bold rounded-lg transition-all border
                 ${sliderValue === min
                   ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                   : 'border-transparent bg-current/5 hover:bg-current/10'}
               `}>
               {min === 25 ? t.work : t.break}
             </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => timeLeft === 0 ? setPreset(sliderValue) : setIsTimerRunning(!isTimerRunning)}
        className={`w-full py-4 rounded-xl font-bold tracking-[0.2em] text-xs transition-all active:scale-95 shadow-lg overflow-hidden relative group
          ${isTimerRunning
            ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600')
            : (timeLeft === 0 ? 'bg-green-500 text-white' : accentColor + ' text-white')
          }
        `}
      >
        <span className="relative z-10">{timeLeft === 0 ? "RESET" : (isTimerRunning ? t.pause : t.start)}</span>
        {/* 按钮内的流光动效 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shine" />
      </button>
    </div>
  );
};

// --- 5. 主程序 ---
export default function ZenFlowApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSongUrl, setCurrentSongUrl] = useState<string>("");
  const [isScreensaver, setIsScreensaver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false); // 直播加载状态

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('zenflow_theme') as 'light' | 'dark';
    const savedLang = localStorage.getItem('zenflow_lang') as LangKey;
    const savedVolume = localStorage.getItem('zenflow_volume');
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLang(savedLang);
    if (savedVolume) setVolume(parseFloat(savedVolume));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('zenflow_theme', theme);
      localStorage.setItem('zenflow_lang', lang);
      localStorage.setItem('zenflow_volume', volume.toString());
    }
  }, [theme, lang, volume, isInitialized]);

  const t = TRANSLATIONS[lang];
  const activeScene = activeSceneId ? SCENES_CONFIG.find(s => s.id === activeSceneId) : null;
  const activeSceneTranslation = activeSceneId ? t.scenes[activeSceneId as keyof typeof t.scenes] : null;

  const toggleLang = () => {
    if (lang === 'en') setLang('cn');
    else if (lang === 'cn') setLang('jp');
    else setLang('en');
  };

  const playRandomTrack = (scene: typeof SCENES_CONFIG[0]) => {
    setErrorMsg(null);
    setIsLoadingStream(true); // 开始加载动画
    const list = scene.playlist;
    if (!list || list.length === 0) return;

    if (list.length === 1) {
      if (currentSongUrl !== list[0]) setCurrentSongUrl(list[0]);
      setIsPlaying(true);
      return;
    }
    // Random logic
    let nextUrl;
    do {
      const randomIndex = Math.floor(Math.random() * list.length);
      nextUrl = list[randomIndex];
    } while (nextUrl === currentSongUrl && list.length > 1);
    setCurrentSongUrl(nextUrl);
    setIsPlaying(true);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsLoadingStream(false)) // 播放成功，停止加载动画
          .catch(error => {
            console.error("Playback error:", error);
            setIsPlaying(false);
            setIsLoadingStream(false);
          });
      }
    } else {
      audio.pause();
      setIsLoadingStream(false);
    }
  }, [isPlaying, volume, currentSongUrl]);

  const handleSceneSelect = (scene: typeof SCENES_CONFIG[0]) => {
    if (activeSceneId !== scene.id) {
      setIsPlaying(false);
      setTimeout(() => {
        setActiveSceneId(scene.id);
        playRandomTrack(scene);
      }, 50);
    } else {
      if (!isPlaying) setIsPlaying(true);
    }
  };

  const handleBack = () => {
    setIsPlaying(false);
    setActiveSceneId(null);
    setCurrentSongUrl("");
    setErrorMsg(null);
    setIsLoadingStream(false);
  };

  if (!isInitialized) return <div className="min-h-screen bg-slate-950"></div>;

  return (
    <div className={`${theme} transition-colors duration-1000`}>
      <div className={`relative min-h-screen font-sans transition-colors duration-1000 overflow-hidden
        ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#F5F5F7] text-slate-800'}
      `}>

        <NoiseOverlay />
        <AuroraBackground activeScene={activeScene} />

        <audio
          ref={audioRef}
          key={currentSongUrl}
          src={currentSongUrl}
          preload="none"
          onEnded={() => activeScene && playRandomTrack(activeScene)}
          onPlaying={() => setIsLoadingStream(false)} // 真正开始播放时，取消loading
          onError={(e) => {
            console.error("Audio Load Error:", e);
            setErrorMsg(t.error);
            setIsPlaying(false);
            setIsLoadingStream(false);
          }}
        />

        {/* --- Header --- */}
        <header className="fixed top-0 left-0 w-full px-6 py-6 flex justify-between items-center z-50 pointer-events-none">
          <div className="flex items-center gap-3 cursor-pointer group pointer-events-auto transition-transform hover:scale-105 active:scale-95" onClick={handleBack}>
            <div className={`relative w-8 h-8 flex items-center justify-center border rounded-lg transition-all duration-500
              ${theme === 'dark' ? 'border-white/20 bg-white/5' : 'border-black/10 bg-white'}
            `}>
              {/* Logo EQ Animation */}
              <div className="flex gap-0.5 items-end h-3">
                 <div className={`w-1 bg-current rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite]' : 'h-1'}`}></div>
                 <div className={`w-1 bg-current rounded-full ${isPlaying ? 'animate-[bounce_1.2s_infinite]' : 'h-2'}`}></div>
                 <div className={`w-1 bg-current rounded-full ${isPlaying ? 'animate-[bounce_0.8s_infinite]' : 'h-1.5'}`}></div>
              </div>
            </div>
            <span className="font-mono font-bold tracking-[0.2em] text-xs opacity-80 uppercase group-hover:opacity-100 transition-opacity">
              {t.app_title}
            </span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            {activeScene && (
              <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md transition-colors animate-fade-in
                ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}
              `}>
                <Volume2 size={14} className="opacity-50" />
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-current opacity-30 hover:opacity-100"
                />
              </div>
            )}
            <button onClick={toggleLang} className="w-10 h-10 rounded-full border border-current/10 bg-current/5 flex items-center justify-center text-[10px] font-mono font-bold hover:bg-current/10 transition-all">{lang.toUpperCase()}</button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-10 h-10 rounded-full border border-current/10 bg-current/5 flex items-center justify-center hover:bg-current/10 transition-all"><Sun size={16} /></button>
            <button onClick={() => setIsScreensaver(true)} className="w-10 h-10 rounded-full border border-current/10 bg-current/5 flex items-center justify-center hover:bg-current/10 transition-all"><Monitor size={16} /></button>
          </div>
        </header>

        {/* --- Screensaver --- */}
        {isScreensaver && (
           <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white animate-fade-in cursor-none" onClick={() => setIsScreensaver(false)}>
             <NoiseOverlay />
             <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black z-0"></div>
             {/* 极简呼吸灯 */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full blur-[150px] opacity-20 animate-pulse-slow
               ${activeScene ? activeScene.accent.replace('bg-', 'bg-') : 'bg-blue-500'}`}></div>

             <div className="z-10 text-center space-y-8 select-none mix-blend-screen">
               <LiveClock />
               <div className="space-y-2">
                 <p className="text-2xl md:text-4xl font-light tracking-[0.3em] uppercase opacity-80">
                   {activeSceneTranslation ? activeSceneTranslation.title : t.system_idle}
                 </p>
                 <p className="text-sm font-mono opacity-40 uppercase tracking-widest">{t.tap_wake}</p>
               </div>
             </div>
           </div>
        )}

        {/* --- Main Content --- */}
        <main className="relative container mx-auto px-4 pt-24 pb-12 md:px-6 min-h-screen flex flex-col justify-center items-center z-10">
          {!activeScene && (
            <div className="w-full max-w-6xl animate-fade-in-up">
              <div className="text-center mb-16 space-y-6">
                 {/* Title Animation */}
                 <h1 className="text-5xl md:text-8xl font-bold tracking-tighter opacity-90 bg-clip-text text-transparent bg-gradient-to-b from-current to-current/50 animate-text-shimmer bg-[length:200%_100%]">
                   {t.select_mode}
                 </h1>
                 <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[10px] font-mono tracking-widest uppercase backdrop-blur-md
                  ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/50' : 'border-black/10 bg-black/5 text-slate-500'}
                `}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                  {t.ready_focus}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {SCENES_CONFIG.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneSelect(scene)}
                    className={`group relative h-64 md:h-80 rounded-[2rem] border transition-all duration-500 active:scale-[0.98] overflow-hidden hover:shadow-2xl
                      ${theme === 'dark'
                        ? 'bg-white/5 border-white/5 hover:border-white/20'
                        : 'bg-white border-black/5 hover:border-black/10 shadow-sm'}
                    `}
                  >
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${scene.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                    {/* Icon Background */}
                    <div className={`absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 transform rotate-12 scale-[4] group-hover:scale-[4.5] ${scene.color}`}>
                      {scene.icon}
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 z-10">
                      <div className="flex justify-between items-start">
                        <div className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300
                          ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/80' : 'bg-white/80 border-black/5 text-slate-600'}
                          group-hover:scale-110 group-hover:shadow-lg
                        `}>
                          {scene.icon}
                        </div>
                        <div className="text-[10px] font-mono opacity-40 font-bold tracking-wider border border-current/20 px-2 py-1 rounded-full">{scene.freq}</div>
                      </div>
                      <div className="space-y-2 text-left">
                        <p className={`font-mono text-[10px] uppercase tracking-widest opacity-60 group-hover:translate-x-1 transition-transform duration-300 ${scene.color} dark:text-opacity-100`}>
                          {t.scenes[scene.id as keyof typeof t.scenes].subtitle}
                        </p>
                        <h3 className="text-2xl font-bold tracking-tight group-hover:text-current transition-colors">
                          {t.scenes[scene.id as keyof typeof t.scenes].title}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeScene && activeSceneTranslation && (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 w-full max-w-6xl animate-fade-in relative pb-10">
              <div className="flex flex-col items-center justify-center flex-1 order-1">
                <div className="relative mb-12 md:mb-16 scale-100 md:scale-110">
                  {/* Complex Engine Animation */}
                  <div className={`absolute inset-[-60px] rounded-full border border-dashed opacity-10 animate-[spin_20s_linear_infinite] ${theme === 'dark' ? 'border-white' : 'border-black'}`}></div>
                  <div className={`absolute inset-[-30px] rounded-full border border-dotted opacity-20 animate-[spin_15s_linear_infinite_reverse] ${theme === 'dark' ? 'border-white' : 'border-black'}`}></div>

                  {/* Dynamic Glow */}
                  <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000
                    ${activeScene.accent}
                    ${isPlaying ? 'opacity-40 scale-150' : 'opacity-10 scale-100'}
                  `}></div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full border backdrop-blur-2xl flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-95 group z-10
                      ${theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-white/30' : 'bg-white/40 border-white/50 hover:bg-white/60'}
                    `}
                  >
                     {/* Loading Spinner */}
                    {isLoadingStream && isPlaying && (
                       <div className="absolute inset-0 flex items-center justify-center z-20">
                          <Loader2 size={48} className="animate-spin opacity-50" />
                       </div>
                    )}

                    <div className={`transition-all duration-500 ${isLoadingStream && isPlaying ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                       {isPlaying ? (
                          <Pause size={64} className={`fill-current ${activeScene.color} opacity-90 drop-shadow-lg`} />
                        ) : (
                          <Play size={64} className={`ml-3 fill-current ${activeScene.color} opacity-90 drop-shadow-lg`} />
                        )}
                    </div>
                  </button>

                  {activeScene.playlist.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); playRandomTrack(activeScene); }} className="absolute -right-8 top-1/2 -translate-y-1/2 p-4 rounded-full border shadow-lg active:scale-90 transition-transform z-20 bg-white/5 border-white/10 hover:bg-white/20 backdrop-blur-md">
                      <SkipForward size={24} />
                    </button>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-current to-current/50">
                    {activeSceneTranslation.title}
                  </h2>
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-current/10 bg-current/5 backdrop-blur-md">
                     {errorMsg ? (
                       <>
                         <AlertCircle size={14} className="text-red-500" />
                         <span className="text-xs font-mono uppercase tracking-widest text-red-500">{errorMsg}</span>
                       </>
                     ) : (
                       <>
                         <Signal size={14} className={isPlaying ? 'animate-pulse text-green-500' : ''} />
                         <span className="text-xs font-mono uppercase tracking-widest opacity-70">
                           {isLoadingStream && isPlaying ? "CONNECTING..." : (isPlaying ? t.playing : t.paused)}
                         </span>
                       </>
                     )}
                  </div>
                </div>
              </div>
              <PomodoroTimer accentColor={activeScene.accent} theme={theme} lang={lang} />
            </div>
          )}
        </main>
      </div>
      <style jsx global>{`
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.1); }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -10px) scale(0.9); }
        }
        .animate-aurora-1 { animation: aurora-1 10s ease-in-out infinite alternate; }
        .animate-aurora-2 { animation: aurora-2 12s ease-in-out infinite alternate; }

        @keyframes shine {
          100% { transform: translateX(100%); }
        }
        .animate-shine { animation: shine 1.5s; }

        @keyframes text-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-text-shimmer { animation: text-shimmer 3s linear infinite; }
      `}</style>
    </div>
  );
}