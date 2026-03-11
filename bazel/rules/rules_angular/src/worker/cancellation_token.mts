export function createCancellationToken(signal: AbortSignal) {
  return {
    isCancellationRequested: () => signal.aborted,
    throwIfCancellationRequested: () => {
      if (signal.aborted) {
        throw new Error(signal.reason);
      }
    },
  };
}
