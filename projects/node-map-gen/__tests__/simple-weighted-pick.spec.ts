import { compose, groupBy, identity, length, map } from 'ramda';
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
        "0": 45,
        "1": 26,
        "2": 13,
        "3": 12,
        "4": 3,
        "8": 1,
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
        "0": 49,
        "1": 23,
        "2": 15,
        "3": 8,
        "4": 2,
        "5": 1,
        "8": 1,
        "9": 1,
      }
    `);
  });
});
