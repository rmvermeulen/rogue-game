import { flip, times } from 'ramda';

// tslint:disable-next-line: no-any
export const generate = (flip(times) as unknown) as <T = any>(
  n: number,
  fn: (n: number) => T,
) => T[];
