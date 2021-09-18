/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useEffect, useRef, useState } from "democrat";
import { UseMutationOptions, UseMutationResult, MutationObserver, notifyManager, UseMutateFunction } from "react-query";
import { queryClient } from "@src/logic/queryClient";

export function useSliceMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const mountedRef = useRef(false);
  const [, forceUpdate] = useState(0);

  const obsRef = useRef<MutationObserver<any, any, any, any>>();

  if (!obsRef.current) {
    obsRef.current = new MutationObserver(queryClient, options);
  } else {
    obsRef.current.setOptions(options);
  }

  const currentResult = obsRef.current.getCurrentResult();

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = obsRef.current!.subscribe(
      notifyManager.batchCalls(() => {
        if (mountedRef.current) {
          forceUpdate((x) => x + 1);
        }
      })
    );
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const mutate = useCallback<UseMutateFunction<TData, TError, TVariables, TContext>>((variables, mutateOptions) => {
    obsRef.current!.mutate(variables, mutateOptions).catch(() => {
      /**/
    });
  }, []);

  if (currentResult.error && obsRef.current.options.useErrorBoundary) {
    throw currentResult.error;
  }

  return { ...currentResult, mutate, mutateAsync: currentResult.mutate };
}
