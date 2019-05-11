import { natural } from '@src/utils';

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
    [undefined, NaN],
  ])('converts %s to natural number %s', (n, expected) => {
    expect(natural(n)).toBe(expected);
  });
});
