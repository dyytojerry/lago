import { apiRequest } from '@/lib/api-request';
import { useState, useEffect, useRef, useCallback } from 'react';

export type TTSProvider = 'qwen' | 'web-speech' | 'none';

interface AudioPlayerState {
  isPlaying: boolean;
  currentMessageId: number | null;
  volume: number;
  rate: number;
  enabled: boolean;
  autoPlay: boolean;
  provider: TTSProvider;
  voice: string;
}

interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  play: (text: string, messageId: number) => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
  setVoice: (voice: string) => void;
  toggleEnabled: () => void;
  isMessagePlaying: (messageId: number) => boolean;
}

/**
 * 音频播放器 Hook
 * 支持通义千问TTS、Web Speech API和纯文字降级
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentMessageId: null,
    volume: 0.8,
    rate: 1.0,
    enabled: true,
    autoPlay: true,
    provider: 'qwen',
    voice: 'aibao',
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 从 localStorage 加载设置
  useEffect(() => {
    const savedEnabled = localStorage.getItem('tts-enabled');
    const savedVolume = localStorage.getItem('tts-volume');
    const savedRate = localStorage.getItem('tts-rate');
    const savedAutoPlay = localStorage.getItem('tts-autoplay');
    const savedVoice = localStorage.getItem('tts-voice');

    setState(prev => ({
      ...prev,
      enabled: savedEnabled !== null ? savedEnabled === 'true' : true,
      volume: savedVolume ? parseFloat(savedVolume) : 0.8,
      rate: savedRate ? parseFloat(savedRate) : 1.0,
      autoPlay: savedAutoPlay !== null ? savedAutoPlay === 'true' : true,
      voice: savedVoice || 'aibao',
    }));
  }, []);

  // 保存设置到 localStorage
  const saveSettings = useCallback((key: string, value: any) => {
    localStorage.setItem(key, String(value));
  }, []);

  // 清理音频资源
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (speechSynthRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speechSynthRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentMessageId: null,
    }));
  }, []);

  // 使用通义千问TTS
  const playWithQwenTTS = useCallback(async (text: string, messageId: number): Promise<boolean> => {
    try {
      abortControllerRef.current = new AbortController();

      const synthesizeData = await apiRequest("/api/tts/synthesize", {
        method: 'POST',
        body: JSON.stringify({
          text,
          voice: state.voice, // 使用用户选择的音色
          rate: state.rate,
          volume: state.volume,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!synthesizeData.success || !synthesizeData.data?.audioUrl) {
        throw new Error('Invalid TTS response');
      }

      // 播放音频
      audioRef.current = new Audio(synthesizeData.data.audioUrl);
      audioRef.current.volume = state.volume;
      audioRef.current.playbackRate = state.rate;

      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentMessageId: messageId,
        provider: 'qwen',
      }));

      audioRef.current.onended = () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentMessageId: null,
        }));
      };

      audioRef.current.onerror = () => {
        console.error('Audio playback error');
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentMessageId: null,
        }));
      };

      await audioRef.current.play();
      return true;
    } catch (error) {
      console.error('Qwen TTS failed:', error);
      cleanup();
      return false;
    }
  }, [state.rate, state.volume, state.voice, cleanup]);

  // 使用 Web Speech API
  const playWithWebSpeech = useCallback(async (text: string, messageId: number): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        throw new Error('Web Speech API not supported');
      }

      // 取消之前的语音
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = state.rate;
      utterance.pitch = 1.2; // 略高音调，更像宠物
      utterance.volume = state.volume;

      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentMessageId: messageId,
        provider: 'web-speech',
      }));

      utterance.onend = () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentMessageId: null,
        }));
      };

      utterance.onerror = (error) => {
        console.error('Web Speech error:', error);
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentMessageId: null,
        }));
      };

      window.speechSynthesis.speak(utterance);
      speechSynthRef.current = utterance;
      return true;
    } catch (error) {
      console.error('Web Speech API failed:', error);
      return false;
    }
  }, [state.rate, state.volume]);

  // 播放音频（带降级策略）
  const play = useCallback(async (text: string, messageId: number) => {
    if (!state.enabled) {
      console.log('TTS disabled by user');
      return;
    }

    // 停止当前播放
    cleanup();

    // 策略1: 优先使用通义千问TTS（高质量儿童音色）
    console.log('Trying Qwen TTS...');
    const qwenSuccess = await playWithQwenTTS(text, messageId);
    if (qwenSuccess) {
      console.log('Qwen TTS success');
      return;
    }

    // 策略2: 降级到 Web Speech API
    console.log('Qwen TTS failed, falling back to Web Speech API...');
    const webSpeechSuccess = await playWithWebSpeech(text, messageId);
    if (webSpeechSuccess) {
      console.log('Web Speech API success');
      return;
    }

    // 策略3: 纯文字（不播放音频）
    console.log('All TTS methods failed, using text only');
    setState(prev => ({
      ...prev,
      provider: 'none',
    }));
  }, [state.enabled, cleanup, playWithQwenTTS, playWithWebSpeech]);

  // 暂停播放
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (speechSynthRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  // 停止播放
  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, volume: clampedVolume }));
    saveSettings('tts-volume', clampedVolume);

    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, [saveSettings]);

  // 设置语速
  const setRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2, rate));
    setState(prev => ({ ...prev, rate: clampedRate }));
    saveSettings('tts-rate', clampedRate);

    if (audioRef.current) {
      audioRef.current.playbackRate = clampedRate;
    }
  }, [saveSettings]);

  // 设置音色
  const setVoice = useCallback((voice: string) => {
    setState(prev => ({ ...prev, voice }));
    saveSettings('tts-voice', voice);
  }, [saveSettings]);

  // 切换启用状态
  const toggleEnabled = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.enabled;
      saveSettings('tts-enabled', newEnabled);
      if (!newEnabled) {
        cleanup();
      }
      return { ...prev, enabled: newEnabled };
    });
  }, [saveSettings, cleanup]);

  // 检查消息是否正在播放
  const isMessagePlaying = useCallback((messageId: number) => {
    return state.isPlaying && state.currentMessageId === messageId;
  }, [state.isPlaying, state.currentMessageId]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    play,
    pause,
    stop,
    setVolume,
    setRate,
    setVoice,
    toggleEnabled,
    isMessagePlaying,
  };
}

