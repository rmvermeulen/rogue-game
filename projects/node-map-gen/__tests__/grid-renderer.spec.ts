// tslint:disable no-import-side-effect no-implicit-dependencies
import 'jest-extended';
import * as os from 'os';
import {
  compose,
  converge,
  either,
  equals,
  groupBy,
  last,
  length,
  partition,
  reject,
  split,
  takeLastWhile,
  takeWhile,
  test as testRE,
} from 'ramda';
import * as stripAnsi from 'strip-ansi';
import { Grid } from '../src/grid';
import { render } from '../src/grid-renderer';
import { createRNG } from '../src/random';
import '../src/strip-ansi.d';

const toLines: (str: string) => string[] = split(os.EOL);

const countSubstr = (str: string) =>
  compose(
    x => x - 1,
    length,
    split(str),
  );

describe('Inline examples', () => {
  const renderCells = (w: number, h: number, roomIds: number[]) =>
    render(
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
      false,
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
      +-----------+

      room 0 size=3 cells=0,1,2
      room 1 size=3 cells=3,4,5
      room 2 size=3 cells=6,7,8"
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
      +-------------------+

      room 0 size=4 cells=0,1,2,3
      room 1 size=3 cells=5,6,7
      room 2 size=3 cells=4,8,9
      room 3 size=3 cells=14,18,19
      room 4 size=4 cells=10,11,15,16
      room 5 size=8 cells=12,13,17,20,21,22,23,24"
    `);
  });
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
    const display = render(grid);
    const plainDisplay = stripAnsi(display);
    expect(plainDisplay).toMatchSnapshot();
    expect(display).toMatchSnapshot();

    // display format
    // map line 1
    // map line 2
    // <empty line>
    // room line 2
    // room line 2

    const [mapLines, roomLines] = compose<
      string,
      string[],
      [string[], string[]]
    >(
      converge((a, b) => [a, b], [
        takeWhile<string>(Boolean),
        takeLastWhile<string>(Boolean),
      ]),
      toLines,
    )(plainDisplay); // split on empty line

    expect(mapLines).toBeArray();
    expect(roomLines).toBeArray();

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

    // room line regexp check
    expect(roomLines).toSatisfyAll(testRE(/room \d+ size=\d+ cells=(\d+\,?)+/));
  });
});
