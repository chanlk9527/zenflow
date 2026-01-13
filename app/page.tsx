"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Radio, Sun, Monitor, Timer
} from "lucide-react";

// --- 1. 静态数据 (放在组件外，避免重复分配内存) ---
const SCENES = [
  {
    id: "focus",
    title: "DEEP FOCUS",
    subtitle: "High Beta Waves",
    freq: "14-30 Hz",
    icon: <Zap size={24} />,
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
    freq: "8-14 Hz",
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
    freq: "0.5-4 Hz",
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
    freq: "4-8 Hz",
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

// --- 2. 独立子组件：时钟 (解决每秒重绘整个页面的卡顿问题) ---
const LiveClock = memo(() => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className="text-[18vw] md:text-[15vw] leading-none font-bold font-mono tracking-tighter opacity-90 select-none will-change-contents">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </h1>
  );
});
LiveClock.displayName = "LiveClock";

// --- 3. 独立子组件：番茄钟 (解决倒计时卡顿) ---
const PomodoroTimer = ({ accentColor, theme }: { accentColor: string, theme: string }) => {
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
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

  return (
    <div className={`relative w-full max-w-sm lg:w-80 p-6 rounded-3xl border backdrop-blur-md transition-colors order-2
       ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5 shadow-lg'}
    `}>
      <div className="flex items-center gap-2 mb-6 opacity-50">
         <Timer size={16} />
         <span className="text-xs font-mono font-bold uppercase tracking-widest">Focus Timer</span>
      </div>

      <div className="text-center mb-8">
        <div className="text-5xl md:text-6xl font-mono font-bold tabular-nums tracking-tighter mb-4 will-change-contents">
          {formatTime(timeLeft)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => resetTimer('work')}
            className={`py-2 text-xs font-bold rounded-lg transition-colors border ${timerMode === 'work' ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            WORK (25)
          </button>
          <button
            onClick={() => resetTimer('break')}
            className={`py-2 text-xs font-bold rounded-lg transition-colors border ${timerMode === 'break' ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            BREAK (5)
          </button>
        </div>
      </div>

      <button
        onClick={toggleTimer}
        className={`w-full py-4 rounded-xl font-bold tracking-widest transition-transform active:scale-95 shadow-lg
          ${isTimerRunning
            ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600')
            : accentColor + ' text-white'
          }
        `}
      >
        {isTimerRunning ? "PAUSE" : "START SESSION"}
      </button>
    </div>
  );
};

// --- 4. 主程序 ---
export default function ZenFlowApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeScene, setActiveScene] = useState<typeof SCENES[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSongUrl, setCurrentSongUrl] = useState<string>("");
  const [isScreensaver, setIsScreensaver] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 播放控制 (逻辑未变，但性能更好) ---
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
    <div className={`${theme} transition-colors duration-500`}>
      <div className={`relative min-h-screen font-sans transition-colors duration-500
        ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-800'}
      `}>

        <audio ref={audioRef} key={currentSongUrl} src={currentSongUrl} onEnded={() => activeScene && playRandomTrack(activeScene)} />

        {/* --- 背景层 (使用 transform-gpu 加速) --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 网格背景 */}
          <div className={`absolute inset-0 bg-[size:40px_40px] opacity-30
            ${theme === 'dark'
              ? 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]'
              : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}
          `}></div>
          {/* 顶部光晕 (移除 transition-all 以减少计算，只改变 opacity) */}
          <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full blur-[80px] opacity-30 transform-gpu
             ${activeScene ? activeScene.bgGradient : (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-200/40')}
          `}></div>
        </div>

        {/* --- Header --- */}
        <header className="fixed top-0 left-0 w-full px-4 py-4 md:p-6 flex justify-between items-center z-40 bg-gradient-to-b from-black/5 to-transparent pointer-events-none">
          {/* pointer-events-auto 确保按钮可点击，header背景不挡触摸 */}
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group pointer-events-auto" onClick={handleBack}>
            <div className={`relative w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border rounded-md transition-colors
              ${theme === 'dark' ? 'border-white/20' : 'border-black/10'}
            `}>
              <div className={`w-2 h-2 rounded-sm ${isPlaying ? 'animate-ping' : ''} ${theme === 'dark' ? 'bg-white' : 'bg-slate-800'}`}></div>
            </div>
            <span className="font-mono font-bold tracking-[0.2em] text-xs md:text-sm opacity-80">
              ZENFLOW
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
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full border active:scale-95 transition-transform
                ${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-black/5 shadow-sm'}
              `}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
             <button
              onClick={() => setIsScreensaver(true)}
              className={`p-2 rounded-full border active:scale-95 transition-transform
                ${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-black/5 shadow-sm'}
              `}
            >
              <Monitor size={18} />
            </button>
          </div>
        </header>

        {/* --- Screensaver (性能优化版) --- */}
        {isScreensaver && (
           <div
             className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white animate-fade-in touch-none"
             onClick={() => setIsScreensaver(false)}
           >
             {/* 减少背景层级 */}
             <div className="absolute inset-0 bg-black/40 z-0"></div>
             {/* 光晕：使用 transform-gpu */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-20 animate-pulse-slow transform-gpu
               ${activeScene ? activeScene.accent.replace('bg-', 'bg-') : 'bg-blue-500'}
             `}></div>

             <div className="z-10 text-center space-y-4 select-none">
               {/* 这里的时钟已经是独立组件，不会导致父组件重绘 */}
               <LiveClock />
               <p className="text-sm md:text-3xl font-light opacity-50 tracking-[0.5em] uppercase">
                 {activeScene ? activeScene.title : "SYSTEM IDLE"}
               </p>
               <p className="text-xs opacity-30 mt-12 animate-pulse">Tap to wake up</p>
             </div>
           </div>
        )}

        {/* --- Main Content --- */}
        <main className="relative container mx-auto px-4 pt-24 pb-12 md:px-6 min-h-screen flex flex-col justify-center items-center z-10">

          {/* 1. Scene Selector */}
          {!activeScene && (
            <div className="w-full max-w-6xl animate-fade-in-up">
              <div className="text-center mb-10 md:mb-16 space-y-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono tracking-widest uppercase
                  ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/50' : 'border-black/10 bg-black/5 text-slate-500'}
                `}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Ready to Focus
                </div>
                <h1 className="text-4xl md:text-7xl font-bold tracking-tighter opacity-90">
                  SELECT MODE
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneSelect(scene)}
                    // 移除 overflow-hidden 和复杂阴影，提升移动端渲染性能
                    className={`group relative h-48 md:h-80 rounded-2xl border transition-all duration-300 active:scale-[0.98]
                      ${theme === 'dark'
                        ? 'bg-[#0f172a] border-white/10'
                        : 'bg-white border-black/5 shadow-sm'}
                    `}
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${scene.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* 静态化的背景图标，减少计算 */}
                    <div className={`absolute -bottom-8 -right-8 opacity-5 transform rotate-12 scale-150 ${scene.color} pointer-events-none`}>
                      <div className="scale-[5]">{scene.icon}</div>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6 z-10">
                      <div className="flex justify-between items-start">
                        <div className={`p-2 md:p-3 rounded-xl border transition-colors
                          ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/80' : 'bg-white border-black/5 text-slate-600'}
                          group-hover:bg-white/20 group-hover:text-white
                        `}>
                          {scene.icon}
                        </div>
                        <div className="text-[10px] font-mono opacity-40 font-bold tracking-wider">
                           {scene.freq}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <p className={`font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-60 group-hover:text-white ${scene.color} dark:text-opacity-100`}>
                          {scene.subtitle}
                        </p>
                        <h3 className="text-lg md:text-xl font-bold tracking-tight group-hover:text-white transition-colors">
                          {scene.title}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Player Interface */}
          {activeScene && (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 w-full max-w-6xl animate-fade-in relative pb-10">

              {/* Left: Player Core */}
              <div className="flex flex-col items-center justify-center flex-1 order-1">
                <div className="relative mb-8 md:mb-12 scale-90 md:scale-100">
                  {/* 旋转动画优化：使用 transform-gpu */}
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

                  <button
                    onClick={(e) => { e.stopPropagation(); playRandomTrack(activeScene); }}
                    className={`absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 p-3 rounded-full border shadow-lg active:scale-90 transition-transform z-20
                       ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white/50' : 'bg-white border-black/5 text-slate-400'}
                    `}
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{activeScene.title}</h2>
                  <div className="inline-flex items-center gap-2 opacity-60">
                     <Radio size={14} className={isPlaying ? 'animate-pulse' : ''} />
                     <span className="text-xs font-mono uppercase tracking-widest">{isPlaying ? "Active Session" : "Paused"}</span>
                  </div>
                </div>
              </div>

              {/* Right: Pomodoro Panel (已提取为独立组件，性能大大提升) */}
              <PomodoroTimer accentColor={activeScene.accent} theme={theme} />

            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        /* 强制开启 GPU 加速 */
        .transform-gpu {
          transform: translate3d(0, 0, 0);
        }
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}