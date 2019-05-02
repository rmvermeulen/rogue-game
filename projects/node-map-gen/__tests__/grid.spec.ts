// tslint:disable no-import-side-effect no-implicit-dependencies

jest.mock('../src/random');

import 'jest-extended';
import { contains, filter, pipe, pluck, zip } from 'ramda';
import { Grid, ICell, IRoom } from '../src/grid';
import { generate } from '../src/utils';

describe.each(
  [
    [5, 5, 2],
    [5, 5, 12],
    [5, 5, 3],
    [5, 5, 4],
    [4, 7, 6],
    [12, 12, 10],
    [12, 12, 8],
    [12, 12, 4],
  ].slice(0, 2),
)(
  'Create grid from w:%i h:%i r:%i',
  // tslint:disable-next-line: max-func-body-length
  (width, height, roomCount) => {
    let grid: Grid;

    beforeAll(() => {
      grid = Grid.CREATE({ width, height, roomCount });
    });
    it('is a grid', () => {
      expect(grid).toBeDefined();
      expect(grid).toBeInstanceOf(Grid);
      expect(grid).toMatchObject({ width, height });
      expect(grid.cells).toHaveLength(width * height);
    });

    it('can find rows', () => {
      expect(grid.row(0)).toHaveLength(width);
      expect(grid.row(height)).toHaveLength(0);
    });

    it('can find columns', () => {
      let total = 0;
      generate(width, x => {
        const column = grid.column(x);
        expect(column).toHaveLength(height);
        total += height;
      });
      expect(total).toEqual(grid.cells.length);
      expect(grid.column(width + 1)).toHaveLength(0);
      expect(grid.column(width)).toHaveLength(0);
    });

    it('can list the unique room ids', () => {
      expect(grid.listRooms()).toHaveLength(roomCount);
    });

    it('can find information on rooms', () => {
      const roomList: IRoom[] = generate(roomCount, rid =>
        grid.findRoomById(rid),
      );
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

    describe('static methods', () => {
      describe('static sort', () => {
        let sorted: ICell[];
        beforeAll(() => {
          sorted = Grid.SORT(grid.cells);
        });
        it('sorts correctly', () => {
          let prev: ICell | undefined;
          for (const cell of grid.cells) {
            if (prev === undefined) {
              prev = cell;
              continue;
            }
            expect(cell.x).toBeOneOf([0, prev.x + 1]);
            expect(cell.y).toBeOneOf([prev.y, prev.y + 1]);

            prev = cell;
          }
        });
        it('grid was already sorted', () => {
          expect(sorted).toStrictEqual(grid.cells);
        });
      });
      test('static clone', () => {
        const clone = grid.clone();
        expect(clone).toBeInstanceOf(Grid);
        expect(clone).not.toBe(grid);
        zip(grid.cells, clone.cells).forEach(([original, cloned]) => {
          expect(original).not.toBe(cloned);
          expect(original).toStrictEqual(cloned);
        });
      });
    });
  },
);
