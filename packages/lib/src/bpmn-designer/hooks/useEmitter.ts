import { useCallback, useEffect, useRef } from 'react';
import emitter from '../util/emitter';

export interface EmitterEvents {
  executionListener: (value?: { action: 'delete' | 'edit'; data: any }) => void;
  extension: (value?: { action: 'delete' | 'edit'; data: any }) => void;
  eventListener: (value?: { action: 'delete' | 'edit'; data: any }) => void;
  dataObject: (value?: { action: 'delete' | 'edit'; data: any }) => void;
  taskListener: (value?: { action: 'delete' | 'edit'; data: any }) => void;
  globalEvent: (value: {
    action?: 'delete' | 'edit';
    data?: any;
    type: string;
  }) => void;
}

export function useEmitter<K extends keyof EmitterEvents>(
  event: K,
  callback: EmitterEvents[K],
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const listener = (...args: any[]) => {
      // @ts-expect-error
      callbackRef.current?.(...args);
    };

    emitter.on(event, listener as any);

    return () => {
      emitter.off(event, listener as any);
    };
  }, [event]);
}

export function useEmit() {
  const emit = useCallback(
    <K extends keyof EmitterEvents>(
      event: K,
      ...args: Parameters<EmitterEvents[K]>
    ) => {
      emitter.emit(event, ...args);
    },
    [],
  );

  return emit;
}
