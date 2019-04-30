// tslint:disable no-implicit-dependencies

jest.mock('../src/random');

import { contains, filter, pipe, pluck, zip } from 'ramda';
import { Grid, ICell, IRoom } from '../src/grid';
import { generate } from '../src/utils';

describe.each([
  [5, 5, 2],
  [5, 5, 12],
  [5, 5, 3],
  [5, 5, 4],
  [4, 7, 6],
  [12, 12, 10],
  [12, 12, 8],
  [12, 12, 4],
])('grid from %o', (width, height, rooms) => {
  let grid: Grid;

  beforeAll(() => {
    grid = Grid.CREATE({ width, height, rooms });
  });

  it('is a grid', () => {
    expect(grid).toBeDefined();
    expect(grid).toBeInstanceOf(Grid);
    expect(grid).toMatchObject({ width, height });
    expect(grid.cells).toHaveLength(width * height);
  });

  it('can be cloned', () => {
    const clone = grid.clone();
    expect(clone).toBeInstanceOf(Grid);
    expect(clone).not.toBe(grid);
    zip(grid.cells, clone.cells).forEach(([original, cloned]) => {
      expect(original).not.toBe(cloned);
      expect(original).toStrictEqual(cloned);
    });
  });

  it('can find rows', () => {
    expect(grid.row(0)).toHaveLength(width);
    expect(grid.row(height)).toHaveLength(0);
  });

  it('can find columns', () => {
    expect(grid.column(0)).toHaveLength(height);
    expect(grid.column(width)).toHaveLength(0);
  });

  it('can list the unique room ids', () => {
    expect(grid.listRooms()).toHaveLength(rooms);
  });

  it('can find information on rooms', () => {
    const roomList: IRoom[] = generate(rooms, rid => grid.findRoomById(rid));
    for (const room of roomList) {
      expect(room).toMatchObject({
        cells: expect.any(Array),
        size: expect.any(Number),
      });
    }
  });

  it('can find cells by position', () => {
    generate(width, x => {
      generate(height, y => {
        expect(grid.cellAt(x, y)).toMatchObject({ x, y });
      });
    });
  });

  it('does not have too many isolated cells', () => {
    const { cells } = grid;
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
