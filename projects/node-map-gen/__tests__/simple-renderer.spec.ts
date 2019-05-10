// tslint:disable-next-line no-import-side-effect no-implicit-dependencies
import 'jest-extended';

import * as os from 'os';
import { compose, length, split, uniqBy } from 'ramda';
import * as stripAnsi from 'strip-ansi';
import { Grid } from '../src/grid';
import { createRNG } from '../src/random';
import { renderSimple } from '../src/render-grid';

const toLines: (str: string) => string[] = split(os.EOL);

describe.each([
  [5, 5, 4],
  [10, 5, 4],
  [5, 10, 4],
  [10, 10, 4],
  [5, 5, 16],
  [10, 5, 16],
  [5, 10, 16],
  [10, 10, 16],
])('Random grids to render', (width, height, roomCount) => {
  let grid: Grid;
  beforeAll(() => {
    grid = Grid.CREATE({
      width,
      height,
      roomCount,
      rng: createRNG(12345),
    });
    expect(grid).toBeDefined();
  });

  test('simple render', () => {
    const display = renderSimple(grid);
    expect(display).toBeString();

    expect(
      compose(
        uniqBy(length),
        toLines,
        stripAnsi,
      )(display),
    ).toHaveLength(1);
  });
});
