/** Create an html element attribute string. */
export function buildAttr(name: string, value: boolean | number | string | undefined): string {
  return value ? ` ${name}="${value}` : '';
}
