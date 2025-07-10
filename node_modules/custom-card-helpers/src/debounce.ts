/**
 * Returns a function, that, as long as it continues to be invoked, will not be triggered. It will be called after it stops being called for `wait` ms.
 * This can be usefull for ResizeObservers for example.
 * @param func The function you want to debounce
 * @param wait Period to wait in ms
 * @param immediate Triggering on the leading edge instead of the trailing
 * @returns Debounced Function
 */
// eslint-disable-next-line: ban-types
export const debounce = <T extends (...args) => unknown>(
  func: T,
  wait: number,
  immediate = false
): T => {
  let timeout;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return function (...args) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};
