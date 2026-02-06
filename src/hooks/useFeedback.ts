import { useCallback, useEffect, useRef, useState } from 'react';
import { useHaptics } from './useHaptics';
import { useSounds } from './useSounds';

type SoundPack = 'ios' | 'minimal' | 'retro' | 'none';

interface SoundSettings {
  enabled: boolean;
  soundPack: SoundPack;
  volume: number;
}

// Local storage key for sound settings
const STORAGE_KEY = 'sibe-sound-settings';

const getStoredSettings = (): SoundSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fallback to defaults
  }
  return { enabled: true, soundPack: 'ios', volume: 0.5 };
};

/**
 * Combined feedback hook for iOS-like interactions
 * Provides synchronized sound and haptic feedback
 */
export const useFeedback = () => {
  const [settings, setSettings] = useState<SoundSettings>(getStoredSettings);

  // Listen for storage changes (from Settings page)
  useEffect(() => {
    const handleStorage = () => {
      setSettings(getStoredSettings());
    };
    
    // Custom event for same-tab updates
    window.addEventListener('sound-settings-changed', handleStorage);
    // Storage event for cross-tab
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('sound-settings-changed', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const haptics = useHaptics();
  const sounds = useSounds(settings.soundPack, settings.volume);

  // Update sounds enabled state based on settings
  useEffect(() => {
    sounds.setEnabled(settings.enabled);
  }, [settings.enabled, sounds]);

  // Light tap - for small UI interactions
  const tap = useCallback(() => {
    haptics.lightTap();
    sounds.tap();
  }, [haptics, sounds]);

  // Medium feedback - for button presses
  const button = useCallback(() => {
    haptics.mediumTap();
    sounds.click();
  }, [haptics, sounds]);

  // Button press alias
  const buttonPress = useCallback(() => {
    haptics.mediumTap();
    sounds.click();
  }, [haptics, sounds]);

  // Toggle feedback - for switches
  const toggle = useCallback(() => {
    haptics.lightTap();
    sounds.pop();
  }, [haptics, sounds]);

  // Selection feedback - for dropdowns, pickers
  const select = useCallback(() => {
    haptics.selectionChanged();
    sounds.pop();
  }, [haptics, sounds]);

  // Light feedback - simple alias
  const light = useCallback(() => {
    haptics.lightTap();
    sounds.tap();
  }, [haptics, sounds]);

  // Confirm feedback - for confirmations
  const confirm = useCallback(() => {
    haptics.heavyTap();
    sounds.click();
  }, [haptics, sounds]);

  // Success feedback
  const success = useCallback(() => {
    haptics.success();
    sounds.success();
  }, [haptics, sounds]);

  // Error feedback
  const error = useCallback(() => {
    haptics.error();
    sounds.error();
  }, [haptics, sounds]);

  // Warning feedback
  const warning = useCallback(() => {
    haptics.warning();
    sounds.warning();
  }, [haptics, sounds]);

  // Navigation feedback
  const navigate = useCallback(() => {
    haptics.lightTap();
    sounds.swoosh();
  }, [haptics, sounds]);

  // Heavy impact - for confirmations
  const impact = useCallback(() => {
    haptics.heavyTap();
    sounds.click();
  }, [haptics, sounds]);

  // Message sent
  const messageSent = useCallback(() => {
    haptics.mediumTap();
    sounds.messageSent();
  }, [haptics, sounds]);

  // Message received
  const messageReceived = useCallback(() => {
    haptics.lightTap();
    sounds.messageReceived();
  }, [haptics, sounds]);

  return {
    tap,
    button,
    buttonPress,
    toggle,
    select,
    light,
    confirm,
    success,
    error,
    warning,
    navigate,
    impact,
    messageSent,
    messageReceived,
  };
};

export default useFeedback;
