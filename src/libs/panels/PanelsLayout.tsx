import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useTransition, animated } from "react-spring";
import { PanelsInfosProvider } from "./useLayoutInfos";
import {
  DisplayedPanel,
  Panel,
  SolvePanelsOptions,
  solvePanelsPages,
} from "./Panels";

type Keys = {
  panelsKeys: Array<string>;
  pageKeys: Array<string>;
  page: Array<DisplayedPanel>;
};

const keysEqual = (left: Keys, right: Keys) => {
  return (
    arrayShallowEqual(left.pageKeys, right.pageKeys) &&
    arrayShallowEqual(left.panelsKeys, right.panelsKeys)
  );
};

type AnimationProperties = {
  x: number;
  opacity: number;
  scale: number;
  width: number;
};

type KeysAnimationData = {
  initial?: AnimationProperties;
  animate?: AnimationProperties;
  leave?: AnimationProperties;
};

type KeysAnimation = Record<string, KeysAnimationData>;

type Props = {
  panels: Array<Panel>;
  options?: SolvePanelsOptions;
};

type PanelsKeys = {
  panelsKeys: Array<string>;
  pageIndex: number;
};

const panelsKeysEqual = (l: PanelsKeys, r: PanelsKeys) =>
  arrayShallowEqual(l.panelsKeys, r.panelsKeys) && l.pageIndex === r.pageIndex;

function getIntial(
  currentPage: DisplayedPanel,
  keys: Keys,
  prevKeys: Keys
): AnimationProperties {
  const isNew = prevKeys.panelsKeys.includes(currentPage.key) === false;
  if (isNew) {
    return {
      width: currentPage.width,
      opacity: 0,
      x: currentPage.left + currentPage.width,
      scale: 1,
    };
  }
  const firstItemIndex = prevKeys.panelsKeys.indexOf(prevKeys.pageKeys[0]);
  const currentItemIndex = prevKeys.panelsKeys.indexOf(currentPage.key);
  if (currentItemIndex < firstItemIndex) {
    // enter from left
    return {
      width: currentPage.width,
      opacity: 0,
      x: currentPage.left - currentPage.width,
      scale: 1,
    };
  }
  // enter from right
  return {
    width: currentPage.width,
    opacity: 0,
    x: currentPage.left + currentPage.width,
    scale: 1,
  };
}

function getLeave(prevPage: DisplayedPanel, keys: Keys): AnimationProperties {
  const isDeleted = keys.panelsKeys.includes(prevPage.key) === false;
  if (isDeleted) {
    return { width: prevPage.width, opacity: 0, x: prevPage.left, scale: 0.9 };
  }
  const firstItemIndex = keys.panelsKeys.indexOf(keys.pageKeys[0]);
  const currentItemIndex = keys.panelsKeys.indexOf(prevPage.key);
  if (currentItemIndex < firstItemIndex) {
    // exit to left
    return {
      width: prevPage.width,
      opacity: 0,
      x: prevPage.left - prevPage.width,
      scale: 1,
    };
  }
  // exit to right
  return {
    width: prevPage.width,
    opacity: 0,
    x: prevPage.left + prevPage.width,
    scale: 1,
  };
}

export function PanelsLayout({
  panels,
  options,
}: Props): React.ReactElement | null {
  const width = useWindowWidth(10);
  const pages = useMemo(
    () => solvePanelsPages(panels, width, options),
    [panels, width, options]
  );
  const [pageIndex, setPageIndex] = useState(() => pages.length - 1);

  const panelsKeys = useMemo(
    (): PanelsKeys => ({ panelsKeys: panels.map((p) => p.key), pageIndex }),
    [pageIndex, panels]
  );
  const prevPanelsKeys = usePrevious(panelsKeys, panelsKeysEqual);

  const pageIndexFixed = useMemo(() => {
    if (
      arrayShallowEqual(prevPanelsKeys.panelsKeys, panelsKeys.panelsKeys) ===
      false
    ) {
      return pages.length - 1;
    }
    return Math.min(pageIndex, pages.length - 1);
  }, [pageIndex, pages.length, panelsKeys, prevPanelsKeys]);

  useEffect(() => {
    if (pageIndex !== pageIndexFixed) {
      setPageIndex(pageIndexFixed);
    }
  }, [pageIndex, pageIndexFixed]);

  const page = useMemo(() => pages[pageIndexFixed], [pageIndexFixed, pages]);

  const keys = useMemo(
    (): Keys => ({
      panelsKeys: panels.map((p) => p.key),
      pageKeys: page.map((p) => p.key),
      page,
    }),
    [page, panels]
  );

  const prevKeys = usePrevious(keys, keysEqual);

  const keysAnimation = useMemo((): KeysAnimation => {
    const result: KeysAnimation = {};
    const allKeys = new Set([...keys.pageKeys, ...prevKeys.pageKeys]);
    allKeys.forEach((key) => {
      const currentPage = keys.page.find((p) => p.key === key);
      const prevPage = prevKeys.page.find((p) => p.key === key);
      const data: KeysAnimationData = {
        animate: {
          opacity: 1,
          scale: 1,
          x: currentPage?.left ?? prevPage?.left ?? 0,
          width: currentPage?.width ?? prevPage?.width ?? 0,
        },
      };
      if (currentPage && !prevPage) {
        // initial
        data.initial = getIntial(currentPage, keys, prevKeys);
      }
      if (prevPage && !currentPage) {
        // leave
        data.leave = getLeave(prevPage, keys);
      }
      result[key] = data;
    });
    return result;
  }, [keys, prevKeys]);

  const transitions = useTransition([...page].reverse(), {
    from: (item) => {
      return keysAnimation[item.key].initial ?? {};
    },
    update: (item) => {
      return keysAnimation[item.key].animate ?? {};
    },
    enter: (item) => {
      return keysAnimation[item.key].animate ?? {};
    },
    leave: (item) => {
      return keysAnimation[item.key].leave ?? {};
    },
    keys: (item) => item.key,
    delay: 0,
  });

  const onShowChildren = useCallback(() => {
    setPageIndex((p) => p + 1);
  }, []);

  const onShowParent = useCallback(() => {
    setPageIndex((p) => p - 1);
  }, []);

  const onShowLast = useCallback(() => {
    setPageIndex(pages.length - 1);
  }, [pages.length]);

  return (
    <div
      style={{
        position: "absolute",
        overflow: "hidden",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {transitions((styles, { content, canShowChildren, canShowParent }) => (
        <animated.div
          style={{
            ...styles,
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <PanelsInfosProvider
            showChildren={canShowChildren ? onShowChildren : null}
            showParent={canShowParent ? onShowParent : null}
            showLast={onShowLast}
            panelWidth={width}
          >
            {content}
          </PanelsInfosProvider>
        </animated.div>
      ))}
    </div>
  );
}

function arrayShallowEqual<T>(left: Array<T>, right: Array<T>): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((v, i) => v === right[i]);
}

const refEqual = (l: any, r: any) => l === r;

function usePrevious<T>(
  value: T,
  equal: (l: T, r: T) => boolean = refEqual
): T {
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

function useWindowWidth(defaultSize = 1080): number {
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
