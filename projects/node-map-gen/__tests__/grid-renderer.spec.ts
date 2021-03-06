// tslint:disable no-import-side-effect no-implicit-dependencies
import { createRNG } from '@src/create-rng';
import { Grid } from '@src/grid';
import { renderGrid } from '@src/render-grid';
import '@src/strip-ansi.d';
import 'jest-extended';
import * as os from 'os';
import {
  compose,
  either,
  equals,
  groupBy,
  last,
  length,
  partition,
  reject,
  split,
  test as testRE,
} from 'ramda';
import * as stripAnsi from 'strip-ansi';

const toLines: (str: string) => string[] = split(os.EOL);

const countSubstr = (substr: string) =>
  compose(
    x => x - 1,
    length,
    split(substr),
  );

describe('Inline examples', () => {
  const renderCells = (w: number, h: number, roomIds: number[], options?: {}) =>
    renderGrid(
      Grid.FROM_CELLS(
        w,
        h,
        roomIds.map((roomId, id) => ({
          id,
          roomId,
          x: id % w,
          y: Math.floor(id / h),
        })),
      ),
      { mapOnly: true, ...options },
    );

  test('3x3 grid', () => {
    // prettier-ignore
    const roomIds = [
      0, 0, 0,
      1, 1, 1,
      2, 2, 2
    ]
    expect(renderCells(3, 3, roomIds)).toMatchInlineSnapshot(`
            "+-----------+
            | 0   0   0 |
            +-----------+
            | 1   1   1 |
            +-----------+
            | 2   2   2 |
            +-----------+"
        `);
  });

  test('3x3 grid, different padding', () => {
    // prettier-ignore
    const roomIds = [
      0, 0, 0,
      1, 1, 1,
      2, 2, 2
    ]
    expect(renderCells(3, 3, roomIds, { padding: '' })).toMatchInlineSnapshot(`
            "+-----+
            |0 0 0|
            +-----+
            |1 1 1|
            +-----+
            |2 2 2|
            +-----+"
        `);
  });

  test('5x5 grid', () => {
    // prettier-ignore
    const roomIds = [
      0, 0, 0, 0, 2,
      1, 1, 1, 2, 2,
      4, 4, 5, 5, 3,
      4, 4, 5, 3, 3,
      5, 5, 5, 5, 5,
    ]
    expect(renderCells(5, 5, roomIds)).toMatchInlineSnapshot(`
            "+---------------+---+
            | 0   0   0   0 | 2 |
            +-----------+---+   |
            | 1   1   1 | 2   2 |
            +-------+---+---+---+
            | 4   4 | 5   5 | 3 |
            |       |   +---+   |
            | 4   4 | 5 | 3   3 |
            +-------+   +-------+
            | 5   5   5   5   5 |
            +-------------------+"
        `);
  });
  test('5x5 grid, different padding', () => {
    // prettier-ignore
    const roomIds = [
      0, 0, 0, 0, 2,
      1, 1, 1, 2, 2,
      4, 4, 5, 5, 3,
      4, 4, 5, 3, 3,
      5, 5, 5, 5, 5,
    ]
    expect(renderCells(5, 5, roomIds, { padding: '-$-' }))
      .toMatchInlineSnapshot(`
      "+-------------------------------+-------+
      |-$-0-$- -$-0-$- -$-0-$- -$-0-$-|-$-2-$-|
      +-----------------------+-------+       |
      |-$-1-$- -$-1-$- -$-1-$-|-$-2-$- -$-2-$-|
      +---------------+-------+-------+-------+
      |-$-4-$- -$-4-$-|-$-5-$- -$-5-$-|-$-3-$-|
      |               |       +-------+       |
      |-$-4-$- -$-4-$-|-$-5-$-|-$-3-$- -$-3-$-|
      +---------------+       +---------------+
      |-$-5-$- -$-5-$- -$-5-$- -$-5-$- -$-5-$-|
      +---------------------------------------+"
    `);
  });
});

test('colors', () => {
  const grid = Grid.CREATE({
    width: 10,
    height: 10,
    roomCount: 20,
    rng: createRNG(200),
  });

  const plain = renderGrid(grid);
  const colored = renderGrid(grid, {});

  expect(plain).toBe(stripAnsi(colored));
});

describe.each([
  [5, 5, 4],
  [10, 5, 4],
  [5, 10, 4],
  [10, 10, 4],
  [5, 5, 16],
  [10, 5, 16],
  [5, 10, 16],
  [10, 10, 16],
])('Grid rendering', (width, height, roomCount) => {
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

  test('render', () => {
    const display = renderGrid(grid, {
      mapOnly: true,
    });
    expect(display).toMatchSnapshot();

    const plainDisplay = stripAnsi(display);
    expect(plainDisplay).toMatchSnapshot();

    // display format
    // map line 1
    // map line 2
    // <empty line>
    // room line 2
    // room line 2

    const mapLines = toLines(plainDisplay); // split on empty line

    expect(mapLines).toBeArray();

    expect(
      reject(
        compose(
          either(equals('|'), equals('+')),
          last,
        ),
        mapLines,
      ),
    ).toEqual([]);

    // all map-lines have the same length
    expect(groupBy(length, mapLines)).toSatisfy(
      (obj: {}) => Object.keys(obj).length === 1,
    );

    const [rooms, walls] = partition(testRE(/\d/), mapLines);

    const hWalls = rooms.map(countSubstr('|'));
    expect(hWalls).not.toSatisfyAll(equals(width + 1));

    const vWalls = walls.map(countSubstr('+'));
    expect(hWalls).not.toSatisfyAll(equals(height + 1));
  });
});
