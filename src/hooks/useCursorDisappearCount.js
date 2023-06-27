import { useState, useEffect } from "react";

export function useCursorDisappearCount(timerDuration, cursorPosition) {
  const [cursorDisappearCount, setCursorDisappearCount] =
    useState(timerDuration);

  useEffect(() => {
    const countIntervalId = setInterval(() => {
      if (cursorDisappearCount > 0) {
        setCursorDisappearCount((count) => count - 1);
      }
    }, 1000);

    return () => clearInterval(countIntervalId);
  }, [cursorDisappearCount]);

  useEffect(() => {
    setCursorDisappearCount(timerDuration);
  }, [cursorPosition, timerDuration]);

  return cursorDisappearCount;
}
