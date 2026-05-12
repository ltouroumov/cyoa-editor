export interface DebouncedFn<Args extends Array<any>> {
  (...args: Args): void;
  cancel(): void;
  flush(): void;
}

export function debounce<Args extends Array<any>>(
  fn: (...args: Args) => void,
  delay: number,
): DebouncedFn<Args> {
  let timeoutId: number | undefined;
  let lastArgs: Args | undefined;

  const call = (...args: Args): void => {
    lastArgs = args;
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      fn(...args);
      lastArgs = undefined;
      timeoutId = undefined;
    }, delay);
  };

  call.cancel = (): void => {
    window.clearTimeout(timeoutId);
    timeoutId = undefined;
    lastArgs = undefined;
  };

  call.flush = (): void => {
    if (lastArgs !== undefined) {
      window.clearTimeout(timeoutId);
      const args = lastArgs;
      lastArgs = undefined;
      timeoutId = undefined;
      fn(...args);
    }
  };

  return call;
}
