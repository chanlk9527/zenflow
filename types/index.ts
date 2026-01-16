import { ReactNode } from "react";

export type LangKey = 'en' | 'cn' | 'jp';

export interface SceneConfig {
  id: string;
  icon: ReactNode;
  color: string;
  bg: string;
  gradient: string;
  playlist: string[];
}

export interface AmbientSound {
  id: string;
  icon: any; // Lucide icon type
  label: string;
  url: string;
}

export interface TimerState {
  mode: string;
  time: number;
  initial: number;
  running: boolean;
}