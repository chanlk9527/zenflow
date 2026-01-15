"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  Play, Pause, Zap, Moon, Coffee, Volume2, Wind, SkipForward,
  Sun, Loader2, Sparkles, CloudRain, Flame, Bird, SlidersHorizontal,
  ArrowLeft, Radio, Infinity as InfinityIcon, Timer as TimerIcon,
  Quote, MoreHorizontal, Power
} from "lucide-react";

// --- 1. 数据配置 (保持原样，未修改音源) ---

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

const AMBIENT_SOUNDS = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://actions.google.com/sounds/v1/ambiences/daytime_forrest_bonfire.ogg" },
  { id: 'birds', icon: Bird, label: "FOREST", url: "https://archive.org/download/birdsounds_202001/quiet%20bird.ogg" }
];

// --- 2. 视觉组件 ---

const NoiseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.03] mix-blend-overlay will-change-transform"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
));
NoiseOverlay.displayName = "NoiseOverlay";

const AuroraBackground = memo(({ activeScene, theme }: { activeScene: any, theme: string }) => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f2f4f6]'}`} />
    {/* Moving gradients */}
    <div className={`absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] rounded-full blur-[120px] opacity-30 animate-[pulse_8s_ease-in-out_infinite] transition-all duration-1000 transform-gpu
      ${activeScene ? activeScene.gradient.split(' ')[0] : (theme === 'dark' ? 'bg-indigo-900' : 'bg-blue-200')}`} />
    <div className={`absolute bottom-[-20%] right-[-10%] w-[100vw] h-[100vw] rounded-full blur-[120px] opacity-30 animate-[pulse_10s_ease-in-out_infinite_reverse] transition-all duration-1000 transform-gpu
      ${activeScene ? activeScene.gradient.split(' ')[2] : (theme === 'dark' ? 'bg-purple-900' : 'bg-pink-200')}`} />
  </div>
));
AuroraBackground.displayName = "AuroraBackground";

// --- 3. 微组件 ---

const SoundKnob = ({ volume, onChange, icon: Icon, activeColor, theme }: any) => (
  <div className="flex flex-col items-center gap-2 group">
    <div className="relative w-12 h-32 bg-black/5 dark:bg-white/5 rounded-full p-1 flex flex-col justify-end overflow-hidden">
      <div
        className={`w-full rounded-full transition-all duration-100 ${activeColor} opacity-80`}
        style={{ height: `${volume * 100}%` }}
      />
      <input
        type="range" min="0" max="1" step="0.01"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
      />
      {/* Icon overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-white mix-blend-overlay">
        <Icon size={16} />
      </div>
    </div>
    <span className="text-[9px] font-bold tracking-widest opacity-40">{Math.round(volume * 100)}%</span>
  </div>
);

const TimerDisplay = ({ time, isRunning, mode, theme }: any) => (
  <div className="text-center">
    <div className="text-6xl font-mono font-bold tracking-tighter tabular-nums leading-none">
      {Math.floor(time / 60).toString().padStart(2, '0')}:{Math.floor(time % 60).toString().padStart(2, '0')}
    </div>
    <div className="mt-2 flex items-center justify-center gap-2">
       <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
       <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{mode}</span>
    </div>
  </div>
);

// --- 4. 主程序 ---

export default function ZenFlowRedesignV2() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'home' | 'player'>('home');

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");
  const [mainVolume, setMainVolume] = useState(0.8);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });

  // Tools State
  const [activeTab, setActiveTab] = useState<'mixer' | 'timer'>('mixer');
  const [timerState, setTimerState] = useState({ mode: 'focus', time: 25 * 60, initial: 25 * 60, running: false });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[lang];
  const activeScene = SCENES_CONFIG.find(s => s.id === activeSceneId);

  // Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting.m;
    if (hour < 18) return t.greeting.a;
    return t.greeting.e;
  };

  // Audio Effect
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

  // Timer Logic
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
      setCurrentStreamUrl(scene.playlist[Math.floor(Math.random() * scene.playlist.length)]);
      setIsPlaying(true);
    }
    setViewMode('player');
  };

  const toggleTimer = () => setTimerState(p => ({ ...p, running: !p.running }));
  const resetTimer = () => setTimerState(p => ({ ...p, running: false, time: p.initial }));
  const switchTimerMode = () => {
    const newMode = timerState.mode === 'focus' ? 'breath' : 'focus';
    const newTime = newMode === 'focus' ? 25 * 60 : 5 * 60;
    setTimerState({ mode: newMode, time: newTime, initial: newTime, running: false });
  };

  return (
    <div className={`relative min-h-[100dvh] w-full overflow-hidden font-sans select-none transition-colors duration-500
      ${theme === 'dark' ? 'text-gray-100' : 'text-slate-800'}`}>

      <NoiseOverlay />
      <AuroraBackground activeScene={activeScene} theme={theme} />
      <audio ref={audioRef} src={currentStreamUrl} onPlaying={() => setIsLoadingStream(false)} onWaiting={() => setIsLoadingStream(true)} />
      {AMBIENT_SOUNDS.map(s => <audio key={s.id} ref={s.id === 'rain' ? rainRef : s.id === 'fire' ? fireRef : birdsRef} src={s.url} loop />)}

      {/* Header (Shared) */}
      <header className="fixed top-0 inset-x-0 z-40 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border backdrop-blur-md
              ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/10'}`}>
              ZF
           </div>
           {viewMode === 'home' && <span className="font-bold tracking-widest text-xs uppercase opacity-50">{t.app_title}</span>}
        </div>
        <div className="flex gap-4">
          <button onClick={() => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en')} className="text-xs font-bold opacity-50 hover:opacity-100">{lang.toUpperCase()}</button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="text-xs font-bold opacity-50 hover:opacity-100">{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
        </div>
      </header>

      {/* --- VIEW: HOME (Bento Dashboard) --- */}
      <main className={`relative z-10 w-full min-h-[100dvh] pt-24 px-6 pb-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
         ${viewMode === 'home' ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none absolute'}`}>

        <div className="max-w-4xl mx-auto">
          {/* Greeting Section */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{getGreeting()}.</h1>
            <p className="opacity-50 text-sm md:text-base font-medium">{t.tagline}</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px] md:auto-rows-[180px]">

            {/* Featured Card (Large) */}
            <button onClick={() => enterScene(SCENES_CONFIG[0])}
              className={`md:col-span-2 row-span-2 rounded-[2rem] p-8 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group
                ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/40 shadow-sm'}`}>
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

            {/* Smaller Cards */}
            {SCENES_CONFIG.slice(1).map((scene, i) => (
              <button key={scene.id} onClick={() => enterScene(scene)}
                className={`rounded-[2rem] p-6 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group
                  ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/40 shadow-sm'}
                  ${i === 1 ? 'md:row-span-2' : ''} /* Make one card tall for variety */
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

      {/* --- VIEW: PLAYER (Immersive) --- */}
      <main className={`fixed inset-0 z-20 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
         ${viewMode === 'player' ? 'translate-x-0 opacity-100' : 'translate-x-[20%] opacity-0 pointer-events-none'}`}>

        {/* Top Controls */}
        <div className="w-full max-w-md mx-auto px-6 pt-24 pb-4 flex justify-between items-end">
          <button onClick={() => setViewMode('home')} className="p-3 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-end text-right">
             <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{isPlaying ? t.playing : t.paused}</span>
             <h2 className="text-xl font-bold">{activeScene ? t.scenes[activeSceneId as keyof typeof t.scenes].title : '...'}</h2>
          </div>
        </div>

        {/* Center Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
           <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {/* Dynamic Rings */}
              {[1, 2, 3].map(i => (
                <div key={i} className={`absolute inset-0 rounded-full border border-current opacity-5 transition-all duration-[3s]
                  ${isPlaying ? 'animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]' : ''}`}
                  style={{ animationDelay: `${i * 1}s` }}
                />
              ))}
              {/* Core Glow */}
              <div className={`absolute w-40 h-40 rounded-full blur-[60px] opacity-40 transition-all duration-1000 ${activeScene?.bg}`} />

              {/* Play Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl transition-transform active:scale-90
                   ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/60 border-white/50'}`}>
                {isLoadingStream && isPlaying ? <Loader2 className="animate-spin" /> :
                 isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
              </button>
           </div>
        </div>

        {/* Bottom Command Deck (Floating) */}
        <div className="w-full px-6 pb-12">
          <div className={`max-w-md mx-auto rounded-[2.5rem] overflow-hidden backdrop-blur-2xl border shadow-2xl transition-all duration-500
             ${theme === 'dark' ? 'bg-[#121212]/80 border-white/10 shadow-black/50' : 'bg-white/70 border-white/60 shadow-xl'}`}>

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

             {/* Panel Content */}
             <div className="h-44 px-6 pb-6 relative">
               {/* Mixer Panel */}
               <div className={`absolute inset-0 px-6 pb-6 flex items-center justify-between transition-all duration-500
                  ${activeTab === 'mixer' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
                  {AMBIENT_SOUNDS.map(s => (
                    <SoundKnob key={s.id}
                      icon={s.icon} volume={ambientVolumes[s.id]}
                      onChange={(v: number) => setAmbientVolumes(p => ({...p, [s.id]: v}))}
                      activeColor={activeScene?.bg} theme={theme}
                    />
                  ))}
               </div>

               {/* Timer Panel */}
               <div className={`absolute inset-0 px-6 pb-6 flex flex-col items-center justify-center gap-4 transition-all duration-500
                  ${activeTab === 'timer' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                  <TimerDisplay time={timerState.time} isRunning={timerState.running} mode={t.timer_modes[timerState.mode as keyof typeof t.timer_modes]} theme={theme} />
                  <div className="flex gap-4 w-full">
                     <button onClick={switchTimerMode} className="flex-1 py-3 rounded-2xl bg-current/5 hover:bg-current/10 font-bold text-[10px] tracking-widest uppercase transition-colors">
                       {timerState.mode === 'focus' ? t.timer_modes.breath : t.timer_modes.focus}
                     </button>
                     <button onClick={toggleTimer} className={`flex-1 py-3 rounded-2xl font-bold text-[10px] tracking-widest uppercase text-white shadow-lg active:scale-95 transition-all
                        ${timerState.running ? 'bg-zinc-800' : activeScene?.bg || 'bg-black'}`}>
                        {timerState.running ? 'STOP' : 'START'}
                     </button>
                     <button onClick={resetTimer} className="w-12 flex items-center justify-center rounded-2xl bg-current/5 hover:bg-current/10 transition-colors">
                        <MoreHorizontal size={16} />
                     </button>
                  </div>
               </div>
             </div>
          </div>
        </div>

      </main>

    </div>
  );
}