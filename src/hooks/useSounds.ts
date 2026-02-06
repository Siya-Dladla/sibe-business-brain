import { useCallback, useRef, useEffect } from 'react';

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

type SoundPack = 'ios' | 'minimal' | 'retro' | 'none';

// Sound pack configurations
const SOUND_PACKS = {
  ios: {
    tap: { frequency: 1200, duration: 0.05, volume: 0.08, type: 'sine' as OscillatorType },
    pop: { frequency: 800, duration: 0.08, volume: 0.1, type: 'sine' as OscillatorType },
    click: { frequency: 600, duration: 0.04, volume: 0.12, type: 'sine' as OscillatorType },
    success: [
      { frequency: 523, duration: 0.1, volume: 0.1, delay: 0 },
      { frequency: 659, duration: 0.1, volume: 0.1, delay: 80 },
      { frequency: 784, duration: 0.15, volume: 0.08, delay: 160 },
    ],
    error: [
      { frequency: 400, duration: 0.15, volume: 0.12, delay: 0 },
      { frequency: 300, duration: 0.2, volume: 0.1, delay: 100 },
    ],
    warning: [
      { frequency: 440, duration: 0.1, volume: 0.1, delay: 0 },
      { frequency: 440, duration: 0.1, volume: 0.1, delay: 150 },
    ],
    messageSent: [
      { frequency: 700, duration: 0.06, volume: 0.1, delay: 0 },
      { frequency: 900, duration: 0.08, volume: 0.08, delay: 50 },
    ],
    messageReceived: { frequency: 600, duration: 0.1, volume: 0.08, type: 'sine' as OscillatorType },
  },
  minimal: {
    tap: { frequency: 800, duration: 0.03, volume: 0.05, type: 'sine' as OscillatorType },
    pop: { frequency: 600, duration: 0.05, volume: 0.06, type: 'sine' as OscillatorType },
    click: { frequency: 500, duration: 0.03, volume: 0.07, type: 'sine' as OscillatorType },
    success: [{ frequency: 880, duration: 0.1, volume: 0.06, delay: 0 }],
    error: [{ frequency: 220, duration: 0.15, volume: 0.08, delay: 0 }],
    warning: [{ frequency: 330, duration: 0.08, volume: 0.06, delay: 0 }],
    messageSent: [{ frequency: 660, duration: 0.05, volume: 0.06, delay: 0 }],
    messageReceived: { frequency: 440, duration: 0.08, volume: 0.05, type: 'sine' as OscillatorType },
  },
  retro: {
    tap: { frequency: 1400, duration: 0.02, volume: 0.1, type: 'square' as OscillatorType },
    pop: { frequency: 1000, duration: 0.04, volume: 0.12, type: 'square' as OscillatorType },
    click: { frequency: 800, duration: 0.02, volume: 0.14, type: 'square' as OscillatorType },
    success: [
      { frequency: 440, duration: 0.08, volume: 0.1, delay: 0 },
      { frequency: 554, duration: 0.08, volume: 0.1, delay: 60 },
      { frequency: 659, duration: 0.08, volume: 0.1, delay: 120 },
      { frequency: 880, duration: 0.12, volume: 0.08, delay: 180 },
    ],
    error: [
      { frequency: 200, duration: 0.1, volume: 0.12, delay: 0 },
      { frequency: 150, duration: 0.15, volume: 0.1, delay: 80 },
    ],
    warning: [
      { frequency: 600, duration: 0.06, volume: 0.1, delay: 0 },
      { frequency: 600, duration: 0.06, volume: 0.1, delay: 100 },
      { frequency: 600, duration: 0.06, volume: 0.1, delay: 200 },
    ],
    messageSent: [
      { frequency: 880, duration: 0.04, volume: 0.1, delay: 0 },
      { frequency: 1100, duration: 0.06, volume: 0.08, delay: 40 },
    ],
    messageReceived: { frequency: 550, duration: 0.06, volume: 0.1, type: 'square' as OscillatorType },
  },
  none: null,
};

// Generate tones based on sound pack
const playTone = (frequency: number, duration: number, volume: number = 0.1, type: OscillatorType = 'sine') => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Smooth envelope for iOS-like feel
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.debug('Audio not available');
  }
};

export const useSounds = (soundPack: SoundPack = 'ios', globalVolume: number = 0.5) => {
  const enabledRef = useRef(true);
  const soundPackRef = useRef(soundPack);
  const volumeRef = useRef(globalVolume);

  useEffect(() => {
    soundPackRef.current = soundPack;
  }, [soundPack]);

  useEffect(() => {
    volumeRef.current = globalVolume;
  }, [globalVolume]);

  const getVolume = (baseVolume: number) => baseVolume * volumeRef.current;

  // Soft tap sound
  const tap = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const config = pack.tap;
    playTone(config.frequency, config.duration, getVolume(config.volume), config.type);
  }, []);

  // Pop sound - for toggles, selections
  const pop = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const config = pack.pop;
    playTone(config.frequency, config.duration, getVolume(config.volume), config.type);
  }, []);

  // Click sound - for buttons
  const click = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const config = pack.click;
    playTone(config.frequency, config.duration, getVolume(config.volume), config.type);
  }, []);

  // Success chime
  const success = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const configs = pack.success;
    configs.forEach((config: any) => {
      setTimeout(() => playTone(config.frequency, config.duration, getVolume(config.volume)), config.delay);
    });
  }, []);

  // Error sound
  const error = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const configs = pack.error;
    configs.forEach((config: any) => {
      setTimeout(() => playTone(config.frequency, config.duration, getVolume(config.volume)), config.delay);
    });
  }, []);

  // Warning sound
  const warning = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const configs = pack.warning;
    configs.forEach((config: any) => {
      setTimeout(() => playTone(config.frequency, config.duration, getVolume(config.volume)), config.delay);
    });
  }, []);

  // Swoosh - for navigation
  const swoosh = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = soundPackRef.current === 'retro' ? 'square' : 'sine';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(getVolume(0.05), ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.debug('Audio not available');
    }
  }, []);

  // Message sent sound
  const messageSent = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const configs = pack.messageSent;
    configs.forEach((config: any) => {
      setTimeout(() => playTone(config.frequency, config.duration, getVolume(config.volume)), config.delay);
    });
  }, []);

  // Message received sound
  const messageReceived = useCallback(() => {
    if (!enabledRef.current || soundPackRef.current === 'none') return;
    const pack = SOUND_PACKS[soundPackRef.current];
    if (!pack) return;
    const config = pack.messageReceived;
    playTone(config.frequency, config.duration, getVolume(config.volume), config.type);
  }, []);

  // Toggle sounds on/off
  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return {
    tap,
    pop,
    click,
    success,
    error,
    warning,
    swoosh,
    messageSent,
    messageReceived,
    setEnabled,
  };
};

export default useSounds;
