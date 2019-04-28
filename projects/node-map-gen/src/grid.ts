import chalk from 'chalk';
import * as os from 'os';
import {
  equals,
  filter,
  flatten,
  head,
  map,
  pipe,
  pluck,
  propEq,
  propSatisfies,
  range,
  repeat,
  times,
  trim,
  whereEq,
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
      if (!pool.includes(n)) {
        return undefined;
      }
      const i = pool.findIndex(equals(n));
      const [popped] = pool.splice(i, 1);
      return popped;
    };

    this.cells = pipe(
      map((id: number) => ({
        id,
        x: id % width,
        y: Math.floor(id / width),
      })),
      cells => {
        const { max, abs } = Math;
        return cells.map(cell => {
          const trySame = wt([true, true, false]);
          let room: number;
          if (trySame) {
            const neighbor: typeof cell | undefined = pipe<
              typeof cells,
              typeof cells,
              typeof cells,
              typeof cell
            >(
              filter(propSatisfies<number, typeof cell>(Boolean, 'room')),
              filter(({ x, y }: typeof cell) => {
                const maxDistance = max(abs(cell.x - x), abs(cell.y - y));
                return maxDistance === 1;
              }),
              head,
            )(cells);
            if (neighbor) {
              room = popSpecific(neighbor.id);
            }
          }
          if (room === undefined) {
            room = pool.pop();
          }
          return { ...cell, room };
        });
      },
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
    return Array.from(
      this.cells.reduce((ids, cell) => {
        ids.add(cell.room);

        return ids;
      }, new Set<number>()),
    );
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
