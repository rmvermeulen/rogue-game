import {
  allPass,
  clone,
  equals,
  filter,
  flatten,
  lte,
  map,
  pipe,
  pluck,
  propEq,
  range,
  repeat,
  tap,
  times,
  uniq,
  where,
  whereEq,
} from 'ramda';
import { random } from './random';

export interface IGridOptions extends Partial<Grid> {
  width: number;
  height: number;
  rooms: number;
  cells?: ICell[];
}

export interface ICell {
  id: number;
  x: number;
  y: number;
  room: number;
}

export interface IRoom {
  id: number;
  size: number;
  cells: ICell['id'][];
}

// represents a grid of cells
export class Grid {
  public readonly width: number;
  public readonly height: number;
  public readonly cells: ICell[];
  private readonly rooms: number;
  private constructor(options: IGridOptions) {
    const { width, height, rooms, cells } = options;
    const isClone = options instanceof Grid;
    console.assert(
      isClone === Boolean(cells),
      'Invalid Grid.CLONE: incomplete source',
    );

    this.width = width;
    this.height = height;
    this.rooms = rooms;
    this.cells = isClone ? clone(cells) : this.generateCells();
  }
  public static CREATE(options: IGridOptions) {
    return new Grid({ ...options });
  }

  public static CLONE(grid: Grid) {
    // tslint:disable-next-line: no-any
    return new Grid(grid as any);
  }
  public clone() {
    return Grid.CLONE(this);
  }

  public cellAt(x: number, y: number): undefined | ICell {
    // tslint:disable-next-line: no-any no-unsafe-any
    return this.cells.find((whereEq as any)({ x, y }));
  }

  // find all cells belonging to the given row
  public row(y: number): ICell[] {
    // tslint:disable-next-line: no-any no-unsafe-any
    return this.cells.filter((whereEq as any)({ y }));
  }

  // find all cells belonging to the given column
  public column(x: number): ICell[] {
    // tslint:disable-next-line: no-any no-unsafe-any
    return this.cells.filter((whereEq as any)({ x }));
  }

  // list the unique room-ids in the grid
  public listRooms(): number[] {
    return pipe<ICell[], number[], number[], number[]>(
      pluck('room'),
      uniq,
      filter(lte(0)),
    )(this.cells);
  }

  // get information on a specific room
  public findRoomById(id: IRoom['id']): IRoom | undefined {
    const cells = this.cells.filter(propEq('room', id));

    return cells.length > 0
      ? {
          id,
          size: cells.length,
          cells: pluck('id', cells),
        }
      : undefined;
  }

  private generateCells() {
    const { width, height, rooms } = this;
    const avgRoomSize = Math.max(0, Math.floor((width * height) / rooms) - 1);
    const roomIds = times(n => repeat(n, avgRoomSize), rooms);
    let remainder = width * height - rooms * avgRoomSize;
    while (remainder > 0) {
      const id = random.natural({ max: rooms - 1 });
      roomIds[id].push(id);
      remainder -= 1;
    }

    const pool: number[] = random.shuffle(flatten(roomIds));

    const popSpecific = (n: number): number | undefined => {
      const i = pool.findIndex(equals(n));
      if (i === -1) {
        return undefined;
      }
      const [popped] = pool.splice(i, 1);

      return popped;
    };

    return pipe(
      map((id: number) => ({
        id,
        x: id % width,
        y: Math.floor(id / width),
        room: -1,
      })),
      tap((cells: ICell[]) => {
        cells.forEach((cell: ICell) => {
          const trySame = random.weighted([true, false], [15, 1]);
          let room: number;
          if (trySame) {
            // has valid room, which still has entries
            const neighbors = cells
              .filter(
                where({
                  room: allPass([
                    lte(0),
                    (r: ICell['room']) => pool.includes(r),
                  ]),
                }),
              )
              // manhattan distance
              .filter(
                ({ x, y }: typeof cell) =>
                  Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1,
              );
            for (const n of neighbors) {
              const popped = popSpecific(n.room);
              if (popped !== undefined) {
                room = popped;
                break;
              }
            }
          }
          if (room === undefined) {
            room = pool.pop();
          }
          // update cell in-place
          cell.room = room;
        });
      }),
    )(range(0, width * height));
  }
}
