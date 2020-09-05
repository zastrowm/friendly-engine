
// see https://jestjs.io/docs/en/expect#expectextendmatchers
declare namespace jest {
  interface Matchers<R, T = {}> {
    toBeWithMessage<E = any>(value: E, message: string): R;
    toEqualWithMessage<E = any>(value: E, message: string): R;
  }
}
