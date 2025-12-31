import { FighterTheme } from "@/types";

export const FIGHTER_THEMES: FighterTheme[] = [
    {
        id: 'yashiro',
        name: 'Yashiro Nanakase',
        description: 'Earth Power - Aggressive & Heavy',
        colors: {
            primary: '#ff8c00', // Dark Orange
            secondary: '#1a1a1a', // Dark Grey
            accent: '#ffffff', // White
            background: '#0a0500', // Very dark orange/black
        },
        fonts: {
            title: '"Russo One", sans-serif',
            body: '"Rajdhani", sans-serif',
        },
        soundProfile: 'aggressive',
        vfx: 'fire',
    },
    {
        id: 'iori',
        name: 'Iori Yagami',
        description: 'Purple Flames - Fast & Deadly',
        colors: {
            primary: '#a855f7', // Purple
            secondary: '#312e81', // Indigo
            accent: '#ef4444', // Red (Classic KOF hit)
            background: '#0f0518', // Deep purple/black
        },
        fonts: {
            title: '"Rubik Wet Paint", "Russo One", sans-serif', // Melty/Crazy font if available, fallback Russo
            body: '"Rajdhani", sans-serif',
        },
        soundProfile: 'retro',
        vfx: 'lightning', // actually purple fire, but lightning logic works
    },
    {
        id: 'kyo',
        name: 'Kyo Kusanagi',
        description: 'Crimson Fire - Classic Hero',
        colors: {
            primary: '#ef4444', // Red
            secondary: '#7f1d1d', // Dark Red
            accent: '#fbbf24', // Amber/Fire
            background: '#1a0505', // Deep red/black
        },
        fonts: {
            title: '"Black Ops One", sans-serif',
            body: '"Rajdhani", sans-serif',
        },
        soundProfile: 'standard',
        vfx: 'fire',
    }
];

export const DEFAULT_THEME = FIGHTER_THEMES[0];
