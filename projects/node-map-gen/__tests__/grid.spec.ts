import {
  filter,
  flip,
  length,
  map,
  pipe,
  pluck,
  prop,
  propEq,
  splitWhen,
  times,
  uniq,
} from 'ramda';
import stripAnsi from 'strip-ansi';
import { Grid, ICell, IGridOptions, IRoom } from '../src/grid';

const doN = (flip(times) as unknown) as <T = any>(
  n: number,
  fn: (n: number) => T,
) => T[];

describe.each([
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
])('grid class', ({ width, height, rooms }: IGridOptions) => {
  let grid: Grid;

  beforeAll(() => {
    grid = Grid.create({ width, height, rooms });
  });

  it('is a grid', () => {
    expect(grid).toBeDefined();
    expect(grid).toMatchObject({ width, height });
    expect(grid.cells).toHaveLength(width * height);
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
    const roomList: IRoom[] = doN(rooms, rid => grid.findRoomById(rid));
    for (const room of roomList) {
      expect(room).toMatchObject({
        cells: expect.any(Array),
        size: expect.any(Number),
      });
    }
  });

  it('can find cells by position', () => {
    doN(width, x => {
      doN(height, y => {
        expect(grid.cellAt(x, y)).toMatchObject({ x, y });
      });
    });
  });

  it('can be displayed in the cli', () => {
    const display = grid.display();
    console.log(display);
    expect(typeof display).toBe('string');
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

  it('does not have isolated cells', () => {
    const { cells } = grid;
    for (const cell of cells) {
      const neighborRooms: number[] = pipe(
        filter(
          ({ x, y }: ICell) =>
            Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1,
        ),
        (pluck as any)('room'),
        uniq,
      )(cells);
      expect(neighborRooms).toContain(cell.room);
    }
  });
});
