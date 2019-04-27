import { flip, length, map, pipe, propEq, splitWhen, times, uniq } from 'ramda';
import stripAnsi from 'strip-ansi';
import { Grid, IGridOptions, IRoom } from '../src/grid';

const doN = (flip(times) as unknown) as <T = any>(
  n: number,
  fn: (n: number) => T,
) => T[];

describe.each([
  {
    width: 5,
    height: 5,
    rooms: 4,
  },
  {
    width: 4,
    height: 7,
    rooms: 4,
  },
  // {
  //   width: 8,
  //   height: 6,
  //   rooms: 12,
  // },
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
    const [mapLines, [, ...roomLines]] = splitWhen(propEq('length', 0), lines);

    expect(mapLines).toHaveLength(1 + height * 2);
    expect(roomLines).toHaveLength(rooms);

    expect(
      pipe(
        map(length),
        uniq,
      )(mapLines as any),
    ).toHaveLength(1);
  });
});
