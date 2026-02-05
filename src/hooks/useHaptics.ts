import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Check if we're on a native platform
const isNative = () => {
  return typeof window !== 'undefined' && 
    (window as any).Capacitor?.isNativePlatform?.() === true;
};

// Fallback to Web Vibration API
const webVibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const useHaptics = () => {
  // Light tap - for selections, toggles
  const lightTap = async () => {
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else {
        webVibrate(10);
      }
    } catch (e) {
      console.debug('Haptics not available');
    }
  };

  // Medium tap - for button presses
  const mediumTap = async () => {
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else {
        webVibrate(20);
      }
    } catch (e) {
      console.debug('Haptics not available');
    }
  };

  // Heavy tap - for confirmations, important actions
  const heavyTap = async () => {
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else {
        webVibrate(30);
      }
    } catch (e) {
      console.debug('Haptics not available');
    }
  };

  // Success notification
  const success = async () => {
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        webVibrate([10, 50, 10]);
      }
    } catch (e) {
      console.debug('Haptics not available');
    }
  };

  // Warning notification
  const warning = async () => {
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Warning });
      } else {
        webVibrate([20, 100, 20]);
      }
    } catch (e) {
      console.debug('Haptics not available');
    }
  };

  // Error notification
  const error = async () => {
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Error });
      } else {
        webVibrate([30, 100, 30, 100, 30]);
      }
    } catch (e) {
      console.debug('Haptics not available');
    }
  };

  // Selection changed
  const selectionChanged = async () => {
    try {
      if (isNative()) {
        await Haptics.selectionChanged();
      } else {
        webVibrate(5);
      }
    } catch (e) {
      console.debug('Haptics not available');
    }
  };

  return {
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    selectionChanged,
  };
};

export default useHaptics;
