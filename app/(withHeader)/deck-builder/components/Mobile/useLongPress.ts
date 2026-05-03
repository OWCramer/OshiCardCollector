import { useCallback, useRef, useState } from "react";

interface LongPressOptions {
  onLongPress: () => void;
  onClick: () => void;
  ms?: number;
  /** Pixels of movement before the gesture is treated as a scroll, not a tap/hold */
  moveThreshold?: number;
}

export function useLongPress({
  onLongPress,
  onClick,
  ms = 500,
  moveThreshold = 8,
}: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const hasMoved = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const [pressing, setPressing] = useState(false);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
  }, []);

  const start = useCallback(
    (x?: number, y?: number) => {
      didLongPress.current = false;
      hasMoved.current = false;
      startPos.current = x !== undefined && y !== undefined ? { x, y } : null;
      setPressing(true);
      timerRef.current = setTimeout(() => {
        didLongPress.current = true;
        setPressing(false);
        onLongPress();
      }, ms);
    },
    [onLongPress, ms]
  );

  const move = useCallback(
    (x?: number, y?: number) => {
      if (!startPos.current) {
        hasMoved.current = true;
        cancel();
        return;
      }
      if (x !== undefined && y !== undefined) {
        const dx = Math.abs(x - startPos.current.x);
        const dy = Math.abs(y - startPos.current.y);
        if (dx > moveThreshold || dy > moveThreshold) {
          hasMoved.current = true;
          cancel();
        }
      }
    },
    [cancel, moveThreshold]
  );

  const end = useCallback(() => {
    cancel();
    if (!didLongPress.current && !hasMoved.current) onClick();
  }, [cancel, onClick]);

  return {
    pressing,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      cancel();
      onLongPress();
    },
    onTouchStart: (e: React.TouchEvent) => start(e.touches[0]?.clientX, e.touches[0]?.clientY),
    onTouchEnd: end,
    onTouchMove: (e: React.TouchEvent) => move(e.touches[0]?.clientX, e.touches[0]?.clientY),
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseUp: end,
    onMouseLeave: cancel,
  };
}
