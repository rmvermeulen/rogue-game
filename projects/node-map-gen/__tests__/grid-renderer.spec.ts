jest.doMock('../src/random.ts');

import * as os from 'os';

import { compose, length, map, split, uniq } from 'ramda';
import { Grid } from '../src/grid';
import { renderSimple } from '../src/grid-renderer';

describe('Grid renderer', () => {
  let grid;
  beforeAll(() => {
    grid = Grid.CREATE({
      width: 10,
      height: 10,
      rooms: 20,
    });
  });

  describe('simple render', () => {
    test('it renders', () => {
      const display = renderSimple(grid);
      expect(display).toBeString();
      expect(display).toMatchInlineSnapshot(`
        " 8  3  3  3  1  3  3 19 19 19
         8  8  8 13  1  1  1 19 19 19
         9  9  9 13 13 13 13 13  2  2
         9  9  5 13  0  0  0  0  2  2
         4  4  5  5  0  0 15 15  2 16
         4  4  5  5  6  6 15 15 16 16
        17 17  5 11  6  6  7  7 16 16
        17 17 17 11 11 11  7  7  7  7
        14 14 14 14 14 14 10 10 10 10
        18 18 18 18 18 12 12 12 12 12"
      `);
      // all lines have the same length
      expect(
        compose(
          uniq,
          map(length),
          split(os.EOL),
        )(display),
      ).toHaveLength(1);
    });
  });
});
