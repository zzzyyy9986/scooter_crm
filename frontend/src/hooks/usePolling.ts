import { useEffect, useRef } from 'react';

/**
 * Периодически вызывает callback с заданным интервалом.
 * @param callback - Функция обновления данных.
 * @param intervalMs - Интервал между вызовами.
 * @param enabled - Включён ли polling.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timerId = window.setInterval(() => {
      void callbackRef.current();
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [intervalMs, enabled]);
}
