/**
 * Type alias for a simple number that represents the currently focused item.  When the
 * focus changes, this will be incremented, which can be useful to determine if the focus
 * has changed controls since the last time it was queried.
 */
export interface FocusCount {}

/**
 * Register a handler that increments the focus counter every time the focus changes.
 */
export function registerFocusCounter(element: HTMLElement) {
  element.addEventListener('focusin', onFocusIn);
  element.addEventListener('focusout', onFocusOut);
}

/**
 * De-register the handler that increments the focus counter every time the focus changes.
 */
export function unregisterFocusCounter(element: HTMLElement) {
  element.removeEventListener('focusin', onFocusIn);
  element.removeEventListener('focusout', onFocusOut);
}

/**
 * Get the current focus count, which can be used to compare if the focus has changed controls
 * since the last time it was queried
 */
export function getFocusCount(): FocusCount {
  return focusId as FocusCount;
}

let focusId = 0;

function onFocusIn() {
  focusId++;
}

function onFocusOut() {
  focusId++;
}
