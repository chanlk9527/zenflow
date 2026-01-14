"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Radio, Sun, Monitor, Timer, Signal, AlertCircle
} from "lucide-react";

// --- 1. 多语言字典配置 ---
type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    app_title: "ZENFLOW",
    select_mode: "SELECT MODE",
    ready_focus: "Ready to Focus",
    system_idle: "SYSTEM IDLE",
    tap_wake: "Tap to wake up",
    playing: "LIVE SIGNAL ACQUIRED",
    paused: "SIGNAL PAUSED",
    error: "Stream unavailable, retry...",
    timer: {
      title: "Focus Timer",
      work: "WORK",
      break: "BREAK",
      start: "START SESSION",
      pause: "PAUSE"
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
    ready_focus: "准备进入专注状态",
    system_idle: "系统待机",
    tap_wake: "点击屏幕唤醒",
    playing: "直播信号已连接",
    paused: "信号暂停",
    error: "流媒体连接失败，请重试...",
    timer: {
      title: "番茄专注钟",
      work: "工作 (25)",
      break: "休息 (5)",
      start: "开始专注",
      pause: "暂停计时"
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
    select_mode: "モード選択",
    ready_focus: "集中する準備はできましたか",
    system_idle: "スタンバイ",
    tap_wake: "タップして再開",
    playing: "ライブ信号接続中",
    paused: "一時停止",
    error: "接続エラー、再試行してください...",
    timer: {
      title: "ポモドーロ",
      work: "集中 (25)",
      break: "休憩 (5)",
      start: "セッション開始",
      pause: "一時停止"
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
    bgGradient: "from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40",
    accent: "bg-purple-500 dark:bg-purple-400",
    playlist: ["https://stream.laut.fm/lofi"]
  },
  {
    id: "relax",
    freq: "LIVE",
    icon: <Wind size={24} />,
    color: "text-teal-600 dark:text-emerald-400",
    bgGradient: "from-teal-100 to-emerald-100 dark:from-emerald-900/40 dark:to-teal-900/40",
    accent: "bg-teal-500 dark:bg-emerald-400",
    playlist: ["https://ice2.somafm.com/groovesalad-128-mp3"]
  },
  {
    id: "sleep",
    freq: "LIVE",
    icon: <Moon size={24} />,
    color: "text-indigo-600 dark:text-violet-400",
    bgGradient: "from-indigo-100 to-purple-100 dark:from-violet-900/40 dark:to-indigo-900/40",
    accent: "bg-indigo-500 dark:bg-violet-400",
    playlist: ["https://ice2.somafm.com/dronezone-128-mp3"]
  },
  {
    id: "creative",
    freq: "LIVE",
    icon: <Coffee size={24} />,
    color: "text-orange-600 dark:text-amber-400",
    bgGradient: "from-orange-100 to-amber-100 dark:from-amber-900/40 dark:to-orange-900/40",
    accent: "bg-orange-500 dark:bg-amber-400",
    playlist: ["https://ice2.somafm.com/beatblender-128-mp3"]
  },
];

// --- 3. 辅助组件 ---
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
    <h1 className="text-[18vw] md:text-[15vw] leading-none font-bold font-mono tracking-tighter opacity-90 select-none will-change-contents min-h-[1em]">
      {time}
    </h1>
  );
});
LiveClock.displayName = "LiveClock";

const PomodoroTimer = ({ accentColor, theme, lang }: { accentColor: string, theme: string, lang: LangKey }) => {
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const t = TRANSLATIONS[lang].timer;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const resetTimer = (mode: 'work' | 'break') => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative w-full max-w-sm lg:w-80 p-6 rounded-3xl border backdrop-blur-md transition-colors order-2
       ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5 shadow-lg'}
    `}>
      <div className="flex items-center gap-2 mb-6 opacity-50">
         <Timer size={16} />
         <span className="text-xs font-mono font-bold uppercase tracking-widest">{t.title}</span>
      </div>
      <div className="text-center mb-8">
        <div className="text-5xl md:text-6xl font-mono font-bold tabular-nums tracking-tighter mb-4 will-change-contents">
          {formatTime(timeLeft)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => resetTimer('work')} className={`py-2 text-xs font-bold rounded-lg transition-colors border ${timerMode === 'work' ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : 'border-transparent opacity-50 hover:opacity-100'}`}>{t.work}</button>
          <button onClick={() => resetTimer('break')} className={`py-2 text-xs font-bold rounded-lg transition-colors border ${timerMode === 'break' ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : 'border-transparent opacity-50 hover:opacity-100'}`}>{t.break}</button>
        </div>
      </div>
      <button
        onClick={() => setIsTimerRunning(!isTimerRunning)}
        className={`w-full py-4 rounded-xl font-bold tracking-widest transition-transform active:scale-95 shadow-lg
          ${isTimerRunning ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600') : accentColor + ' text-white'}
        `}
      >
        {isTimerRunning ? t.pause : t.start}
      </button>
    </div>
  );
};

// --- 4. 主程序 ---
export default function ZenFlowApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSongUrl, setCurrentSongUrl] = useState<string>("");
  const [isScreensaver, setIsScreensaver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // 防止 hydration 错误

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- NEW: 记忆功能 (Persistence) ---
  useEffect(() => {
    // 页面加载时读取本地存储
    const savedTheme = localStorage.getItem('zenflow_theme') as 'light' | 'dark';
    const savedLang = localStorage.getItem('zenflow_lang') as LangKey;
    const savedVolume = localStorage.getItem('zenflow_volume');

    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLang(savedLang);
    if (savedVolume) setVolume(parseFloat(savedVolume));

    setIsInitialized(true); // 标记初始化完成，显示 UI
  }, []);

  // 监听变化并保存
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('zenflow_theme', theme);
      localStorage.setItem('zenflow_lang', lang);
      localStorage.setItem('zenflow_volume', volume.toString());
    }
  }, [theme, lang, volume, isInitialized]);

  // --- 结束记忆功能 ---

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
    const list = scene.playlist;
    if (!list || list.length === 0) return;

    if (list.length === 1) {
      if (currentSongUrl !== list[0]) setCurrentSongUrl(list[0]);
      setIsPlaying(true);
      return;
    }

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
        playPromise.catch(error => {
          console.error("Playback error:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
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
  };

  // 如果还没读取完本地配置，先渲染一个空壳，防止闪烁
  if (!isInitialized) return <div className="min-h-screen bg-slate-950"></div>;

  return (
    <div className={`${theme} transition-colors duration-500`}>
      <div className={`relative min-h-screen font-sans transition-colors duration-500
        ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-800'}
      `}>

        <audio
          ref={audioRef}
          key={currentSongUrl}
          src={currentSongUrl}
          preload="none"
          onEnded={() => activeScene && playRandomTrack(activeScene)}
          onError={(e) => {
            console.error("Audio Load Error:", e);
            setErrorMsg(t.error);
            setIsPlaying(false);
          }}
        />

        {/* --- 视觉层 --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className={`absolute inset-0 bg-[size:40px_40px] opacity-30
            ${theme === 'dark'
              ? 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]'
              : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}
          `}></div>
          <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full blur-[80px] opacity-30 transform-gpu transition-colors duration-1000
             ${activeScene ? activeScene.bgGradient : (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-200/40')}
          `}></div>
        </div>

        {/* --- Header --- */}
        <header className="fixed top-0 left-0 w-full px-4 py-4 md:p-6 flex justify-between items-center z-40 bg-gradient-to-b from-black/5 to-transparent pointer-events-none">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group pointer-events-auto" onClick={handleBack}>
            <div className={`relative w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border rounded-md transition-colors
              ${theme === 'dark' ? 'border-white/20' : 'border-black/10'}
            `}>
              <div className={`w-2 h-2 rounded-sm ${isPlaying ? 'animate-ping' : ''} ${theme === 'dark' ? 'bg-white' : 'bg-slate-800'}`}></div>
            </div>
            <span className="font-mono font-bold tracking-[0.2em] text-xs md:text-sm opacity-80 uppercase">
              {t.app_title}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
            {activeScene && (
              <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-colors
                ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}
              `}>
                <Volume2 size={16} className="opacity-50" />
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-current opacity-30 hover:opacity-100"
                />
              </div>
            )}
            <button
              onClick={toggleLang}
              className="p-2 rounded-full border active:scale-95 transition-transform bg-white/10 border-white/10 flex items-center justify-center w-9 h-9 font-mono text-xs font-bold"
              title="Switch Language"
            >
              {lang.toUpperCase()}
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full border active:scale-95 transition-transform bg-white/10 border-white/10"><Sun size={18} /></button>
            <button onClick={() => setIsScreensaver(true)} className="p-2 rounded-full border active:scale-95 transition-transform bg-white/10 border-white/10"><Monitor size={18} /></button>
          </div>
        </header>

        {/* --- Screensaver --- */}
        {isScreensaver && (
           <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white animate-fade-in touch-none" onClick={() => setIsScreensaver(false)}>
             <div className="absolute inset-0 bg-black/40 z-0"></div>
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-20 animate-pulse-slow transform-gpu ${activeScene ? activeScene.accent.replace('bg-', 'bg-') : 'bg-blue-500'}`}></div>
             <div className="z-10 text-center space-y-4 select-none">
               <LiveClock />
               <p className="text-sm md:text-3xl font-light opacity-50 tracking-[0.5em] uppercase">
                 {activeSceneTranslation ? activeSceneTranslation.title : t.system_idle}
               </p>
               <p className="text-xs opacity-30 mt-12 animate-pulse">{t.tap_wake}</p>
             </div>
           </div>
        )}

        {/* --- Main Content --- */}
        <main className="relative container mx-auto px-4 pt-24 pb-12 md:px-6 min-h-screen flex flex-col justify-center items-center z-10">
          {!activeScene && (
            <div className="w-full max-w-6xl animate-fade-in-up">
              <div className="text-center mb-10 md:mb-16 space-y-3">
                 <h1 className="text-4xl md:text-7xl font-bold tracking-tighter opacity-90">{t.select_mode}</h1>
                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono tracking-widest uppercase
                  ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/50' : 'border-black/10 bg-black/5 text-slate-500'}
                `}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  {t.ready_focus}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {SCENES_CONFIG.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneSelect(scene)}
                    className={`group relative h-48 md:h-80 rounded-2xl border transition-all duration-300 active:scale-[0.98]
                      ${theme === 'dark' ? 'bg-[#0f172a] border-white/10' : 'bg-white border-black/5 shadow-sm'}
                    `}
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${scene.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6 z-10">
                      <div className="flex justify-between items-start">
                        <div className={`p-2 md:p-3 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/80' : 'bg-white border-black/5 text-slate-600'} group-hover:bg-white/20 group-hover:text-white`}>
                          {scene.icon}
                        </div>
                        <div className="text-[10px] font-mono opacity-40 font-bold tracking-wider">{scene.freq}</div>
                      </div>
                      <div className="space-y-1 text-left">
                        {/* 动态获取翻译 */}
                        <p className={`font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-60 group-hover:text-white ${scene.color} dark:text-opacity-100`}>
                          {t.scenes[scene.id as keyof typeof t.scenes].subtitle}
                        </p>
                        <h3 className="text-lg md:text-xl font-bold tracking-tight group-hover:text-white transition-colors">
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
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 w-full max-w-6xl animate-fade-in relative pb-10">
              <div className="flex flex-col items-center justify-center flex-1 order-1">
                <div className="relative mb-8 md:mb-12 scale-90 md:scale-100">
                  <div className={`absolute inset-[-40px] rounded-full border border-dashed opacity-20 transform-gpu ${isPlaying ? 'animate-spin-slow' : ''} ${theme === 'dark' ? 'border-white' : 'border-black'}`}></div>
                  <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 transition-opacity duration-1000 transform-gpu ${activeScene.accent} ${isPlaying ? 'opacity-40' : 'opacity-20'}`}></div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`relative w-40 h-40 md:w-56 md:h-56 rounded-full border backdrop-blur-xl flex items-center justify-center shadow-2xl transition-transform active:scale-95 group z-10
                      ${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-white/50'}
                    `}
                  >
                    {isPlaying ? (
                      <Pause size={48} className={`fill-current ${activeScene.color} opacity-90`} />
                    ) : (
                      <Play size={48} className={`ml-2 fill-current ${activeScene.color} opacity-90`} />
                    )}
                  </button>

                  {activeScene.playlist.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); playRandomTrack(activeScene); }} className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 p-3 rounded-full border shadow-lg active:scale-90 transition-transform z-20 bg-white/10 border-white/10">
                      <SkipForward size={20} />
                    </button>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{activeSceneTranslation.title}</h2>
                  <div className="inline-flex items-center gap-2 opacity-60">
                     {errorMsg ? (
                       <>
                         <AlertCircle size={14} className="text-red-500" />
                         <span className="text-xs font-mono uppercase tracking-widest text-red-500">{errorMsg}</span>
                       </>
                     ) : (
                       <>
                         <Signal size={14} className={isPlaying ? 'animate-pulse text-green-500' : ''} />
                         <span className="text-xs font-mono uppercase tracking-widest">
                           {isPlaying ? t.playing : t.paused}
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
        .transform-gpu { transform: translate3d(0, 0, 0); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}