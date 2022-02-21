import { useEffect, useRef } from "react";

const refEqual = (l: any, r: any) => l === r;

export function usePrevious<T>(value: T, equal: (l: T, r: T) => boolean = refEqual): T {
  const currentRef = useRef(value);
  const previousRef = useRef(value);

  const previous = (() => {
    if (!equal(currentRef.current, value)) {
      return currentRef.current;
    }
    return previousRef.current;
  })();

  useEffect(() => {
    if (!equal(currentRef.current, value)) {
      previousRef.current = currentRef.current;
    }
  }, [equal, value]);

  useEffect(() => {
    currentRef.current = value;
  }, [value]);

  return previous;
}
