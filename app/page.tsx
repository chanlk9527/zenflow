"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Volume1, VolumeX, Wind, SkipForward,
  Sun, Monitor, Signal, AlertCircle, Bell, Loader2, Sparkles,
  CloudRain, Flame, Bird, SlidersHorizontal, Info
} from "lucide-react";

// --- 1. 数据与多语言配置 ---

type LangKey = 'en' | 'cn' | 'jp';

const TRANSLATIONS = {
  en: {
    app_title: "ZENFLOW",
    select_mode: "Select Frequency",
    ready_focus: "System Ready",
    system_idle: "System Idle",
    tap_wake: "Tap to Resume",
    playing: "Live Signal",
    paused: "Signal Paused",
    connecting: "Tuning In...",
    error: "Signal Lost",
    mixer_title: "Sound Mixer",
    timer: {
      title: "Focus Timer",
      work: "Focus",
      break: "Breathe",
      start: "Start",
      pause: "Pause",
      ended: "Session Complete"
    },
    scenes: {
      focus: { title: "Lo-Fi Study", subtitle: "Laut.fm Stream" },
      relax: { title: "Groove Salad", subtitle: "SomaFM Chill" },
      cafe: { title: "Coffee Jazz", subtitle: "Bistro Vibes" },
      sleep: { title: "Drone Zone", subtitle: "SomaFM Ambient" },
      creative: { title: "Beat Blender", subtitle: "Deep House" }
    }
  },
  cn: {
    app_title: "心流电台",
    select_mode: "选择频率",
    ready_focus: "系统就绪",
    system_idle: "系统待机",
    tap_wake: "点击唤醒",
    playing: "直播中",
    paused: "已暂停",
    connecting: "正在调频...",
    error: "信号中断",
    mixer_title: "白噪音混音",
    timer: {
      title: "专注计时器",
      work: "专注",
      break: "呼吸",
      start: "开始",
      pause: "暂停",
      ended: "专注结束"
    },
    scenes: {
      focus: { title: "深度专注", subtitle: "Lo-Fi 学习频道" },
      relax: { title: "舒缓律动", subtitle: "Groove Salad 经典" },
      cafe: { title: "午后咖啡", subtitle: "爵士 & 小酒馆" },
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
    connecting: "チューニング中...",
    error: "接続エラー",
    mixer_title: "環境音ミキサー",
    timer: {
      title: "タイマー",
      work: "集中",
      break: "深呼吸",
      start: "開始",
      pause: "停止",
      ended: "終了"
    },
    scenes: {
      focus: { title: "集中学習", subtitle: "Lo-Fi ストリーム" },
      relax: { title: "リラックス", subtitle: "チルアウト・ビート" },
      cafe: { title: "カフェ・ジャズ", subtitle: "ビストロの雰囲気" },
      sleep: { title: "睡眠導入", subtitle: "ドローン・アンビエント" },
      creative: { title: "創造性", subtitle: "ディープ・ハウス" }
    }
  }
};

// 场景配置：每个场景增加了备用源，用于“切台”功能
const SCENES_CONFIG = [
  {
    id: "focus",
    icon: <Zap size={24} />,
    color: "text-purple-500",
    accentColor: "bg-purple-500",
    bgGradient: "from-purple-500/10 to-blue-500/10",
    playlist: [
      "https://stream.laut.fm/lofi",
      "https://stream.laut.fm/study-beats",
      "https://ice4.somafm.com/groovesalad-128-mp3"
    ]
  },
  {
    id: "relax",
    icon: <Wind size={24} />,
    color: "text-teal-500",
    accentColor: "bg-teal-500",
    bgGradient: "from-teal-500/10 to-emerald-500/10",
    playlist: [
      "https://ice2.somafm.com/groovesalad-128-mp3",
      "https://ice2.somafm.com/lush-128-mp3"
    ]
  },
  {
    id: "cafe",
    icon: <Coffee size={24} />,
    color: "text-amber-600",
    accentColor: "bg-amber-600",
    bgGradient: "from-amber-500/10 to-orange-500/10",
    playlist: [
      "https://listen.181fm.com/181-classicalguitar_128k.mp3",
      "https://ice2.somafm.com/illstreet-128-mp3", // Cool Jazz
      "https://stream.laut.fm/kaffeehaus"
    ]
  },
  {
    id: "sleep",
    icon: <Moon size={24} />,
    color: "text-indigo-500",
    accentColor: "bg-indigo-500",
    bgGradient: "from-indigo-500/10 to-violet-500/10",
    playlist: [
      "https://ice2.somafm.com/dronezone-128-mp3",
      "https://ice2.somafm.com/deepspaceone-128-mp3"
    ]
  },
  {
    id: "creative",
    icon: <Sparkles size={24} />,
    color: "text-pink-500",
    accentColor: "bg-pink-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    playlist: [
      "https://ice2.somafm.com/beatblender-128-mp3",
      "https://ice2.somafm.com/fluid-128-mp3"
    ]
  },
];

// V1.2 新增：环境音配置
const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, url: "https://cdn.pixabay.com/download/audio/2022/07/04/audio_b28741e15e.mp3" }, // Loopable Rain
  { id: 'fire', icon: Flame, url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_c3c137fa69.mp3" }, // Fireplace
  { id: 'birds', icon: Bird, url: "https://cdn.pixabay.com/download/audio/2022/02/10/audio_55e2d1eb96.mp3" }  // Forest Birds
];

// --- 2. 视觉组件 ---

const AuroraBackground = memo(({ activeScene, theme }: { activeScene: any, theme: string }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000 ease-in-out">
      <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#F2F2F7]'}`}></div>
      <div className={`absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[80px] opacity-40 transform-gpu transition-all duration-1000
         ${activeScene ? activeScene.bgGradient.split(' ')[0] : 'bg-blue-500/5'}`}></div>
      <div className={`absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-30 transform-gpu transition-all duration-1000
         ${activeScene ? activeScene.bgGradient.split(' ')[2] : 'bg-purple-500/5'}`}></div>
    </div>
  );
});
AuroraBackground.displayName = "AuroraBackground";

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
    <h1 className="text-[12vw] font-bold tracking-tight opacity-90 select-none will-change-contents font-sans">
      {time}
    </h1>
  );
});
LiveClock.displayName = "LiveClock";

// V1.3 新增：呼吸辅助组件 (用于 Break 模式)
const BreathingGuide = ({ accentColor }: { accentColor: string }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-fade-in">
       <div className={`relative w-48 h-48 flex items-center justify-center`}>
          <div className={`absolute inset-0 rounded-full opacity-20 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] ${accentColor}`}></div>
          <div className={`absolute inset-0 rounded-full opacity-10 animate-[pulse_4s_ease-in-out_infinite] scale-150 ${accentColor}`}></div>
       </div>
    </div>
  );
};

const PomodoroTimer = ({ accentColor, theme, lang }: { accentColor: string, theme: string, lang: LangKey }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
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

  const setPreset = (minutes: number, newMode: 'work' | 'break') => {
    setIsTimerRunning(false);
    setMode(newMode);
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
    <div className={`
       relative w-full max-w-sm p-6 rounded-[2rem] border transition-all duration-300 order-2
       backdrop-blur-2xl saturate-150 shadow-xl overflow-hidden
       ${theme === 'dark'
         ? 'bg-white/5 border-white/10 shadow-black/20'
         : 'bg-white/60 border-white/40 shadow-slate-200/50'}
    `}>
      {/* 休息模式下的呼吸引导背景 */}
      {mode === 'break' && isTimerRunning && <BreathingGuide accentColor={accentColor} />}

      <div className="relative z-20">
        <div className="flex items-center justify-between mb-8 opacity-60 px-1">
           <span className="text-xs font-bold uppercase tracking-wider">{t.title}</span>
           {timeLeft === 0 && <Bell size={16} className="text-yellow-500 animate-bounce" />}
        </div>
        <div className="text-center mb-8">
          <div className={`text-6xl font-medium tabular-nums tracking-tight mb-8 transition-colors
             ${timeLeft === 0 ? 'text-green-500' : ''}
          `}>
            {timeLeft === 0 ? "00:00" : formatTime(timeLeft)}
          </div>
          <div className="mb-8 px-1 group relative h-6 flex items-center">
            <input
              type="range" min="1" max="90" step="1"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-current opacity-10 hover:opacity-30 transition-opacity z-10"
            />
            <div className={`absolute h-1.5 rounded-full pointer-events-none transition-all duration-300 opacity-80 ${accentColor}`}
                 style={{width: `${(sliderValue / 90) * 100}%`}}></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPreset(25, 'work')}
               className={`py-3 text-xs font-bold rounded-xl transition-all
                 ${mode === 'work'
                   ? (theme === 'dark' ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg')
                   : 'bg-current/5 hover:bg-current/10'}
               `}>
               {t.work}
             </button>
             <button onClick={() => setPreset(5, 'break')}
               className={`py-3 text-xs font-bold rounded-xl transition-all
                 ${mode === 'break'
                   ? (theme === 'dark' ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg')
                   : 'bg-current/5 hover:bg-current/10'}
               `}>
               {t.break}
             </button>
          </div>
        </div>
        <button
          onClick={() => timeLeft === 0 ? setPreset(sliderValue, mode) : setIsTimerRunning(!isTimerRunning)}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg
            ${isTimerRunning
              ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600')
              : (timeLeft === 0 ? 'bg-green-500 text-white' : accentColor + ' text-white')
            }
          `}
        >
          {timeLeft === 0 ? "RESET" : (isTimerRunning ? t.pause : t.start)}
        </button>
      </div>
    </div>
  );
};

// --- 3. 主程序 ---

export default function ZenFlowApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSongUrl, setCurrentSongUrl] = useState<string>("");
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // V1.2: 环境音状态
  const [ambientVolumes, setAmbientVolumes] = useState<{[key:string]: number}>({ rain: 0, fire: 0, birds: 0 });

  const [isScreensaver, setIsScreensaver] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 环境音 Refs
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  // 初始化与持久化
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

  // 键盘快捷键 (V1.1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeSceneId) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        const scene = SCENES_CONFIG.find(s => s.id === activeSceneId);
        if (scene) playRandomTrack(scene);
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(prev => Math.min(1, prev + 0.1));
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 0.1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSceneId]);

  const t = TRANSLATIONS[lang];
  const activeScene = activeSceneId ? SCENES_CONFIG.find(s => s.id === activeSceneId) : null;
  const activeSceneTranslation = activeSceneId ? t.scenes[activeSceneId as keyof typeof t.scenes] : null;

  const toggleLang = () => {
    if (lang === 'en') setLang('cn');
    else if (lang === 'cn') setLang('jp');
    else setLang('en');
  };

  // 播放逻辑优化 (支持切台，避免重复)
  const playRandomTrack = (scene: typeof SCENES_CONFIG[0]) => {
    setErrorMsg(null);
    setIsLoadingStream(true);
    const list = scene.playlist;

    // 如果只有一个源
    if (!list || list.length === 0) return;
    if (list.length === 1) {
      setCurrentSongUrl(list[0]);
      setIsPlaying(true);
      return;
    }

    // 随机选择一个不同的源
    let nextUrl;
    let attempts = 0;
    do {
      const randomIndex = Math.floor(Math.random() * list.length);
      nextUrl = list[randomIndex];
      attempts++;
    } while (nextUrl === currentSongUrl && attempts < 5);

    setCurrentSongUrl(nextUrl);
    setIsPlaying(true);
  };

  // 主音频效果
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsLoadingStream(false))
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

  // 环境音效果 (V1.2)
  useEffect(() => {
    const refs = { rain: rainRef.current, fire: fireRef.current, birds: birdsRef.current };

    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const audio = refs[key as keyof typeof refs];
      if (audio) {
        if (vol > 0 && isPlaying) {
          if (audio.paused) audio.play().catch(() => {});
          audio.volume = vol;
        } else {
          audio.pause();
        }
      }
    });
  }, [ambientVolumes, isPlaying]);

  const handleSceneSelect = (scene: typeof SCENES_CONFIG[0]) => {
    if (activeSceneId !== scene.id) {
      setIsPlaying(false);
      // Reset Ambience when changing scene? Optional. Keep for now.
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
    setAmbientVolumes({ rain: 0, fire: 0, birds: 0 }); // Reset mixer on exit
  };

  if (!isInitialized) return <div className="min-h-screen bg-black"></div>;

  return (
    <div className={`${theme} transition-colors duration-700`}>
      <div className={`relative min-h-screen font-sans transition-colors duration-700 overflow-hidden select-none
        ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
      `}>

        <AuroraBackground activeScene={activeScene} theme={theme} />

        {/* Hidden Audio Elements */}
        <audio
          ref={audioRef}
          src={currentSongUrl}
          preload="none"
          onPlaying={() => setIsLoadingStream(false)}
          onError={(e) => {
            console.error("Audio Load Error:", e);
            setErrorMsg(t.error);
            setIsPlaying(false);
            setIsLoadingStream(false);
          }}
        />
        {/* Ambient Loops */}
        {AMBIENT_SOUNDS.map(sound => (
          <audio
            key={sound.id}
            ref={sound.id === 'rain' ? rainRef : sound.id === 'fire' ? fireRef : birdsRef}
            src={sound.url}
            loop
          />
        ))}

        {/* Header */}
        <header className="fixed top-0 left-0 w-full px-4 py-4 md:px-6 md:py-6 flex justify-between items-center z-50">
          <div className="flex items-center gap-3 cursor-pointer group active:opacity-70 transition-opacity" onClick={handleBack}>
            <div className={`relative w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur-md shadow-sm border
              ${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white/60 border-white/40'}
            `}>
               <div className="flex gap-[3px] items-end h-3">
                 <div className={`w-[3px] bg-current rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite]' : 'h-1.5 opacity-40'}`}></div>
                 <div className={`w-[3px] bg-current rounded-full ${isPlaying ? 'animate-[bounce_1.2s_infinite]' : 'h-3 opacity-40'}`}></div>
                 <div className={`w-[3px] bg-current rounded-full ${isPlaying ? 'animate-[bounce_0.8s_infinite]' : 'h-2 opacity-40'}`}></div>
              </div>
            </div>
            <span className="font-bold tracking-widest text-xs opacity-90 uppercase hidden sm:block">
              {t.app_title}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {activeScene && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md transition-colors mr-2
                ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/40'}
              `}>
                {volume === 0 ? <VolumeX size={14} className="opacity-50" /> : <Volume2 size={14} className="opacity-50" />}
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 md:w-24 h-1 rounded-lg appearance-none cursor-pointer bg-current opacity-20 hover:opacity-80"
                />
              </div>
            )}

            {[
              { icon: <span className="text-[10px] font-bold">{lang.toUpperCase()}</span>, action: toggleLang },
              { icon: <Sun size={18} />, action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
              { icon: <Monitor size={18} />, action: () => setIsScreensaver(true) }
            ].map((btn, i) => (
              <button key={i} onClick={btn.action}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95
                  ${theme === 'dark' ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white/40 border-white/40 hover:bg-white/60 shadow-sm'}
                `}>
                {btn.icon}
              </button>
            ))}
          </div>
        </header>

        {/* Screensaver */}
        {isScreensaver && (
           <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white animate-fade-in cursor-none" onClick={() => setIsScreensaver(false)}>
             <div className="absolute inset-0 bg-black z-0"></div>
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-30 animate-pulse
               ${activeScene ? activeScene.accentColor.replace('bg-', 'bg-') : 'bg-blue-500'}`}></div>
             <div className="z-10 text-center space-y-8 select-none">
               <LiveClock />
               <div className="space-y-2">
                 <p className="text-xl md:text-3xl font-light tracking-[0.2em] uppercase opacity-80">
                   {activeSceneTranslation ? activeSceneTranslation.title : t.system_idle}
                 </p>
                 <p className="text-xs font-mono opacity-40 uppercase tracking-widest">{t.tap_wake}</p>
               </div>
             </div>
           </div>
        )}

        {/* Main Content */}
        <main className="relative container mx-auto px-4 pt-24 pb-12 md:px-6 min-h-screen flex flex-col justify-center items-center z-10">
          {!activeScene && (
            <div className="w-full max-w-6xl animate-fade-in-up">
              <div className="text-center mb-10 md:mb-16 space-y-6">
                 <h1 className="text-5xl md:text-8xl font-bold tracking-tighter opacity-90">
                   {t.select_mode}
                 </h1>
                 <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase backdrop-blur-xl
                  ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/60' : 'border-black/5 bg-white/40 text-slate-500'}
                `}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  {t.ready_focus}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {SCENES_CONFIG.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneSelect(scene)}
                    className={`group relative h-48 md:h-64 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.2rem)] xl:w-64 rounded-[2rem] border transition-all duration-300 active:scale-[0.98] overflow-hidden hover:-translate-y-2 hover:shadow-2xl
                      backdrop-blur-2xl saturate-150 flex-shrink-0
                      ${theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-black/20'
                        : 'bg-white/40 border-white/60 hover:bg-white/60 shadow-slate-200/50'}
                    `}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${scene.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 z-10">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 md:p-4 rounded-2xl border backdrop-blur-sm transition-all
                          ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-white/50 text-slate-700'}
                        `}>
                          {scene.icon}
                        </div>
                      </div>
                      <div className="space-y-1 text-left">
                        <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity ${scene.color}`}>
                          {t.scenes[scene.id as keyof typeof t.scenes].subtitle}
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight">
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
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-24 w-full max-w-6xl animate-fade-in relative pb-10">

              {/* Player Section */}
              <div className="flex flex-col items-center justify-center flex-1 order-1 w-full max-w-md">

                {/* Visualizer & Main Button */}
                <div className="relative mb-8 md:mb-12 mt-4 md:mt-0">
                  <div className={`absolute inset-[-30px] rounded-full blur-[50px] opacity-20 transition-all duration-1000 ${activeScene.accentColor} ${isPlaying ? 'scale-110 opacity-30' : 'scale-100 opacity-10'}`}></div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`
                        relative w-40 h-40 md:w-56 md:h-56 rounded-full border backdrop-blur-3xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group z-10
                        ${theme === 'dark'
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-white/30 border-white/50 hover:bg-white/40'}
                      `}
                    >
                      {isLoadingStream && isPlaying && (
                         <div className="absolute inset-0 flex items-center justify-center z-20">
                            <Loader2 size={48} className="animate-spin opacity-50" />
                         </div>
                      )}

                      <div className={`transition-all duration-500 ${isLoadingStream && isPlaying ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                         {isPlaying ? (
                            <Pause size={56} className={`fill-current ${activeScene.color} opacity-90`} />
                          ) : (
                            <Play size={56} className={`ml-2 fill-current ${activeScene.color} opacity-90`} />
                          )}
                      </div>
                    </button>

                    {/* V1.1 新增：手动切台按钮 */}
                    <button
                      onClick={() => playRandomTrack(activeScene)}
                      disabled={!isPlaying}
                      className={`
                         flex flex-col items-center justify-center w-14 h-14 rounded-2xl border backdrop-blur-md transition-all active:scale-90
                         ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/40 hover:bg-white/50'}
                         ${!isPlaying ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}
                      `}
                      title="Next Station"
                    >
                      <SkipForward size={20} className={activeScene.color} />
                    </button>
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-3 mb-10">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                    {activeSceneTranslation.title}
                  </h2>
                  <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md
                     ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/40'}
                  `}>
                     {errorMsg ? (
                       <>
                         <AlertCircle size={14} className="text-red-500" />
                         <span className="text-xs font-bold uppercase tracking-widest text-red-500">{errorMsg}</span>
                       </>
                     ) : (
                       <>
                         <Signal size={14} className={isPlaying ? 'animate-pulse text-green-500' : ''} />
                         <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                           {isLoadingStream && isPlaying ? t.connecting : (isPlaying ? t.playing : t.paused)}
                         </span>
                       </>
                     )}
                  </div>
                </div>

                {/* V1.2 新增：环境音混音台 (Sound Mixer) */}
                <div className={`w-full p-5 rounded-3xl border backdrop-blur-md transition-all
                   ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/30 border-white/40'}
                `}>
                  <div className="flex items-center gap-2 mb-4 opacity-60">
                    <SlidersHorizontal size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.mixer_title}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    {AMBIENT_SOUNDS.map(sound => (
                      <div key={sound.id} className="flex flex-col items-center gap-3 flex-1 group">
                         <button
                           onClick={() => setAmbientVolumes(prev => ({...prev, [sound.id]: prev[sound.id] > 0 ? 0 : 0.5 }))}
                           className={`p-3 rounded-xl transition-all duration-300
                           ${ambientVolumes[sound.id] > 0
                             ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-white/80 text-black shadow-sm')
                             : 'opacity-40 hover:opacity-70 bg-transparent'}
                         `}>
                           <sound.icon size={20} />
                         </button>
                         <div className="h-24 w-1.5 rounded-full bg-current/10 relative">
                           <input
                             type="range" min="0" max="1" step="0.05"
                             value={ambientVolumes[sound.id]}
                             onChange={(e) => setAmbientVolumes(prev => ({...prev, [sound.id]: parseFloat(e.target.value)}))}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           <div
                             className={`absolute bottom-0 w-full rounded-full transition-all duration-200 ${activeScene.accentColor}`}
                             style={{ height: `${ambientVolumes[sound.id] * 100}%` }}
                           ></div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <PomodoroTimer accentColor={activeScene.accentColor} theme={theme} lang={lang} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}