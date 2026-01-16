"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, Loader2, ArrowLeft, RotateCcw, SlidersHorizontal, Timer as TimerIcon, Zap } from "lucide-react";

// Imports from local files
import { LangKey, TimerState } from "@/types";
import { TRANSLATIONS, SCENES_CONFIG, AMBIENT_SOUNDS } from "@/data/constants";

import NoiseOverlay from "@/components/visuals/NoiseOverlay";
import AuroraBackground from "@/components/visuals/AuroraBackground";
import AppleStyleMesh from "@/components/visuals/AppleStyleMesh";
import SoundKnob from "@/components/tools/SoundKnob";
import TimerDisplay from "@/components/tools/TimerDisplay";
import Header from "@/components/layout/Header";

export default function ZenFlowRedesignV2() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<LangKey>('en');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'home' | 'player'>('home');

  // Player State
  const [isMainPlaying, setIsMainPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState("");
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [mainVolume, setMainVolume] = useState(0.8);
  const [ambientVolumes, setAmbientVolumes] = useState<{ [key: string]: number }>({ rain: 0, fire: 0, birds: 0 });

  // Tools State
  const [activeTab, setActiveTab] = useState<'mixer' | 'timer'>('mixer');
  const [timerState, setTimerState] = useState<TimerState>({ mode: 'focus', time: 25 * 60, initial: 25 * 60, running: false });
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const t = TRANSLATIONS[lang];
  const activeScene = SCENES_CONFIG.find(s => s.id === activeSceneId);

  // --- Logic Effects ---

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour >= 21 || hour < 6) setTheme('dark');
      else setTheme('light');
    };
    checkTime();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting.m;
    if (hour < 18) return t.greeting.a;
    return t.greeting.e;
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = mainVolume;
    if (isMainPlaying && currentStreamUrl) {
      audioRef.current.play().then(() => setIsLoadingStream(false)).catch(() => setIsMainPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isMainPlaying, currentStreamUrl, mainVolume]);

  useEffect(() => {
    Object.entries(ambientVolumes).forEach(([key, vol]) => {
      const el = ambientRefs.current[key];
      if (el) {
        el.volume = vol;
        if (vol > 0 && el.paused) {
            el.play().catch((e) => console.log('Playback prevented:', e));
        } else if (vol === 0) {
            el.pause();
        }
      }
    });
  }, [ambientVolumes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerState.running && timerState.time > 0) {
      interval = setInterval(() => setTimerState(p => ({ ...p, time: p.time - 1 })), 1000);
    } else if (timerState.time === 0) {
      setTimerState(p => ({ ...p, running: false }));
    }
    return () => clearInterval(interval);
  }, [timerState.running, timerState.time]);

  // --- Handlers ---

  const enterScene = (scene: typeof SCENES_CONFIG[0]) => {
    if (activeSceneId !== scene.id) {
      setActiveSceneId(scene.id);
      setCurrentStreamIndex(0);
      setCurrentStreamUrl(scene.playlist[0]);
      setIsMainPlaying(true);
    }
    setViewMode('player');
  };

  const handleNextTrack = () => {
    if (!activeScene) return;
    const nextIndex = (currentStreamIndex + 1) % activeScene.playlist.length;
    setCurrentStreamIndex(nextIndex);
    setCurrentStreamUrl(activeScene.playlist[nextIndex]);
    setIsMainPlaying(true);
  };

  const handleStartTimer = () => {
      if(timerState.mode === 'breath') {
          setCountdownNum(3);
          let c = 3;
          const i = setInterval(() => {
              c--;
              setCountdownNum(c);
              if(c <= 0) {
                  clearInterval(i);
                  setCountdownNum(null);
                  setTimerState(p => ({ ...p, running: true }));
              }
          }, 1000);
      } else {
          setTimerState(p => ({ ...p, running: true }));
      }
  };

  const stopTimer = () => setTimerState(p => ({ ...p, running: false }));
  const resetTimer = () => setTimerState(p => ({ ...p, running: false, time: p.initial }));

  const switchTimerMode = () => {
    const newMode = timerState.mode === 'focus' ? 'breath' : 'focus';
    const newTime = newMode === 'focus' ? 25 * 60 : 5 * 60;
    setTimerState({ mode: newMode, time: newTime, initial: newTime, running: false });
  };

  const handleTimeSliderChange = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerState(p => ({ ...p, time: seconds, initial: seconds, running: false }));
  };

  const handleToggleLang = () => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en');
  const handleToggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // --- Render ---

  return (
    <div className={`relative h-[100dvh] w-full overflow-hidden font-sans select-none transition-colors duration-500 overscroll-none
      ${theme === 'dark' ? 'text-gray-100 bg-[#050505]' : 'text-slate-800 bg-[#f4f6f8]'}`}>

      <NoiseOverlay />
      <AuroraBackground activeScene={activeScene} theme={theme} />

      {/* Audio Elements */}
      <audio ref={audioRef} src={currentStreamUrl} onPlaying={() => setIsLoadingStream(false)} onWaiting={() => setIsLoadingStream(true)} />
      {AMBIENT_SOUNDS.map(s => (
        <audio
            key={s.id}
            ref={(el) => { ambientRefs.current[s.id] = el; }}
            src={s.url}
            loop
            preload="metadata"
            crossOrigin="anonymous"
        />
      ))}

      <Header
        theme={theme}
        lang={lang}
        viewMode={viewMode}
        appTitle={t.app_title}
        onToggleLang={handleToggleLang}
        onToggleTheme={handleToggleTheme}
      />

      {/* --- VIEW: HOME --- */}
      <main className={`absolute inset-0 z-10 w-full h-full pt-24 px-6 pb-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto
         ${viewMode === 'home' ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none'}`}>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{getGreeting()}.</h1>
            <p className="opacity-50 text-sm md:text-base font-medium">{t.tagline}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px] md:auto-rows-[180px] pb-24">
            {/* Featured Scene (First One) */}
            <button onClick={() => enterScene(SCENES_CONFIG[0])}
              className={`md:col-span-2 row-span-2 rounded-[2rem] p-8 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group
                ${theme === 'dark'
                   ? 'bg-[#121212] border border-white/5 hover:bg-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-white/5'
                   : 'bg-white/60 border border-white/40 shadow-sm'}`}>
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

            {/* Other Scenes */}
            {SCENES_CONFIG.slice(1).map((scene, i) => (
              <button key={scene.id} onClick={() => enterScene(scene)}
                className={`rounded-[2rem] p-6 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group
                  ${theme === 'dark'
                     ? 'bg-[#121212] border border-white/5 hover:bg-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-white/5'
                     : 'bg-white/60 border border-white/40 shadow-sm'}
                  ${i === 1 ? 'md:row-span-2' : ''}
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

      {/* --- VIEW: PLAYER --- */}
      <main className={`fixed inset-0 z-20 w-full overflow-y-auto overflow-x-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
         ${viewMode === 'player' ? 'translate-x-0 opacity-100' : 'translate-x-[20%] opacity-0 pointer-events-none'}`}>

        <AppleStyleMesh isPlaying={isMainPlaying} activeSceneId={activeSceneId} theme={theme} />

        <div className="flex flex-col min-h-[100dvh] w-full relative">

            {/* Top Controls */}
            <div className="w-full max-w-md mx-auto px-6 pt-24 pb-4 flex justify-between items-end flex-shrink-0 relative z-30">
              <button onClick={() => setViewMode('home')} className="p-4 -ml-4 rounded-full hover:bg-white/10 transition-colors z-50">
                <ArrowLeft size={24} />
              </button>
              <div className="flex flex-col items-end text-right pointer-events-none">
                 <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{isMainPlaying ? t.playing : t.paused}</span>
                 <h2 className="text-xl font-bold">{activeScene ? t.scenes[activeSceneId as keyof typeof t.scenes].title : '...'}</h2>
              </div>
            </div>

            {/* Center Play Button Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px] z-30 py-8">
               <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
                  <div className="flex items-center gap-4 relative z-20">
                    <button
                      onClick={() => setIsMainPlaying(!isMainPlaying)}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl transition-transform active:scale-90
                         ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/60 border-white/50'}`}>
                      {isLoadingStream && isMainPlaying ? <Loader2 className="animate-spin" /> :
                       isMainPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                    </button>

                    {activeScene && activeScene.playlist.length > 1 && (
                      <button
                        onClick={handleNextTrack}
                        className={`absolute -right-16 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90
                           ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/30 hover:bg-white/60'}`}
                      >
                        <SkipForward size={18} className="opacity-70" />
                      </button>
                    )}
                  </div>
               </div>
            </div>

            {/* Bottom Command Deck */}
            <div className="w-full px-6 pb-24 md:pb-12 flex-shrink-0 relative z-30">
              <div className={`max-w-md mx-auto rounded-[2.5rem] overflow-hidden backdrop-blur-3xl border shadow-2xl transition-all duration-500
                 ${theme === 'dark' ? 'bg-[#121212]/60 border-white/10 shadow-black/50' : 'bg-white/50 border-white/40 shadow-xl'}`}>

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

                 <div className="h-56 px-6 pb-6 relative">
                   {/* Mixer Panel */}
                   <div className={`absolute inset-0 px-6 pb-6 flex items-center justify-between transition-all duration-500
                      ${activeTab === 'mixer' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
                      {AMBIENT_SOUNDS.map(s => (
                        <SoundKnob key={s.id}
                          icon={s.icon}
                          label={s.label}
                          volume={ambientVolumes[s.id]}
                          onChange={(v: number) => setAmbientVolumes(p => ({...p, [s.id]: v}))}
                          activeColor={activeScene?.bg || "bg-gray-400"} theme={theme}
                        />
                      ))}
                   </div>

                   {/* Timer Panel */}
                   <div className={`absolute inset-0 px-6 pb-6 flex flex-col items-center justify-center gap-4 transition-all duration-500
                      ${activeTab === 'timer' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}>

                      {countdownNum !== null && countdownNum > 0 && (
                          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
                              <span className="text-6xl font-black text-white animate-bounce">{countdownNum}</span>
                          </div>
                      )}

                      <TimerDisplay
                         time={timerState.time}
                         isRunning={timerState.running}
                         mode={t.timer_modes[timerState.mode as keyof typeof t.timer_modes]}
                         theme={theme}
                         translations={t}
                         activeSceneColor={activeScene?.color || "text-gray-400"}
                      />

                      <div className="w-full flex items-center gap-3 px-2 z-10">
                         <span className="text-[9px] font-bold opacity-30">1m</span>
                         <input
                            type="range"
                            min="1" max="60"
                            value={Math.floor(timerState.initial / 60)}
                            onChange={(e) => handleTimeSliderChange(parseInt(e.target.value))}
                            disabled={timerState.running}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-current z-20 disabled:opacity-50"
                         />
                         <span className="text-[9px] font-bold opacity-30">60m</span>
                      </div>

                      <div className="flex gap-4 w-full z-10">
                         <button onClick={switchTimerMode} disabled={timerState.running} className="flex-1 py-3 rounded-2xl bg-current/5 hover:bg-current/10 font-bold text-[10px] tracking-widest uppercase transition-colors disabled:opacity-30">
                           {timerState.mode === 'focus' ? t.timer_modes.breath : t.timer_modes.focus}
                         </button>

                         <button onClick={timerState.running ? stopTimer : handleStartTimer} className={`flex-1 py-3 rounded-2xl font-bold text-[10px] tracking-widest uppercase text-white shadow-lg active:scale-95 transition-all
                            ${timerState.running ? 'bg-zinc-800' : activeScene?.bg || 'bg-black'}`}>
                            {timerState.running ? 'STOP' : 'START'}
                         </button>

                         <button onClick={resetTimer} className="w-12 flex items-center justify-center rounded-2xl bg-current/5 hover:bg-current/10 transition-colors" title="Reset Timer">
                            <RotateCcw size={16} />
                         </button>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
        </div>

      </main>
    </div>
  );
}