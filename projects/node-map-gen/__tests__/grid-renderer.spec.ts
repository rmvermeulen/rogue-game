// tslint:disable no-import-side-effect no-implicit-dependencies
import 'jest-extended';
import '../src/strip-ansi.d';
// tslint:enable no-import-side-effect no-implicit-dependencies

import * as os from 'os';
import {
  compose,
  converge,
  length,
  split,
  takeLastWhile,
  takeWhile,
  test as testRE,
  uniqBy,
} from 'ramda';
// tslint:disable-next-line: no-implicit-dependencies
import * as stripAnsi from 'strip-ansi';
import { Grid } from '../src/grid';
import { render, renderSimple } from '../src/grid-renderer';

const toLines: (str: string) => string[] = split(os.EOL);

// const countSubstr = (str: string) =>
//   compose(
//     x => x - 1,
//     length,
//     split(str),
//   );

describe.each(
  [
    [5, 5, 4],
    [10, 5, 4],
    [5, 10, 4],
    [10, 10, 4],
    [5, 5, 16],
    [10, 5, 16],
    [5, 10, 16],
    [10, 10, 16],
  ].slice(0, 1),
)('Grid renderer', (width, height, roomCount) => {
  let grid: Grid;
  beforeAll(() => {
    grid = Grid.CREATE({
      width,
      height,
      roomCount,
    });
    expect(grid).toBeDefined();
  });

  test('simple render', () => {
    const display = renderSimple(grid);
    expect(display).toBeString();
    expect(display).toMatchSnapshot();
    expect(stripAnsi(display)).toMatchSnapshot();
    // all lines have the same length
    expect(
      compose(
        uniqBy(length),
        toLines,
        stripAnsi as (s: string) => string,
      )(display),
    ).toHaveLength(1);
  });

  test('fancy render', () => {
    const display = render(grid);
    expect(display).toBeString();
    // expect(display).toMatchSnapshot();
    // expect(stripAnsi(display)).toMatchSnapshot();

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
    expect(uniqBy(length, mapLines)).toHaveLength(1);

    // const [rooms, walls] = partition(testRE(/\d/), mapLines);

    // const hWalls = rooms.map(countSubstr('|'));
    // expect(hWalls).not.toSatisfyAll(equals(width + 1));

    // const vWalls = walls.map(countSubstr('+'));
    // expect(hWalls).not.toSatisfyAll(equals(height + 1));

    // room line regexp check
    expect(roomLines).toSatisfyAll(testRE(/room \d+ size=\d+ cells=(\d+\,?)+/));
  });
});
