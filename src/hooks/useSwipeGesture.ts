import { useRef, useCallback, TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

interface SwipeState {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
}

export const useSwipeGesture = (config: SwipeConfig): SwipeHandlers & { swipeState: SwipeState } => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventScroll = false
  } = config;

  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false
  });

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: true
    };
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - stateRef.current.startX;
    const deltaY = touch.clientY - stateRef.current.startY;

    stateRef.current.deltaX = deltaX;
    stateRef.current.deltaY = deltaY;

    // Prevent vertical scroll if horizontal swipe is dominant
    if (preventScroll && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isSwiping) return;

    const { deltaX, deltaY } = stateRef.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if swipe was primarily horizontal or vertical
    if (absX > absY && absX > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absY > absX && absY > threshold) {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    stateRef.current = {
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      isSwiping: false
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swipeState: stateRef.current
  };
};

export default useSwipeGesture;
