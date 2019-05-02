jest.doMock('../src/random');

import { contains, filter, pipe, pluck } from 'ramda';
import { generateCells, INaiveOptions } from '../src/generators/naive';
import { Grid, ICell } from '../src/grid';
import { render } from '../src/grid-renderer';
import { random } from '../src/random';
import { generate } from '../src/utils';

describe.each`
  width | height | roomCount
  ${5}  | ${5}   | ${4}
  ${5}  | ${8}   | ${8}
  ${8}  | ${5}   | ${12}
  ${8}  | ${8}   | ${20}
`(
  'naively generated grid (w $width h $height r $roomCount)',
  ({ width, height, roomCount }: INaiveOptions) => {
    let cells: ICell[];
    beforeAll(() => {
      // change the rng
      generate(1, () => random.natural());

      cells = generateCells({
        width,
        height,
        roomCount,
      });
    });

    it('is probably a grid', () => {
      expect(cells).toBeDefined();
      expect(cells).toHaveLength(width * height);
    });

    it.skip('does not have too many isolated cells', () => {
      const isolatedCells = cells.reduce((total, cell) => {
        const isPartOfRoom = pipe(
          filter(
            ({ x, y }: ICell) =>
              Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1,
          ),
          pluck('roomId'),
          contains(cell.roomId),
        )(cells);

        return total + (isPartOfRoom ? 0 : 1);
      }, 0);
      expect(isolatedCells / cells.length).toBeLessThan(0.25);
    });

    it('looks fine', () => {
      const grid = Object.assign(Object.create(Grid.prototype) as Grid, {
        width,
        height,
        cells,
      });

      expect(render(grid, false)).toMatchSnapshot();
    });
  },
);
