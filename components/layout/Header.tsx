import React from "react";
import { LangKey } from "@/types";

interface HeaderProps {
  theme: 'light' | 'dark';
  lang: LangKey;
  viewMode: 'home' | 'player';
  appTitle: string;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}

const Header = ({ theme, lang, viewMode, appTitle, onToggleTheme, onToggleLang }: HeaderProps) => {
  return (
    <header className="fixed top-0 inset-x-0 z-40 p-6 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border backdrop-blur-md transition-colors
            ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/5'}`}>
            ZF
         </div>
         {viewMode === 'home' && <span className="font-bold tracking-widest text-xs uppercase opacity-50">{appTitle}</span>}
      </div>
      <div className="flex gap-4 pointer-events-auto">
        <button onClick={onToggleLang} className="text-xs font-bold opacity-50 hover:opacity-100">{lang.toUpperCase()}</button>
        <button onClick={onToggleTheme} className="text-xs font-bold opacity-50 hover:opacity-100">{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
      </div>
    </header>
  );
};

export default Header;