import React, { useState, useRef } from "react";

interface SoundKnobProps {
  volume: number;
  onChange: (val: number) => void;
  // 👇 1. 这里定义了类型
  onInteract?: () => void;
  icon: any;
  label: string;
  activeColor: string;
  theme: string;
}

const SoundKnob = ({
  volume,
  onChange,
  onInteract, // 👈 2. 关键修正：这里必须解构出来，之前漏了！
  icon: Icon,
  label,
  activeColor,
  theme
}: SoundKnobProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    // 👇 3. 现在这里就能正常使用了
    if (onInteract) {
        onInteract();
    }

    setIsDragging(true);
    updateVolume(e.clientY);
    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
  };

  const handleGlobalMove = (e: PointerEvent) => {
    updateVolume(e.clientY);
  };

  const handleGlobalUp = () => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handleGlobalMove);
    window.removeEventListener('pointerup', handleGlobalUp);
  };

  const updateVolume = (clientY: number) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const percentage = 1 - (clientY - rect.top) / rect.height;
    const newVolume = Math.max(0, Math.min(1, percentage));
    onChange(newVolume);
  };

  return (
    <div className="flex flex-col items-center gap-2 group w-14 select-none touch-none">
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        className={`relative w-12 h-32 rounded-full p-1 flex flex-col justify-end overflow-hidden cursor-ns-resize transition-colors duration-300
          ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
      >
        <div
          className={`w-full rounded-full transition-all duration-75 ${activeColor} ${isDragging ? 'opacity-100' : 'opacity-80'}`}
          style={{ height: `${volume * 100}%` }}
        />
        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none transition-colors duration-300
          ${volume > 0.1 ? 'text-white mix-blend-overlay' : (theme === 'dark' ? 'text-white/30' : 'text-black/30')}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-widest opacity-40 uppercase">{label}</span>
        <span className="text-[9px] font-mono opacity-30">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

export default SoundKnob;