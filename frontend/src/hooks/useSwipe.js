import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for swipe gestures
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for swipe left
 * @param {Function} options.onSwipeRight - Callback for swipe right
 * @param {Function} options.onSwipeUp - Callback for swipe up
 * @param {Function} options.onSwipeDown - Callback for swipe down
 * @param {number} options.minDistance - Minimum distance for swipe (default: 50)
 * @param {number} options.maxTime - Maximum time for swipe in ms (default: 300)
 * @returns {Object} - Ref to attach to element and swipe state
 */
export const useSwipe = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minDistance = 50,
    maxTime = 300,
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const timeStartRef = useRef(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      setIsSwiping(true);
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      touchEndRef.current = null;
      timeStartRef.current = Date.now();
    };

    const handleTouchMove = (e) => {
      touchEndRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      setIsSwiping(false);

      if (!touchStartRef.current || !touchEndRef.current) return;

      const timeElapsed = Date.now() - timeStartRef.current;
      if (timeElapsed > maxTime) return;

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Horizontal swipe
      if (absX > absY && absX > minDistance) {
        if (deltaX > 0) {
          // Swipe right
          onSwipeRight?.();
        } else {
          // Swipe left
          onSwipeLeft?.();
        }
      }
      // Vertical swipe
      else if (absY > absX && absY > minDistance) {
        if (deltaY > 0) {
          // Swipe down
          onSwipeDown?.();
        } else {
          // Swipe up
          onSwipeUp?.();
        }
      }

      // Reset
      touchStartRef.current = null;
      touchEndRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minDistance, maxTime]);

  return { ref: elementRef, isSwiping };
};
