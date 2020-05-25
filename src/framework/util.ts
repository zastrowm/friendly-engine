/**
 * @file
 * Contains a set of utility methods that don't really otherwise have a grouping
 */

/**
 * Generates a human-readable GUID
 *
 * Source: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
export function generateGuid(): UniqueId {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

export interface UniqueId {
  ___notreal___: string;
}

/**
 * A promise which can be cancelled
 */
interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void;
}

/**
 * Returns a promise that completes at some point in the future.  It resolves to
 * true if the promise ran to completion after the timer elapsed; it resolves to
 * false if the promise timer was cancelled.
 * @param timeInMs the time in milliseconds to delay
 */
export function delay(timeInMs: number): CancellablePromise<boolean> {
  let cancelCallback: () => void;

  var promise = new Promise<boolean>(function (resolve) {
    let timerId = 0;

    timerId = window.setTimeout(function () {
      if (timerId != 0) {
        resolve(true);
        timerId = 0;
      }
    }, timeInMs);

    cancelCallback = function () {
      window.clearTimeout(timerId);

      if (timerId != 0) {
        resolve(false);
        timerId = 0;
      }
    };
  });

  let cancellable = promise as CancellablePromise<boolean>;
  cancellable.cancel = cancelCallback;
  return cancellable;
}

/**
 * Adds a one time event listener for the given element
 * @param element the element to which the one-time event should be added
 * @param eventName the name of the event listener that resolves the promise
 * @returns a promise that resolves when the event is fired
 */
export function addEventListenerAsync<TData = any>(element: HTMLElement, eventName: string): Promise<TData> {
  return new Promise<TData>(function (resolve) {
    element.addEventListener(eventName, function (evtData: any) {
      resolve(evtData);
    });
  });
}

/** Typescript compiler helper to make typescript know that the value is of type T **/
export function assume<T>(value: any): asserts value is T {}

/**
 * Require all properties, even optional ones - for better type safetey
 */
export type RequireAllProperties<TType> = {
  [P in keyof TType]-?: TType[P];
};
