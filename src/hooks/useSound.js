import { useRef, useCallback } from 'react';

export function useSound(src = '/sounds/new-order.wav') {
  const audioRef = useRef(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // Audio not supported or blocked by browser
    }
  }, [src]);

  return { play };
}
