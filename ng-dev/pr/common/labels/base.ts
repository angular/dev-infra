export const createTypedObject =
  <T>() =>
  <O extends Record<PropertyKey, T>>(v: O) =>
    v;

export interface Label {
  /* The label string. */
  name: string;
  /* The label description. */
  description: string;
  /* The hexadecimal color code for the label, without the leading */
  color?: string;
}
