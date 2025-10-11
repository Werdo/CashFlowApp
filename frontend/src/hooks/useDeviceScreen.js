import { useEffect, useState } from 'react';

/**
 * useDeviceScreen Hook
 * Adapted from Facit template for CashFlow v3.0
 * Returns current device screen properties and updates on resize
 */

const hasNotch = () => {
  if (typeof window === 'undefined') return false;

  const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
  const aspect = window.screen.width / window.screen.height;

  return iPhone && aspect.toFixed(3) === '0.462';
};

export default function useDeviceScreen() {
  const isClient = typeof window === 'object';

  function getProperties() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
      screenWidth: isClient ? window.screen.width : undefined,
      screenHeight: isClient ? window.screen.height : undefined,
      portrait: isClient ? window.matchMedia('(orientation: portrait)').matches : undefined,
      landscape: isClient ? window.matchMedia('(orientation: landscape)').matches : undefined,
      notch: hasNotch(),
    };
  }

  const [deviceScreen, setDeviceScreen] = useState(getProperties);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    function handleResize() {
      setDeviceScreen(getProperties());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return deviceScreen;
}
