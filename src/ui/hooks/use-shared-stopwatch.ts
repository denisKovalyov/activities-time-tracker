import { useState, useEffect } from 'react';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();
export const updateState = (value: number) => {
  emitter.emit('stateChange', value);
};

export const useSharedStopwatch = () => {
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  useEffect(() => {
    const listener = (value: number) => setStopwatchSeconds(value);
    emitter.on('stateChange', listener);
    return () => {
      emitter.off('stateChange', listener);
    };
  }, []);

  return {
    value: stopwatchSeconds,
  };
};
