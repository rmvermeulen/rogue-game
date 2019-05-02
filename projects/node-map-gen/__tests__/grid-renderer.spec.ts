jest.doMock('../src/random');

// tslint:disable no-import-side-effect no-implicit-dependencies
import 'jest-extended';
import '../src/strip-ansi.d';
// tslint:enable no-import-side-effect no-implicit-dependencies

import * as os from 'os';
import { compose, length, not, split, splitWhen, uniqBy } from 'ramda';
// tslint:disable-next-line: no-implicit-dependencies
import * as stripAnsi from 'strip-ansi';
import { Grid } from '../src/grid';
import { render, renderSimple } from '../src/grid-renderer';

const toLines: (str: string) => string[] = split(os.EOL);

describe.each([[5, 5, 16], [10, 5, 16], [5, 10, 16], [10, 10, 16]].slice(0, 1))(
  'Grid renderer',
  (width, height, roomCount) => {
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
      expect(display).toMatchSnapshot();
      expect(stripAnsi(display)).toMatchSnapshot();

      // all map-lines have the same length
      const [mapLines /*[, roomLines]*/] = compose(
        // split on empty line
        splitWhen(not),
        toLines,
        stripAnsi,
      )(display);
      expect(uniqBy(length, mapLines)).toHaveLength(1);
    });
  },
);
