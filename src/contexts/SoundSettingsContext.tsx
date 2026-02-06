import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SoundPack = 'ios' | 'minimal' | 'retro' | 'none';

interface SoundSettings {
  enabled: boolean;
  soundPack: SoundPack;
  volume: number;
}

interface SoundSettingsContextType {
  settings: SoundSettings;
  setEnabled: (enabled: boolean) => void;
  setSoundPack: (pack: SoundPack) => void;
  setVolume: (volume: number) => void;
}

const defaultSettings: SoundSettings = {
  enabled: true,
  soundPack: 'ios',
  volume: 0.5,
};

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'sibe-sound-settings';

export const SoundSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.debug('Failed to load sound settings');
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // Dispatch custom event for useFeedback hook to pick up changes
      window.dispatchEvent(new Event('sound-settings-changed'));
    } catch (e) {
      console.debug('Failed to save sound settings');
    }
  }, [settings]);

  const setEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }));
  };

  const setSoundPack = (soundPack: SoundPack) => {
    setSettings(prev => ({ ...prev, soundPack }));
  };

  const setVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  };

  return (
    <SoundSettingsContext.Provider value={{ settings, setEnabled, setSoundPack, setVolume }}>
      {children}
    </SoundSettingsContext.Provider>
  );
};

export const useSoundSettings = () => {
  const context = useContext(SoundSettingsContext);
  if (!context) {
    throw new Error('useSoundSettings must be used within a SoundSettingsProvider');
  }
  return context;
};
