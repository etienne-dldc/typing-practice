export { solvePanelsPages } from "./Panels";
export type { DisplayedPanel, Panel, Panels } from "./Panels";

export { PanelsLayout } from "./PanelsLayout";
export {
  useMaybePanelsInfos as useLayoutInfos,
  usePanelsInfos as useLayoutInfosOrThrow,
  type PanelsInfos as LayoutInfos,
} from "./useLayoutInfos";
