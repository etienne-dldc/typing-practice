import { useEffect, useState } from "react";

export function useRenderAt(time: number | null): void {
  const [, setNum] = useState(0);

  useEffect(() => {
    if (time === null) {
      return;
    }
    const now = Date.now();
    const diff = time - now;
    if (diff <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setNum(Math.random());
    }, diff);
    return () => {
      clearTimeout(timer);
    };
  }, [time]);
}
