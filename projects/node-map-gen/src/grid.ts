import chalk from 'chalk';
import * as os from 'os';
import {
  allPass,
  equals,
  filter,
  find,
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
  trim,
  unary,
  uniq,
  when,
  where,
  whereEq,
} from 'ramda';

// tslint:disable-next-line: no-any
const shuffle = <T extends any[]>([...input]: T): T => {
  const randomized = [] as T;
  while (input.length > 0) {
    const i = Math.floor(Math.random() * input.length);
    randomized.push(...input.splice(i, 1));
  }

  return randomized;
};

const weightedPick = <T>([item, ...rest]: T[]): T =>
  rest.length === 0 ? item : Math.random() > 0.5 ? item : weightedPick(rest);

const colors = (() => {
  const src = [
    chalk.red,
    chalk.redBright,
    chalk.green,
    chalk.greenBright,
    chalk.blue,
    chalk.blueBright,
    chalk.yellow,
    chalk.yellowBright,
    chalk.magenta,
    chalk.magentaBright,
    chalk.cyan,
    chalk.cyanBright,
  ];

  return shuffle(src);
})();

export interface IGridOptions {
  width: number;
  height: number;
  rooms: number;
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
  private constructor({ width, height, rooms }: IGridOptions) {
    this.width = width;
    this.height = height;

    const avgRoomSize = Math.max(0, Math.floor((width * height) / rooms) - 1);
    const roomIds = times(n => repeat(n, avgRoomSize), rooms);
    let remainder = width * height - rooms * avgRoomSize;
    while (remainder > 0) {
      const r = Math.floor(Math.random() * rooms);
      roomIds[r].push(r);
      remainder -= 1;
    }

    const pool: number[] = shuffle(flatten(roomIds));

    const popSpecific = (n: number): number | undefined => {
      const i = pool.findIndex(equals(n));
      if (i === -1) {
        return undefined;
      }
      const [popped] = pool.splice(i, 1);

      return popped;
    };

    this.cells = pipe(
      map((id: number) => ({
        id,
        x: id % width,
        y: Math.floor(id / width),
        room: -1,
      })),
      tap((cells: ICell[]) => {
        cells.forEach((cell: ICell) => {
          const trySame = weightedPick([true, true, false]);
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
  public static CREATE(options: IGridOptions) {
    return new Grid(options);
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

  /** render the grid into a string
   * example output:
   * +---+---+---+---+---+
   * | 1   1 | 2   2 | 0 |
   * +---+   +   +   +---+
   * | 0 | 1 | 2   2 | 1 |
   * +   +   +   +   +---+
   * | 0 | 1 | 2   2 | 0 |
   * +   +   +   +   +   +
   * | 0 | 1 | 2   2 | 0 |
   * +   +---+---+---+---+
   * | 0   0   0 | 1   1 |
   * +---+---+---+---+---+
   *
   * room 0 size=9 cells=4,5,10,14,15,19,20,21,22
   * room 1 size=8 cells=0,1,6,9,11,16,23,24
   * room 2 size=8 cells=2,3,7,8,12,13,17,18
   */
  public display(): string {
    const header = `+${repeat('---+', this.width).join('')}`;
    const lines = [header];
    for (let y = 0; y < this.height; y += 1) {
      let line = '| ';
      let separatorLine = '';
      for (let x = 0; x < this.width; x += 1) {
        const cell = this.cellAt(x, y);
        const east = this.cellAt(x + 1, y);
        const south = this.cellAt(x, y + 1);

        const colorize = colors[cell.room % colors.length];
        const roomStr = colorize(String(cell.room));

        const isSameRoom = when(Boolean, propEq('room', cell.room));
        line += `${roomStr} ${isSameRoom(east) ? '  ' : '| '}`;
        separatorLine += isSameRoom(south) ? '+   ' : '+---';
      }
      lines.push(line, `${separatorLine}+`);
    }

    const rooms = this.listRooms()
      .sort()
      .map(id => this.findRoomById(id))
      .filter(Boolean);

    if (rooms.length > 0) {
      lines.push('');
      lines.push(
        ...rooms.map(
          ({ id, size, cells }) => `room ${id} size=${size} cells=${cells}`,
        ),
      );
    }

    return lines.map(trim).join(os.EOL);
  }
}
