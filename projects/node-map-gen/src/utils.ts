import { flip, times } from 'ramda';
import { random } from './random';

// tslint:disable-next-line: no-any
export const generate = (flip(times) as unknown) as <T = any>(
  n: number,
  fn: (n: number) => T,
) => T[];

export const weightedPick = <T>([item, ...rest]: T[]): T =>
  rest.length === 0 ? item : random.bool() ? item : weightedPick(rest);
