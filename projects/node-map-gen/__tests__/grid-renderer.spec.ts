jest.doMock('../src/random');

// tslint:disable no-import-side-effect no-implicit-dependencies
import 'jest-extended';
// tslint:enable no-import-side-effect no-implicit-dependencies
import * as os from 'os';
import {
  compose,
  converge,
  equals,
  length,
  partition,
  split,
  takeLastWhile,
  takeWhile,
  test as testRE,
} from 'ramda';
// tslint:disable-next-line: no-implicit-dependencies
import * as stripAnsi from 'strip-ansi';
import { Grid } from '../src/grid';
import { render } from '../src/grid-renderer';
import '../src/strip-ansi.d';

const toLines: (str: string) => string[] = split(os.EOL);

const countSubstr = (str: string) =>
  compose(
    x => x - 1,
    length,
    split(str),
  );

describe('Examples', () => {
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
      "+---+---+---+
      | 0   0   0 |
      +---+---+---+
      | 1   1   1 |
      +---+---+---+
      | 2   2   2 |
      +---+---+---+
      
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
      "+---+---+---+---+---+
      | 0   0   0   0 | 2 |
      +---+---+---+---    |
      | 1   1   1 | 2   2 |
      +---+---+---+---+---+
      | 4   4 | 5   5 | 3 |
      +           +---    |
      | 4   4 | 5 | 3   3 |
      +---+---    +---+---+
      | 5   5   5   5   5 |
      +---+---+---+---+---+
      
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
])('Random grids to render', (width, height, roomCount) => {
  let grid: Grid;
  beforeAll(() => {
    grid = Grid.CREATE({
      width,
      height,
      roomCount,
    });
    expect(grid).toBeDefined();
  });

  test('render', () => {
    const display = render(grid);
    expect(display).toMatchSnapshot();

    // display format
    // map line 1
    // map line 2
    // <empty line>
    // room line 2
    // room line 2

    const [mapLines, roomLines] = compose<
      string,
      string,
      string[],
      [string[], string[]]
    >(
      converge((a, b) => [a, b], [
        takeWhile<string>(Boolean),
        takeLastWhile<string>(Boolean),
      ]),
      toLines,
      stripAnsi,
    )(display); // split on empty line

    // all map-lines have the same length
    const targetLength = mapLines[0].length;
    for (const line of mapLines) {
      expect(line).toHaveLength(targetLength);
    }

    const [rooms, walls] = partition(testRE(/\d/), mapLines);

    const hWalls = rooms.map(countSubstr('|'));
    expect(hWalls).not.toSatisfyAll(equals(width + 1));

    const vWalls = walls.map(countSubstr('+'));
    expect(hWalls).not.toSatisfyAll(equals(height + 1));

    // room line regexp check
    expect(roomLines).toSatisfyAll(testRE(/room \d+ size=\d+ cells=(\d+\,?)+/));
  });
});
