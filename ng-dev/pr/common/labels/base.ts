export const createTypedObject =
  <T>() =>
  <O extends Record<PropertyKey, T>>(v: O) =>
    v;

export interface Label {
  /* The label string. */
  label: string;
  /* The label description. */
  description: string;
}
