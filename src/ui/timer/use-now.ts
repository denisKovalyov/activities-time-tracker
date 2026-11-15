import { useSyncExternalStore } from 'react';

// One clock shared by everything that shows live time. It ticks only while
// someone is subscribed, and components subscribe only while their timer is
// running, so nothing re-renders every second when no timer is running.
let now = 0;
let intervalId: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    intervalId = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, 1000);
  }

  return () => {
    listeners.delete(listener);
    if (!listeners.size) clearInterval(intervalId);
  };
};

const subscribeNothing = () => () => {};

// Current time in ms, updated every second while `enabled`. Returns 0 when
// disabled and during server rendering, which shows no live time.
export const useNow = (enabled: boolean) =>
  useSyncExternalStore(
    enabled ? subscribe : subscribeNothing,
    () => (enabled ? now : 0),
    () => 0,
  );
