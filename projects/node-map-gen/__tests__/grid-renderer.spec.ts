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
        "10 10 10 10 10  1  1  8  8  8
        16 16 16  7  7  1 13  9  8  1
        16 16 15  7  7  7 13  9  9  9
        11 11 15 15 15 17 13  9  4  4
        12 11 11 11 11 17 13 13  4  4
        12 12 12 13 19 17 17 17  4  6
         3  3  3  3 19 19  3  3 19  6
         2  2  2  2 19 19  2  0  0  6
        18 18 18 18 18 18 14  0  0  6
         6  5  5  5  5  0 14 14 14 14"
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
