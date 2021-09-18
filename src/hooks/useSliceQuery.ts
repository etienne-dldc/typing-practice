/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEffect, useRef, useState } from "democrat";
import { notifyManager, QueryKey, QueryObserver, UseQueryOptions, UseQueryResult } from "react-query";
import { queryClient } from "@src/logic/queryClient";

export function useSliceQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
  const mountedRef = useRef(false);
  const [, forceUpdate] = useState(0);

  const defaultedOptions = queryClient.defaultQueryObserverOptions(options);

  // Make sure results are optimistically set in fetching state before subscribing or updating options
  defaultedOptions.optimisticResults = true;

  // Include callbacks in batch renders
  if (defaultedOptions.onError) {
    defaultedOptions.onError = notifyManager.batchCalls(defaultedOptions.onError);
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = notifyManager.batchCalls(defaultedOptions.onSuccess);
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = notifyManager.batchCalls(defaultedOptions.onSettled);
  }

  if (defaultedOptions.suspense) {
    // Always set stale time when using suspense to prevent
    // fetching again when directly mounting after suspending
    if (typeof defaultedOptions.staleTime !== "number") {
      defaultedOptions.staleTime = 1000;
    }
  }

  const obsRef = useRef<QueryObserver<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>>();

  if (!obsRef.current) {
    obsRef.current = new QueryObserver<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>(
      queryClient,
      defaultedOptions
    );
  }

  let result = obsRef.current.getOptimisticResult(defaultedOptions);

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = obsRef.current!.subscribe(
      notifyManager.batchCalls(() => {
        if (mountedRef.current) {
          forceUpdate((x) => x + 1);
        }
      })
    );

    // Update result to make sure we did not miss any query updates
    // between creating the observer and subscribing to it.
    obsRef.current!.updateResult();

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    obsRef.current!.setOptions(defaultedOptions, { listeners: false });
  }, [defaultedOptions]);

  // Handle result property usage tracking
  if (defaultedOptions.notifyOnChangeProps === "tracked") {
    result = obsRef.current.trackResult(result);
  }

  return result;
}
