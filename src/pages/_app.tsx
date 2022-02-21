import "src/global.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { isPanelPageComponent, GetPanels } from "src/logic/PanelsPage";
import { PanelsLayout } from "src/libs/panels";
import { ParamsProvider } from "src/libs/params";
import { PARAMS } from "src/logic/Params";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ParamsProvider params={PARAMS}>
          {isPanelPageComponent(Component) ? (
            <PanelPageComponent
              pageProps={pageProps}
              getPanels={Component.getPanels}
            />
          ) : (
            <Component {...pageProps} />
          )}
        </ParamsProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

function PanelPageComponent(props: {
  pageProps: any;
  getPanels: GetPanels<any>;
}) {
  const panels = props.getPanels(props.pageProps);
  return <PanelsLayout panels={panels} />;
}

export default MyApp;
