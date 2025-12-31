export type ScreenState = 'WELCOME' | 'MODE_SELECT' | 'STYLE_SELECT' | 'ARENA' | 'PROCESSING' | 'RESULT';
export type Emotion = 'anger' | 'joy' | 'sad' | 'neutral' | 'hype';
export type VideoFilter = 'none' | 'grayscale' | 'sepia' | 'contrast' | 'invert';

export interface StyleConfig {
    id: string;
    name: string;
    description: string;
    color: string;
    borderColor: string;
    bgGradient: string;
    fontClass: string;
}

export interface SubtitleSegment {
    start: number;
    end: number;
    text: string;
    emotion: Emotion;
}

export interface FighterTheme {
    id: string;
    name: string;
    description: string;
    colors: {
        primary: string; // Main brand color (e.g. Orange for Yashiro)
        secondary: string; // Accent
        accent: string; // Critical hit color
        background: string; // Dark bg tint
    };
    fonts: {
        title: string; // Big headers
        body: string; // Normal text
    };
    soundProfile: 'standard' | 'aggressive' | 'retro';
    vfx: 'fire' | 'lightning' | 'digital';
}

export interface AppState {
    currentScreen: 'welcome' | 'mode-select' | 'style-select' | 'arena' | 'result';
    recordedBlob: Blob | null;
    subtitles: SubtitleSegment[];
    selectedStyleId: string | null;
}
