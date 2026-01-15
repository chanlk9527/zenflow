// ... (之前的 imports 和 数据配置保持不变)

// --- 修改 1: 优化 AppleStyleMesh 组件 ---
// 目标：扩大遮罩范围，移除边界感，让光晕充满全屏

const AppleStyleMesh = memo(({ isPlaying, activeSceneId, theme }: { isPlaying: boolean, activeSceneId: string | null, theme: 'light' | 'dark' }) => {
  const palette = activeSceneId && ELEVATED_PALETTES[activeSceneId]
    ? ELEVATED_PALETTES[activeSceneId]
    : ELEVATED_PALETTES.focus;

  return (
    // 这里的 z-index 设为 0 或 -1，确保它在按钮后面，但在背景底色上面
    <div className={`absolute inset-0 z-0 flex items-center justify-center transition-opacity duration-[2000ms] overflow-hidden pointer-events-none ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>
       <style>{`
         @keyframes blob-bounce {
           0% { transform: translate(0, 0) scale(1); }
           33% { transform: translate(30px, -50px) scale(1.1); }
           66% { transform: translate(-20px, 20px) scale(0.9); }
           100% { transform: translate(0, 0) scale(1); }
         }
         @keyframes blob-spin-slow {
           0% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(180deg) scale(1.2); }
           100% { transform: rotate(360deg) scale(1); }
         }
         @keyframes blob-flow {
           0% { transform: translate(0, 0) rotate(0deg); }
           33% { transform: translate(10%, 10%) rotate(120deg); }
           66% { transform: translate(-5%, -10%) rotate(240deg); }
           100% { transform: translate(0, 0) rotate(360deg); }
         }
         .mesh-mask {
            /*
               [关键修改]
               扩大径向渐变的范围。
               之前是 transparent 70%，导致上下被切断。
               现在改为 black 40% -> transparent 100% (或者去掉 mask，视需求而定)。
               这里保留 mask 但极大放宽，保持边缘柔和但允许光晕触达底部。
            */
            mask-image: radial-gradient(circle at center, black 30%, transparent 95%);
            -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 95%);
         }
         .animate-blob-1 { animation: blob-flow 25s infinite linear; }
         .animate-blob-2 { animation: blob-flow 30s infinite linear reverse; }
         .animate-blob-3 { animation: blob-bounce 20s infinite ease-in-out; }

         .paused-anim * { animation-play-state: paused !important; }
       `}</style>

       {/* 容器：极大尺寸，确保光晕能覆盖到屏幕的最角落 */}
       <div className={`relative w-[200%] h-[200%] md:w-[150%] md:h-[150%] mesh-mask flex items-center justify-center
          ${isPlaying ? '' : 'paused-anim'}`}>

          {/* 模糊层 */}
          <div className={`relative w-full h-full filter blur-[80px] md:blur-[100px] saturate-[1.5] transition-all duration-1000
             ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply opacity-80'}`}>

              {/* Orb 1 */}
              <div className={`absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full opacity-60 animate-blob-1 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[0]} mix-blend-screen`} />

              {/* Orb 2 */}
              <div className={`absolute bottom-1/4 right-1/4 w-[50%] h-[50%] rounded-full opacity-60 animate-blob-2 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[1]} mix-blend-screen`} />

              {/* Orb 3 */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full opacity-80 animate-blob-3 transition-colors duration-[3000ms] ease-linear
                ${palette.orbs[2]} mix-blend-plus-lighter`} />
          </div>
       </div>
    </div>
  );
});
AppleStyleMesh.displayName = "AppleStyleMesh";

// ... (SoundKnob, BreathingGuide, TimerDisplay 等微组件保持不变) ...

// --- 修改 2: 主程序布局调整 ---

export default function ZenFlowRedesignV2() {
  // ... (State 和 Hooks 逻辑保持不变)

  // 为了节省篇幅，省略未修改的逻辑代码，直接定位到 render 部分

  return (
    <div className={`relative h-[100dvh] w-full overflow-hidden font-sans select-none transition-colors duration-500 overscroll-none
      ${theme === 'dark' ? 'text-gray-100 bg-[#050505]' : 'text-slate-800 bg-[#f4f6f8]'}`}>

      {/* 这里的 NoiseOverlay 和 AuroraBackground 是全局通用的底色 */}
      <NoiseOverlay />
      <AuroraBackground activeScene={activeScene} theme={theme} />

      {/* Audio 元素保持不变... */}
      <audio ref={audioRef} src={currentStreamUrl} onPlaying={() => setIsLoadingStream(false)} onWaiting={() => setIsLoadingStream(true)} />
      {AMBIENT_SOUNDS.map(s => <audio key={s.id} ref={s.id === 'rain' ? rainRef : s.id === 'fire' ? fireRef : birdsRef} src={s.url} loop />)}

      {/* Header 保持不变 */}
      <header className="fixed top-0 inset-x-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border backdrop-blur-md transition-colors
              ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/5'}`}>
              ZF
           </div>
           {viewMode === 'home' && <span className="font-bold tracking-widest text-xs uppercase opacity-50">{t.app_title}</span>}
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <button onClick={() => setLang(l => l === 'en' ? 'cn' : l === 'cn' ? 'jp' : 'en')} className="text-xs font-bold opacity-50 hover:opacity-100">{lang.toUpperCase()}</button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="text-xs font-bold opacity-50 hover:opacity-100">{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
        </div>
      </header>

      {/* HOME VIEW (保持不变) */}
      <main className={`absolute inset-0 z-10 w-full h-full pt-24 px-6 pb-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto
         ${viewMode === 'home' ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none'}`}>
          {/* ... Home 内容 ... */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 md:mb-12 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{getGreeting()}.</h1>
              <p className="opacity-50 text-sm md:text-base font-medium">{t.tagline}</p>
            </div>
            {/* ... 场景卡片 ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px] md:auto-rows-[180px] pb-10">
                 <button onClick={() => enterScene(SCENES_CONFIG[0])}
                  className={`md:col-span-2 row-span-2 rounded-[2rem] p-8 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group
                    ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/40 shadow-sm'}`}>
                   <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${SCENES_CONFIG[0].gradient}`} />
                   <div className="relative z-10">
                     <div className="inline-flex p-3 rounded-xl bg-white/10 backdrop-blur-md mb-4 text-purple-300"><Zap size={24} /></div>
                     <h2 className="text-3xl font-bold">{t.scenes.focus.title}</h2>
                     <p className="opacity-60 mt-2 max-w-xs">{t.scenes.focus.desc}</p>
                   </div>
                   <div className="relative z-10 flex items-center gap-2 opacity-50 text-xs font-bold tracking-widest uppercase group-hover:opacity-100 transition-opacity">
                      <Play size={12} fill="currentColor" /> Play Now
                   </div>
                </button>
                {SCENES_CONFIG.slice(1).map((scene, i) => (
                  <button key={scene.id} onClick={() => enterScene(scene)}
                    className={`rounded-[2rem] p-6 flex flex-col justify-between text-left transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group
                      ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/40 shadow-sm'}
                      ${i === 1 ? 'md:row-span-2' : ''}`}>
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
      <main className={`fixed inset-0 z-20 flex flex-col w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
         ${viewMode === 'player' ? 'translate-x-0 opacity-100' : 'translate-x-[20%] opacity-0 pointer-events-none'}`}>

        {/*
           [关键修改]
           AppleStyleMesh 被移到了这里，作为 Player 的最底层背景。
           absolute inset-0 让它撑满整个屏幕。
        */}
        <AppleStyleMesh isPlaying={isMainPlaying} activeSceneId={activeSceneId} theme={theme} />

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
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px] flex-shrink-0 z-30">
           {/* 之前这里包裹着 AppleStyleMesh，现在移除了，只保留按钮 */}
           <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              <div className="flex items-center gap-4 relative z-20">
                <button
                  onClick={() => setIsMainPlaying(!isMainPlaying)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl transition-transform active:scale-90
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
        <div className="w-full px-6 pb-12 flex-shrink-0 relative z-30">
          {/*
             [关键修改]
             调整背景透明度。
             Dark Mode: bg-[#121212]/80 -> bg-[#121212]/60
             Light Mode: bg-white/70 -> bg-white/50
             增加 backdrop-blur 强度 (2xl -> 3xl) 以确保文字可读性，同时允许背景光晕透出颜色
          */}
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
                      activeColor={activeScene?.bg} theme={theme}
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
                     activeSceneColor={activeScene?.color}
                  />

                  {/* Slider */}
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

                  {/* Buttons */}
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

      </main>

    </div>
  );
}