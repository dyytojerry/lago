"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AudioSettings {
  enabled: boolean;
  volume: number;
  rate: number;
  voice: string;
  autoPlay: boolean;
}

interface AudioSettingsContextType {
  settings: AudioSettings;
  updateSettings: (updates: Partial<AudioSettings>) => void;
  toggleEnabled: () => void;
}

const AudioSettingsContext = createContext<
  AudioSettingsContextType | undefined
>(undefined);

const DEFAULT_SETTINGS: AudioSettings = {
  enabled: true,
  volume: 0.8,
  rate: 1.0,
  voice: "longxiaochun",
  autoPlay: true,
};

export function AudioSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);

  // 从 localStorage 加载设置
  useEffect(() => {
    const saved = localStorage.getItem("audio-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to parse audio settings:", error);
      }
    }
  }, []);

  // 保存设置到 localStorage
  useEffect(() => {
    localStorage.setItem("audio-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const toggleEnabled = () => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <AudioSettingsContext.Provider
      value={{ settings, updateSettings, toggleEnabled }}
    >
      {children}
    </AudioSettingsContext.Provider>
  );
}

export function useAudioSettings() {
  const context = useContext(AudioSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useAudioSettings must be used within AudioSettingsProvider"
    );
  }
  return context;
}
