jest.doMock('../src/random');

import { contains, filter, pipe, pluck } from 'ramda';

import { generateCells } from '../src/generators/naive';
import { Grid, ICell } from '../src/grid';
import { render } from '../src/grid-renderer';

describe.skip('naively generated grid', () => {
  const width = 10;
  const height = 10;
  let cells: ICell[];
  beforeAll(() => {
    cells = generateCells({
      width,
      height,
      roomCount: 8,
    });
  });

  it('is probably a grid', () => {
    expect(cells).toBeDefined();
    expect(cells).toHaveLength(width * height);
  });

  it('does not have too many isolated cells', () => {
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

    expect(render(grid, false)).toMatchInlineSnapshot(`
      "+---+---+---+---+---+---+---+---+---+---+
      | 0 | 4 | 6 | 1 | 1 | 3 | 1 | 6 | 2 | 4 |
      +---+---+---+---+---+---+---+---+---+---+
      | 7 | 0 | 2 | 6 | 0 | 3 | 4 | 6 | 7 | 2 |
      +---+---+---+---+---+---+---+---+---+---+
      | 1 | 5 | 6 | 0 | 1 | 7 | 4 | 3 | 0 | 1 |
      +---+---+---+---+---+---+---+---+---+---+
      | 0 | 2 | 5 | 2 | 5 | 4 | 5 | 7 | 6 | 1 |
      +---+---+---+---+---+---+---+---+---+---+
      | 2 | 1 | 7 | 5 | 4 | 4 | 3 | 3 | 2 | 4 |
      +---+---+---+---+---+---+---+---+---+---+
      | 3 | 0 | 1 | 6 | 2 | 6 | 6 | 3 | 1 | 4 |
      +---+---+---+---+---+---+---+---+---+---+
      | 5 | 7 | 0 | 2 | 3 | 1 | 1 | 2 | 6 | 6 |
      +---+---+---+---+---+---+---+---+---+---+
      | 4 | 3 | 0 | 7 | 4 | 5 | 3 | 7 | 7 | 7 |
      +---+---+---+---+---+---+---+---+---+---+
      | 4 | 4 | 5 | 7 | 2 | 0 | 1 | 0 | 0 | 7 |
      +---+---+---+---+---+---+---+---+---+---+
      | 6 | 5 | 1 | 4 | 2 | 5 | 7 | 5 | 3 | 7 |
      +---+---+---+---+---+---+---+---+---+---+"
    `);
  });
});
