import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for pull-to-refresh gesture
 * @param {Function} onRefresh - Callback when refresh is triggered
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Pull distance threshold (default: 80)
 * @param {number} options.maxPullDistance - Maximum pull distance (default: 150)
 * @returns {Object} - Ref to attach and refresh state
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
  const { threshold = 80, maxPullDistance = 150 } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const touchStartY = useRef(0);
  const scrollTop = useRef(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      // Only allow pull-to-refresh at top of scroll
      scrollTop.current = element.scrollTop || window.scrollY;
      if (scrollTop.current === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (scrollTop.current !== 0 || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      if (distance > 0) {
        // Pulling down
        e.preventDefault();
        const pull = Math.min(distance, maxPullDistance);
        setPullDistance(pull);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);

        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        // Reset pull
        setPullDistance(0);
      }

      touchStartY.current = 0;
      scrollTop.current = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, maxPullDistance, pullDistance, isRefreshing]);

  return {
    ref: elementRef,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
};
