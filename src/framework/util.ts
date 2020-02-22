/**
 * @file
 * Contains a set of utility methods that don't really otherwise have a grouping
 */

/**
 * Generates a human-readable GUID
 *
 * Source: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
export function generateGuid() {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
  );
}
