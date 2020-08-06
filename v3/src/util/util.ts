/** Typescript compiler helper to make typescript know that the value is of type T **/
export function assume<T>(value: any): asserts value is T {}

/** Typescript type to remove readonly **/
export type Writeable<T> = {
  -readonly [P in keyof T]: T[P]
};

/** Remove any readonly attributes on the properties of the given type */
export function asWritable<T>(value: T): Writeable<T> {
  return value;
}
