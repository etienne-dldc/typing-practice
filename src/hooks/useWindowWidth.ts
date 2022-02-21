import { useEffect, useState } from "react";

export function useWindowWidth(defaultSize = 1080): number {
  const [width, setWidth] = useState(() => defaultSize);

  useEffect(() => {
    // set real width on mount
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    let frameRequest: number | null = null;
    const onResize = () => {
      if (frameRequest === null) {
        frameRequest = window.requestAnimationFrame(() => {
          setWidth(window.innerWidth);
          frameRequest = null;
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frameRequest !== null) {
        window.cancelAnimationFrame(frameRequest);
      }
    };
  }, []);

  return width;
}
