import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

// 音效配置
const AUDIO_CONFIG = {
  // 点击音效
  clickSound: '/audio/click.wav',
  
  // 背景音乐 - 不同学科对应不同音乐
  backgroundMusic: {
    'math-teacher': '/audio/bg-math.mp3',
    'chinese-teacher': '/audio/bg-chinese.mp3', 
    'english-teacher': '/audio/bg-english.mp3',
    'boardgo': '/audio/bg-chess.mp3',
    default: '/audio/bg-default.mp3'
  }
};

export interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  soundVolume: number;
}

const defaultSettings: AudioSettings = {
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.3,
  soundVolume: 0.5
};

export function useAudio() {
  const pathname = usePathname();
  const disabled = !pathname.startsWith('/study');
  const [settings, setSettings] = useState<AudioSettings>(defaultSettings);
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('audio-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse audio settings:', error);
      }
    }
  }, []);

  // 保存设置到localStorage
  const saveSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('audio-settings', JSON.stringify(updatedSettings));
  }, [settings]);

  // 播放点击音效
  const playClickSound = useCallback(() => {
    if (!settings.soundEnabled || disabled) return;
    
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.volume = settings.soundVolume;
      soundRef.current.play().catch(console.error);
    }
  }, [settings.soundEnabled, settings.soundVolume]);
  const stopClickSound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
    }
  }, []);

  // 播放背景音乐
  const playBackgroundMusic = useCallback((subject?: string) => {
    if (!settings.musicEnabled) return;

    if (!subject && musicRef.current) {
      musicRef.current.currentTime = 0;
      musicRef.current.volume = settings.musicVolume;
      musicRef.current.play().then(() => {
        setCurrentMusic(musicFile);
        setIsMusicPlaying(true);
      })
      .catch(console.error);
      return;
    }
    
    const musicFile = AUDIO_CONFIG.backgroundMusic[subject as keyof typeof AUDIO_CONFIG.backgroundMusic] || 
                     AUDIO_CONFIG.backgroundMusic.default;

    // 如果已经在播放相同的音乐，不重复播放
    if (currentMusic === musicFile && isMusicPlaying || disabled) return;

    // 停止当前音乐
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    // 播放新音乐
    if (musicRef.current) {
      musicRef.current.src = musicFile;
      musicRef.current.volume = settings.musicVolume;
      musicRef.current.loop = true;
      musicRef.current.play()
        .then(() => {
          setCurrentMusic(musicFile);
          setIsMusicPlaying(true);
        })
        .catch(console.error);
    }
  }, [settings.musicEnabled, settings.musicVolume, currentMusic, isMusicPlaying]);

  // 停止背景音乐
  const stopBackgroundMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      setIsMusicPlaying(false);
      setCurrentMusic(null);
    }
  }, []);

  // 切换音效开关
  const toggleSound = useCallback(() => {
    saveSettings({ soundEnabled: !settings.soundEnabled });
    if (settings.soundEnabled) {
      playClickSound();
    } else {
      stopClickSound();
    }
  }, [settings.soundEnabled, saveSettings]);

  // 切换背景音乐开关
  const toggleMusic = useCallback(() => {
    const newMusicEnabled = !settings.musicEnabled;
    saveSettings({ musicEnabled: newMusicEnabled });
    
    if (newMusicEnabled) {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [settings.musicEnabled, saveSettings, stopBackgroundMusic]);

  // 设置音量
  const setMusicVolume = useCallback((volume: number) => {
    saveSettings({ musicVolume: volume });
    if (musicRef.current) {
      musicRef.current.volume = volume;
    }
  }, [saveSettings]);

  const setSoundVolume = useCallback((volume: number) => {
    saveSettings({ soundVolume: volume });
  }, [saveSettings]);

  // 初始化音频元素
  useEffect(() => {
    // 创建音乐播放器
    if (!musicRef.current) {
      musicRef.current = new Audio();
      musicRef.current.preload = 'auto';
    }

    // 创建音效播放器
    if (!soundRef.current) {
      soundRef.current = new Audio(AUDIO_CONFIG.clickSound);
      soundRef.current.preload = 'auto';
    }

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, []);

  return {
    settings,
    currentMusic,
    isMusicPlaying,
    playClickSound,
    stopClickSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    toggleSound,
    toggleMusic,
    setMusicVolume,
    setSoundVolume
  };
}
