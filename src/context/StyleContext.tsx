"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FighterTheme } from '@/types';
import { FIGHTER_THEMES, DEFAULT_THEME } from '@/lib/themes';

interface StyleContextType {
    currentTheme: FighterTheme;
    setThemeId: (id: string) => void;
    availableThemes: FighterTheme[];
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeId, setThemeId] = useState<string>(DEFAULT_THEME.id);

    const currentTheme = FIGHTER_THEMES.find(t => t.id === themeId) || DEFAULT_THEME;

    return (
        <StyleContext.Provider value={{
            currentTheme,
            setThemeId,
            availableThemes: FIGHTER_THEMES
        }}>
            {/* Inject CSS Variables for global usage */}
            <div style={{
                '--color-primary': currentTheme.colors.primary,
                '--color-secondary': currentTheme.colors.secondary,
                '--color-accent': currentTheme.colors.accent,
                '--color-bg-theme': currentTheme.colors.background,
                '--font-title-theme': currentTheme.fonts.title,
            } as React.CSSProperties} className="contents">
                {children}
            </div>
        </StyleContext.Provider>
    );
};

export const useStyle = () => {
    const context = useContext(StyleContext);
    if (context === undefined) {
        throw new Error('useStyle must be used within a StyleProvider');
    }
    return context;
};
