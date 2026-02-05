import { useCallback, useRef } from 'react';

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate iOS-like subtle tones
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

export const useSounds = () => {
  const enabledRef = useRef(true);

  // Soft tap sound - like iOS keyboard
  const tap = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(1200, 0.05, 0.08);
  }, []);

  // Pop sound - for toggles, selections
  const pop = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(800, 0.08, 0.1);
    setTimeout(() => playTone(1000, 0.05, 0.06), 30);
  }, []);

  // Click sound - for buttons
  const click = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(600, 0.04, 0.12);
  }, []);

  // Success chime - ascending tones
  const success = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(523, 0.1, 0.1); // C5
    setTimeout(() => playTone(659, 0.1, 0.1), 80); // E5
    setTimeout(() => playTone(784, 0.15, 0.08), 160); // G5
  }, []);

  // Error sound - descending tone
  const error = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(400, 0.15, 0.12);
    setTimeout(() => playTone(300, 0.2, 0.1), 100);
  }, []);

  // Warning sound
  const warning = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(440, 0.1, 0.1);
    setTimeout(() => playTone(440, 0.1, 0.1), 150);
  }, []);

  // Swoosh - for navigation
  const swoosh = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, []);

  // Message sent sound
  const messageSent = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(700, 0.06, 0.1);
    setTimeout(() => playTone(900, 0.08, 0.08), 50);
  }, []);

  // Message received sound
  const messageReceived = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(600, 0.1, 0.08);
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
