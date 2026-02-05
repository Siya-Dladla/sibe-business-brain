import { useCallback } from 'react';
import { useHaptics } from './useHaptics';
import { useSounds } from './useSounds';

// Combined hook for synchronized haptic + sound feedback
export const useFeedback = () => {
  const haptics = useHaptics();
  const sounds = useSounds();

  // Light interaction - toggles, selections
  const light = useCallback(async () => {
    sounds.tap();
    await haptics.lightTap();
  }, [haptics, sounds]);

  // Button press
  const buttonPress = useCallback(async () => {
    sounds.click();
    await haptics.mediumTap();
  }, [haptics, sounds]);

  // Success action
  const success = useCallback(async () => {
    sounds.success();
    await haptics.success();
  }, [haptics, sounds]);

  // Error action
  const error = useCallback(async () => {
    sounds.error();
    await haptics.error();
  }, [haptics, sounds]);

  // Warning
  const warning = useCallback(async () => {
    sounds.warning();
    await haptics.warning();
  }, [haptics, sounds]);

  // Navigation
  const navigate = useCallback(async () => {
    sounds.swoosh();
    await haptics.lightTap();
  }, [haptics, sounds]);

  // Toggle/switch
  const toggle = useCallback(async () => {
    sounds.pop();
    await haptics.lightTap();
  }, [haptics, sounds]);

  // Message sent
  const messageSent = useCallback(async () => {
    sounds.messageSent();
    await haptics.mediumTap();
  }, [haptics, sounds]);

  // Message received
  const messageReceived = useCallback(async () => {
    sounds.messageReceived();
    await haptics.lightTap();
  }, [haptics, sounds]);

  // Selection changed (picker, list)
  const selectionChanged = useCallback(async () => {
    sounds.tap();
    await haptics.selectionChanged();
  }, [haptics, sounds]);

  // Heavy confirmation
  const confirm = useCallback(async () => {
    sounds.pop();
    await haptics.heavyTap();
  }, [haptics, sounds]);

  return {
    light,
    buttonPress,
    success,
    error,
    warning,
    navigate,
    toggle,
    messageSent,
    messageReceived,
    selectionChanged,
    confirm,
    // Expose individual APIs for custom combinations
    haptics,
    sounds,
  };
};

export default useFeedback;
