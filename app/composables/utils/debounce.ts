export function debounce<Args extends Array<any>>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let nextTimeoutId: number | undefined;

  return (...args: Args) => {
    window.clearTimeout(nextTimeoutId);
    nextTimeoutId = window.setTimeout(() => fn(...args), delay);
  };
}
