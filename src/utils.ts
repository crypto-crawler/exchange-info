// eslint-disable-next-line import/prefer-default-export
export function calcPrecision(numberStr: string): number {
  return -Math.log10(parseFloat(numberStr));
}
