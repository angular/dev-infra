type UnionToIntersection<U> = (U extends unknown ? (union: U) => void : never) extends (
  intersection: infer I,
) => void
  ? I
  : never;

type AssertedType<A> = A extends AssertionFn<infer T> ? T : never;
type AllAssertedTypes<A extends readonly AssertionFn<unknown>[]> = {
  [K in keyof A]: AssertedType<A[K]>;
};
type ExtractValuesAsUnionFromObject<T> = T[keyof T & number];

export type Assertions<A extends readonly AssertionFn<unknown>[]> = UnionToIntersection<
  ExtractValuesAsUnionFromObject<AllAssertedTypes<A>>
>;
export type AssertionFn<T> = (value: Partial<T>) => asserts value is T;
export type MultipleAssertions = AssertionFn<unknown>[];
