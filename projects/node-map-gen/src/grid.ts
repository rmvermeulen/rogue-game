import chalk from 'chalk';
import * as os from 'os';
import {
  allPass,
  equals,
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
  filter,
  trim,
  where,
  whereEq,
  uniq,
} from 'ramda';

const shuffle = ([...input]) => {
  const randomized = [];
  while (input.length) {
    const i = Math.floor(Math.random() * input.length);
    randomized.push(...input.splice(i, 1));
  }

  return randomized;
};

// weighted pick
const wt = <T>([item, ...rest]: T[]): T =>
  rest.length === 0 ? item : Math.random() > 0.5 ? item : wt(rest);

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
    while (remainder) {
      const r = Math.floor(Math.random() * rooms);
      roomIds[r].push(r);
      --remainder;
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
      tap(cells => {
        cells.forEach(cell => {
          const trySame = wt([true, true, false]);
          let room: number;
          if (trySame) {
            const neighbors = cells
              // has valid room, which still has entries
              .filter(
                where({
                  room: allPass([lte(0), r => pool.includes(r)]),
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
  public static create(options: IGridOptions) {
    return new Grid(options);
  }

  public cellAt(x: number, y: number): ICell | undefined {
    return this.cells.find(whereEq({ x, y }));
  }

  public row(y: number): ICell[] {
    return this.cells.filter(whereEq({ y }));
  }

  public column(x: number): ICell[] {
    return this.cells.filter(whereEq({ x }));
  }

  public listRooms(): number[] {
    return pipe<ICell[], number[], number[], number[]>(
      pluck('room'),
      uniq,
      filter(lte(0)),
    )(this.cells);
  }

  public findRoomById(id: IRoom['id']): IRoom | undefined {
    const cells = this.cells.filter(propEq('room', id));

    return cells.length
      ? {
          id,
          size: cells.length,
          cells: pluck('id', cells),
        }
      : undefined;
  }

  public display(): string {
    const header = `+${repeat('---+', this.width).join('')}`;
    const lines = [header];
    for (let y = 0; y < this.height; ++y) {
      let line = '| ';
      let sep = '';
      for (let x = 0; x < this.width; ++x) {
        const cell = this.cellAt(x, y);
        const east = this.cellAt(x + 1, y);
        const south = this.cellAt(x, y + 1);

        const roomStr = colors[cell.room % colors.length](String(cell.room));

        line += `${roomStr} ${east && east.room === cell.room ? '  ' : '| '}`;
        sep += south && south.room === cell.room ? '+   ' : '+---';
      }
      lines.push(line, sep + '+');
    }

    const rooms = this.listRooms()
      .sort()
      .map(id => this.findRoomById(id))
      .filter(Boolean);

    if (rooms.length) {
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
