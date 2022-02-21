import { Panels } from "src/libs/panels";

export type GetPanels<Props> = (props: Props) => Panels;

export interface PanelsPageComponent<Props> {
  // fake component
  (): JSX.Element;
  readonly getPanels: GetPanels<Props>;
}

export function createPanelPages<Props>(
  getPanels: GetPanels<Props>
): PanelsPageComponent<Props> {
  return Object.assign(
    (): JSX.Element => {
      return <div />;
    },
    {
      getPanels,
    }
  );
}

export function isPanelPageComponent(
  page: any
): page is PanelsPageComponent<any> {
  return typeof page.getPanels === "function";
}
