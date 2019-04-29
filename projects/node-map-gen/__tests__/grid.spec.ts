jest.mock('../src/random');

import {
  contains,
  filter,
  pipe,
  pluck,
  propEq,
  splitWhen,
  uniq,
  zip,
} from 'ramda';
import stripAnsi from 'strip-ansi';
import { Grid, ICell, IGridOptions, IRoom } from '../src/grid';
import { generate } from '../src/utils';

const gridData = [
  {
    width: 5,
    height: 5,
    rooms: 2,
  },
  {
    width: 5,
    height: 5,
    rooms: 3,
  },
  {
    width: 5,
    height: 5,
    rooms: 4,
  },
  {
    width: 4,
    height: 7,
    rooms: 6,
  },
  {
    width: 12,
    height: 12,
    rooms: 10,
  },
  {
    width: 12,
    height: 12,
    rooms: 8,
  },
  {
    width: 12,
    height: 12,
    rooms: 4,
  },
].sort((a, b) =>
  Math.sign(
    Math.abs(a.width * a.height + a.rooms) -
      Math.abs(b.width * b.height + b.rooms),
  ),
);

describe.each(gridData)(
  'grid from %o',
  ({ width, height, rooms }: IGridOptions) => {
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
      expect(isolatedCells / cells.length).toBeLessThan(0.075);
    });

    it('can be displayed in the cli', () => {
      const display = grid.display();

      expect(display).toMatchSnapshot();
      expect(stripAnsi(display)).toMatchSnapshot();
      const lines = display.split('\n').map(stripAnsi);
      const [mapLines, [, ...roomLines]] = splitWhen<string>(
        propEq('length', 0),
        lines,
      );

      expect(mapLines).toHaveLength(height * 2 + 1);
      expect(roomLines).toHaveLength(rooms);

      expect(
        pipe(
          pluck('length'),
          uniq,
        )(mapLines),
      ).toHaveLength(1);
    });
  },
);
