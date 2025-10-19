import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  delay?: number; // Delay in milliseconds (default: 2000)
  onSave: (data: any) => Promise<void>;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  triggerSave: () => void;
}

/**
 * Hook for automatic saving with debounce
 *
 * @example
 * const { isSaving, lastSaved, error } = useAutoSave({
 *   delay: 2000,
 *   onSave: async (data) => {
 *     await api.saveData(data);
 *   },
 *   enabled: true
 * });
 */
export function useAutoSave<T>(
  data: T,
  options: UseAutoSaveOptions
): UseAutoSaveReturn {
  const { delay = 2000, onSave, enabled = true } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const isMountedRef = useRef(true);

  // Manual trigger for immediate save
  const triggerSave = useCallback(async () => {
    if (!enabled || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      await onSave(data);
      if (isMountedRef.current) {
        setLastSaved(new Date());
        previousDataRef.current = data;
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to save'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [data, enabled, isSaving, onSave]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Don't auto-save if disabled
    if (!enabled) return;

    // Don't auto-save if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(async () => {
      await triggerSave();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, triggerSave]);

  return {
    isSaving,
    lastSaved,
    error,
    triggerSave
  };
}

/**
 * Simplified version for basic auto-save without state tracking
 */
export function useSimpleAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave]);
}
