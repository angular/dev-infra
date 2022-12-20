export const createTypedObject =
  <T>() =>
  <O extends Record<PropertyKey, T>>(v: O) =>
    v;

export interface LabelParams {
  /* The label string. */
  name: string;
  /* The label description. */
  description: string;
  /* The hexadecimal color code for the label, without the leading */
  color?: string;
}

export class Label {
  /* The label string. */
  name: string;
  /* The label description. */
  description: string;
  /* The hexadecimal color code for the label, without the leading */
  color?: string;

  constructor({name, description, color}: LabelParams) {
    this.name = name;
    this.description = description;
    this.color = color;
  }
}
