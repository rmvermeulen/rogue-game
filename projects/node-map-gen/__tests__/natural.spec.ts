import { natural } from '../src/utils';

describe('natural number helper', () => {
  it.each([
    [0, 1],
    [-1, 1],
    [-10, 10],
    [10, 10],
    [10.5, 10],
    [-10.5, 10],
    [-10.5, 10],
    [NaN, NaN],
  ])('converts %i to natural number %i', (n, expected) => {
    expect(natural(n)).toBe(expected);
  });
});
