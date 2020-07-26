/** Typescript compiler helper to make typescript know that the value is of type T **/
export function assume<T>(value: any): asserts value is T {}
