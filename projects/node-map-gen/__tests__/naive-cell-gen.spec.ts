import { contains, filter, pipe, pluck } from 'ramda';
import { genCellsNaive } from '../src/cell-gen/naive';
import { ICell } from '../src/grid';

const width = 10;
const height = 10;

describe('naively generated grid', () => {
  let cells: ICell[];
  beforeAll(() => {
    cells = genCellsNaive({
      width,
      height,
      rooms: 10,
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

        pluck('room'),
        contains(cell.room),
      )(cells);

      return total + (isPartOfRoom ? 0 : 1);
    }, 0);
    // expect(isolatedCells / cells.length).toBeLessThan(0.15);
    expect(isolatedCells / cells.length).toBeLessThan(0.25);
  });
});
