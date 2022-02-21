import React, { createContext, useContext, useMemo } from "react";

export type PanelsInfos = {
  panelWidth: number;
  showLast: () => void;
  showParent: (() => void) | null;
  showChildren: (() => void) | null;
};

const PanelsInfosContext = createContext<PanelsInfos | null>(null);

export type PanelsInfosProviderProps = {
  showParent: (() => void) | null;
  showChildren: (() => void) | null;
  showLast: () => void;
  panelWidth: number;
  children: React.ReactNode;
};

export function PanelsInfosProvider({
  showChildren,
  showParent,
  showLast,
  panelWidth,
  children,
}: PanelsInfosProviderProps): JSX.Element {
  const value = useMemo(
    (): PanelsInfos => ({ showParent, showChildren, panelWidth, showLast }),
    [showParent, showChildren, showLast, panelWidth]
  );
  return (
    <PanelsInfosContext.Provider value={value}>
      {children}
    </PanelsInfosContext.Provider>
  );
}

export function useMaybePanelsInfos(): PanelsInfos | null {
  const value = useContext(PanelsInfosContext);
  return value;
}

export function usePanelsInfos(): PanelsInfos {
  const user = useMaybePanelsInfos();
  if (user === null) {
    throw new Error("Unexpected null LayoutInfosContext !");
  }
  return user;
}
