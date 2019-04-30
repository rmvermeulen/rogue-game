jest.doMock('../src/random.ts');

import * as os from 'os';
import {
  compose,
  length,
  map,
  split,
  splitWhen,
  uniq,
  uniqBy,
  whereEq,
} from 'ramda';
// tslint:disable-next-line: no-implicit-dependencies
import * as stripAnsi from 'strip-ansi';
import { Grid } from '../src/grid';
import { render, renderSimple } from '../src/grid-renderer';

describe.each([[5, 5, 16], [10, 5, 16], [5, 10, 16], [10, 10, 16]].slice(0, 1))(
  'Grid renderer',
  (width, height, rooms) => {
    let grid;
    beforeAll(() => {
      grid = Grid.CREATE({
        width,
        height,
        rooms,
      });
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
          split(os.EOL),
          stripAnsi,
        )(display),
      ).toHaveLength(1);
    });

    test('fancy render', () => {
      const display = render(grid);
      expect(display).toBeString();
      expect(display).toMatchSnapshot();
      expect(stripAnsi(display)).toMatchSnapshot();

      // all map-lines have the same length
      const [mapLines, [, roomLines]] = compose(
        splitWhen(whereEq({ length: 0 })),
        split(os.EOL),
        stripAnsi,
      )(display);
      expect(uniqBy(length, mapLines)).toHaveLength(1);
    });
  },
);
