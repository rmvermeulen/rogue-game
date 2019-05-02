jest.doMock('../src/random');

import { compose, groupBy, identity, length, map, tap } from 'ramda';
import { generate, weightedPick } from '../src/utils';

describe('simple weighted pick', () => {
  it('picks an earlier element more often than any later element', () => {
    const ascendingList = generate(20, identity);
    const picks = generate(100, () => weightedPick(ascendingList));
    expect(
      compose(
        map(length),
        groupBy(String),
      )(picks),
    ).toMatchInlineSnapshot(`
            Object {
              "0": 53,
              "1": 22,
              "10": 1,
              "11": 1,
              "2": 10,
              "3": 6,
              "4": 3,
              "5": 3,
              "6": 1,
            }
        `);
  });
  it('picks an earlier element more often than any later element 2', () => {
    const ascendingList = generate(20, identity);
    const picks = generate(100, () => weightedPick(ascendingList));
    expect(
      compose(
        map(length),
        groupBy(String),
      )(picks),
    ).toMatchInlineSnapshot(`
      Object {
        "0": 48,
        "1": 25,
        "2": 16,
        "3": 5,
        "4": 2,
        "5": 2,
        "6": 2,
      }
    `);
  });
});
