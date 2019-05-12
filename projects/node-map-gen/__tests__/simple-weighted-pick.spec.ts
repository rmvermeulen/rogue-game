import { generate, weightedPick } from '@src/utils';
import { compose, groupBy, identity, length, map } from 'ramda';

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
        "0": 41,
        "1": 34,
        "11": 1,
        "2": 15,
        "3": 2,
        "4": 5,
        "6": 1,
        "7": 1,
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
        "0": 50,
        "1": 23,
        "2": 13,
        "3": 10,
        "4": 1,
        "5": 2,
        "6": 1,
      }
    `);
  });
});
