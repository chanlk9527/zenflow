import { Zap, Moon, Coffee, Wind, Sparkles, CloudRain, Flame, Bird } from "lucide-react";
import React from "react";
import { SceneConfig, AmbientSound } from "@/types";

export const TRANSLATIONS = {
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
    breath_guide: { in: "INHALE", out: "EXHALE", hold: "HOLD", ready: "READY" },
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
    breath_guide: { in: "吸气", out: "呼气", hold: "保持", ready: "准备" },
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
    breath_guide: { in: "吸う", out: "吐く", hold: "止める", ready: "準備" },
    scenes: {
      focus: { title: "集中学習", subtitle: "Lo-Fi", desc: "深い集中のために。" },
      relax: { title: "リラックス", subtitle: "チルアウト", desc: "心を落ち着かせる。" },
      cafe: { title: "カフェ", subtitle: "ジャズ", desc: "都会の隠れ家。" },
      sleep: { title: "睡眠導入", subtitle: "ピアノ", desc: "静寂への誘い。" },
      creative: { title: "創造性", subtitle: "ハウス", desc: "インスピレーション。" }
    }
  }
};

export const SCENES_CONFIG: SceneConfig[] = [
  {
    id: "focus",
    icon: React.createElement(Zap, { size: 24 }),
    color: "text-purple-400",
    bg: "bg-purple-500",
    gradient: "from-purple-900/80 via-indigo-900/60 to-blue-900/60",
    playlist: ["https://stream.laut.fm/lofi"]
  },
  {
    id: "relax",
    icon: React.createElement(Wind, { size: 24 }),
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    gradient: "from-emerald-900/80 via-teal-900/60 to-cyan-900/60",
    playlist: ["https://ice2.somafm.com/groovesalad-128-mp3"]
  },
  {
    id: "cafe",
    icon: React.createElement(Coffee, { size: 24 }),
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
    icon: React.createElement(Moon, { size: 24 }),
    color: "text-indigo-300",
    bg: "bg-indigo-400",
    gradient: "from-indigo-900/80 via-slate-900/60 to-black/80",
    playlist: ["https://pianosolo.streamguys1.com/live"]
  },
  {
    id: "creative",
    icon: React.createElement(Sparkles, { size: 24 }),
    color: "text-pink-400",
    bg: "bg-pink-500",
    gradient: "from-pink-900/80 via-rose-900/60 to-purple-900/60",
    playlist: ["https://ice2.somafm.com/beatblender-128-mp3"]
  },
];

export const ELEVATED_PALETTES: Record<string, { orbs: [string, string, string] }> = {
  focus: { orbs: ["bg-[#7c3aed]", "bg-[#2dd4bf]", "bg-[#f472b6]"] },
  relax: { orbs: ["bg-[#059669]", "bg-[#facc15]", "bg-[#38bdf8]"] },
  cafe: { orbs: ["bg-[#d97706]", "bg-[#e11d48]", "bg-[#fbbf24]"] },
  sleep: { orbs: ["bg-[#1e3a8a]", "bg-[#4f46e5]", "bg-[#8b5cf6]"] },
  creative: { orbs: ["bg-[#db2777]", "bg-[#9333ea]", "bg-[#f97316]"] }
};

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', icon: CloudRain, label: "RAIN", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
  { id: 'fire', icon: Flame, label: "FIRE", url: "https://actions.google.com/sounds/v1/ambiences/fireplace.ogg" },
  { id: 'birds', icon: Bird, label: "FOREST", url: "https://archive.org/download/birdsounds_202001/quiet%20bird.ogg" }
];