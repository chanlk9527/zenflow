"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Radio, Activity, Sun, Monitor, Timer, X, Maximize
} from "lucide-react";

// --- 配置数据 ---
const SCENES = [
  {
    id: "focus",
    title: "DEEP FOCUS",
    subtitle: "High Beta Waves",
    icon: <Zap size={24} />,
    // 定义两种模式的颜色：[亮色模式, 暗色模式]
    color: "text-blue-600 dark:text-cyan-400",
    bgGradient: "from-blue-100 to-indigo-100 dark:from-cyan-900/40 dark:to-blue-900/40",
    accent: "bg-blue-500 dark:bg-cyan-400",
    playlist: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    ]
  },
  {
    id: "relax",
    title: "RELAXATION",
    subtitle: "Alpha Waves",
    icon: <Wind size={24} />,
    color: "text-teal-600 dark:text-emerald-400",
    bgGradient: "from-teal-100 to-emerald-100 dark:from-emerald-900/40 dark:to-teal-900/40",
    accent: "bg-teal-500 dark:bg-emerald-400",
    playlist: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    ]
  },
  {
    id: "sleep",
    title: "SLEEP MOD",
    subtitle: "Delta Waves",
    icon: <Moon size={24} />,
    color: "text-indigo-600 dark:text-violet-400",
    bgGradient: "from-indigo-100 to-purple-100 dark:from-violet-900/40 dark:to-indigo-900/40",
    accent: "bg-indigo-500 dark:bg-violet-400",
    playlist: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
    ]
  },
  {
    id: "creative",
    title: "CREATIVE",
    subtitle: "Theta Waves",
    icon: <Coffee size={24} />,
    color: "text-orange-600 dark:text-amber-400",
    bgGradient: "from-orange-100 to-amber-100 dark:from-amber-900/40 dark:to-orange-900/40",
    accent: "bg-orange-500 dark:bg-amber-400",
    playlist: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
    ]
  },
];

export default function ZenFlowApp() {
  // --- 全局状态 ---
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // 主题
  const [activeScene, setActiveScene] = useState<typeof SCENES[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSongUrl, setCurrentSongUrl] = useState<string>("");
  const [isScreensaver, setIsScreensaver] = useState(false); // 屏保模式

  // --- 番茄钟状态 ---
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 播放逻辑 ---
  const playRandomTrack = (scene: typeof SCENES[0]) => {
    const list = scene.playlist;
    if (list.length === 1) {
      setCurrentSongUrl(list[0]);
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
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio Error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume, currentSongUrl]);

  // --- 番茄钟逻辑 ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      // 可以在这里加一个简单的提示音，暂时略过
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
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

  // --- 屏保时间逻辑 ---
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 交互处理 ---
  const handleSceneSelect = (scene: typeof SCENES[0]) => {
    setActiveScene(scene);
    playRandomTrack(scene);
  };

  const handleBack = () => {
    setIsPlaying(false);
    setActiveScene(null);
    setCurrentSongUrl("");
  };

  return (
    <div className={`${theme} transition-colors duration-700`}>
      {/* 背景容器：根据 dark/light 模式切换颜色 */}
      <div className={`relative min-h-screen font-sans overflow-hidden transition-colors duration-700
        ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-800'}
      `}>

        <audio ref={audioRef} key={currentSongUrl} src={currentSongUrl} onEnded={() => activeScene && playRandomTrack(activeScene)} loop={false} />

        {/* --- 装饰性背景 (网格 + 光晕) --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 网格 - 亮色模式下淡一点，暗色模式下明显一点 */}
          <div className={`absolute inset-0 bg-[size:40px_40px]
            ${theme === 'dark'
              ? 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]'
              : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}
          `}></div>

          {/* 顶部环境光 - 根据场景变化 */}
          <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full blur-[100px] opacity-30 transition-all duration-1000
             ${activeScene ? activeScene.bgGradient : (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-200/40')}
          `}></div>
        </div>

        {/* --- 顶部栏 --- */}
        <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-40">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBack}>
             {/* Logo */}
            <div className={`relative w-8 h-8 flex items-center justify-center border rounded-md transition-all
              ${theme === 'dark' ? 'border-white/20' : 'border-black/10'}
            `}>
              <div className={`w-2 h-2 rounded-sm ${isPlaying ? 'animate-ping' : ''} ${theme === 'dark' ? 'bg-white' : 'bg-slate-800'}`}></div>
            </div>
            <span className="font-mono font-bold tracking-[0.2em] text-sm opacity-80">
              ZENFLOW
            </span>
          </div>

          <div className="flex items-center gap-4">
             {/* 只有在播放时显示音量 */}
            {activeScene && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-colors
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

            {/* 主题切换按钮 */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full border transition-all hover:scale-105
                ${theme === 'dark' ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white border-black/5 hover:bg-gray-200 shadow-sm'}
              `}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* 屏保开关 */}
             <button
              onClick={() => setIsScreensaver(true)}
              className={`p-2 rounded-full border transition-all hover:scale-105
                ${theme === 'dark' ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white border-black/5 hover:bg-gray-200 shadow-sm'}
              `}
              title="Screensaver Mode"
            >
              <Monitor size={18} />
            </button>
          </div>
        </header>

        {/* --- 屏保覆盖层 (Screensaver) --- */}
        {isScreensaver && (
           <div
             className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-none bg-black text-white animate-fade-in"
             onClick={() => setIsScreensaver(false)}
             onMouseMove={() => {/* 可以在这里做逻辑，比如动鼠标显示退出提示 */}}
           >
             <div className="absolute inset-0 bg-black/40 z-0"></div>
             {/* 屏保背景流光 */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-20 animate-pulse-slow
               ${activeScene ? activeScene.accent.replace('bg-', 'bg-') : 'bg-blue-500'}
             `}></div>

             <div className="z-10 text-center space-y-4 select-none">
               <h1 className="text-[15vw] leading-none font-bold font-mono tracking-tighter opacity-90">
                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </h1>
               <p className="text-xl md:text-3xl font-light opacity-50 tracking-[0.5em] uppercase">
                 {activeScene ? activeScene.title : "SYSTEM IDLE"}
               </p>
               <p className="text-sm opacity-30 mt-12 animate-pulse">Click anywhere to wake up</p>
             </div>
           </div>
        )}

        {/* --- 主内容区 --- */}
        <main className="relative container mx-auto px-6 h-screen flex flex-col justify-center items-center z-10">

          {/* 1. 首页：场景选择 */}
          {!activeScene && (
            <div className="w-full max-w-5xl animate-fade-in-up">
              <div className="text-center mb-16 space-y-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono tracking-widest uppercase mb-4
                  ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/50' : 'border-black/10 bg-black/5 text-slate-500'}
                `}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Ready to Focus
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter opacity-90">
                  SELECT MODE
                </h1>
                <p className="font-mono text-sm opacity-50 tracking-wide uppercase">
                  Customize your auditory environment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneSelect(scene)}
                    className={`group relative h-64 rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl
                      ${theme === 'dark'
                        ? 'bg-[#0f172a] border-white/10 hover:border-white/30'
                        : 'bg-white border-black/5 hover:border-black/20 shadow-sm'}
                    `}
                  >
                    {/* 悬停时的背景染色 */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${scene.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                    <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl border transition-colors
                          ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/80' : 'bg-white border-black/5 text-slate-600'}
                          group-hover:bg-white/20 group-hover:text-white
                        `}>
                          {scene.icon}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <p className={`font-mono text-[10px] uppercase tracking-widest opacity-60 group-hover:text-white ${scene.color} dark:text-opacity-100`}>
                          {scene.subtitle}
                        </p>
                        <h3 className="text-xl font-bold tracking-tight group-hover:text-white transition-colors">
                          {scene.title}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. 播放器 + 番茄钟界面 */}
          {activeScene && (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-5xl animate-fade-in relative">

              {/* 左侧：播放控制核心 */}
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative mb-12">
                   {/* 旋转轨道 */}
                  <div className={`absolute inset-[-40px] rounded-full border border-dashed opacity-20 ${isPlaying ? 'animate-spin-slow' : ''} ${theme === 'dark' ? 'border-white' : 'border-black'}`}></div>
                  <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 transition-all duration-1000 ${activeScene.accent} ${isPlaying ? 'scale-125 opacity-40' : 'scale-100'}`}></div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`relative w-48 h-48 rounded-full border backdrop-blur-xl flex items-center justify-center shadow-2xl transition-transform active:scale-95 group z-10
                      ${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-white/50'}
                    `}
                  >
                    {isPlaying ? (
                      <Pause size={56} className={`fill-current ${activeScene.color} opacity-90`} />
                    ) : (
                      <Play size={56} className={`ml-2 fill-current ${activeScene.color} opacity-90`} />
                    )}
                  </button>

                  {/* 切歌按钮 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); playRandomTrack(activeScene); }}
                    className={`absolute -right-8 top-1/2 -translate-y-1/2 p-3 rounded-full border shadow-lg hover:scale-110 transition-all z-20
                       ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white/50 hover:text-white' : 'bg-white border-black/5 text-slate-400 hover:text-slate-800'}
                    `}
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight">{activeScene.title}</h2>
                  <div className="inline-flex items-center gap-2 opacity-60">
                     <Radio size={14} className={isPlaying ? 'animate-pulse' : ''} />
                     <span className="text-xs font-mono uppercase tracking-widest">{isPlaying ? "Playing" : "Paused"}</span>
                  </div>
                </div>
              </div>

              {/* 右侧：番茄钟面板 (新增) */}
              <div className={`relative w-full lg:w-80 p-6 rounded-3xl border backdrop-blur-md transition-colors
                 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5 shadow-lg'}
              `}>
                <div className="flex items-center gap-2 mb-6 opacity-50">
                   <Timer size={16} />
                   <span className="text-xs font-mono font-bold uppercase tracking-widest">Focus Timer</span>
                </div>

                <div className="text-center mb-8">
                  <div className="text-6xl font-mono font-bold tabular-nums tracking-tighter mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => resetTimer('work')}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${timerMode === 'work' ? activeScene.accent + ' text-white' : 'opacity-30 hover:opacity-100'}`}
                    >
                      WORK
                    </button>
                    <button
                      onClick={() => resetTimer('break')}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${timerMode === 'break' ? 'bg-green-500 text-white' : 'opacity-30 hover:opacity-100'}`}
                    >
                      BREAK
                    </button>
                  </div>
                </div>

                <button
                  onClick={toggleTimer}
                  className={`w-full py-4 rounded-xl font-bold tracking-widest transition-all hover:brightness-110 active:scale-95
                    ${isTimerRunning
                      ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600')
                      : activeScene.accent + ' text-white shadow-lg shadow-' + activeScene.color.split('-')[1] + '-500/30'
                    }
                  `}
                >
                  {isTimerRunning ? "PAUSE" : "START TIMER"}
                </button>
              </div>

            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}