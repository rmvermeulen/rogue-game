jest.doMock('../src/random');

// tslint:disable no-import-side-effect no-implicit-dependencies
import 'jest-extended';
// tslint:enable no-import-side-effect no-implicit-dependencies
import * as os from 'os';
import { compose, length, split, uniqBy } from 'ramda';
// tslint:disable-next-line: no-implicit-dependencies
import * as stripAnsi from 'strip-ansi';
import { Grid } from '../src/grid';
import { renderSimple } from '../src/grid-renderer';
import '../src/strip-ansi.d';

const toLines: (str: string) => string[] = split(os.EOL);

const countSubstr = (str: string) =>
  compose(
    x => x - 1,
    length,
    split(str),
  );

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
