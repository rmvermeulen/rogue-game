import * as sort from 'alphanum-sort';
import chalk from 'chalk';
import * as os from 'os';
import {
  addIndex,
  allPass,
  append,
  clone,
  defaultTo,
  equals,
  filter,
  flatten,
  identity,
  ifElse,
  is,
  join,
  last,
  lte,
  map,
  pipe,
  pluck,
  prepend,
  propEq,
  range,
  repeat,
  tap,
  times,
  trim,
  tryCatch,
  uniq,
  when,
  where,
  whereEq,
} from 'ramda';
import { random } from './random';
import { generate } from './utils';

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

  return random.shuffle(src);
})();

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

  /** render the grid into a string
   * example output:
   * +----+----+---+----+-----+
   * | 10   10 | 2   2  | 200 |
   * +----+    +   +    +-----+
   * | 0  | 10 | 2   2  | 10  |
   * +    +    +   +    +-----+
   * | 0  | 10 | 2   2  | 0   |
   * +    +    +   +    +     +
   * | 0  | 10 | 2   2  | 0   |
   * +    +----+---+----+-----+
   * | 0    0    0 | 10   10  |
   * +--- +----+---+----+-----+
   *
   * room 0 size=9 cells=4,5,10,14,15,19,20,21,22
   * room 1 size=8 cells=0,1,6,9,11,16,23,24
   * room 2 size=8 cells=2,3,7,8,12,13,17,18
   */
  // tslint:disable-next-line: max-func-body-length
  public display(useColors: boolean = true): string {
    const header = repeat('-', this.width);
    const lineFragments: (string | string[] | string[][])[] = [header];
    const columnNumberWidth: number[] = generate(this.width, () => 1);

    for (let y = 0; y < this.height; y += 1) {
      const line = [];
      const separatorLine = [];
      for (let x = 0; x < this.width; x += 1) {
        const cell = this.cellAt(x, y);
        const east = this.cellAt(x + 1, y);
        const south = this.cellAt(x, y + 1);

        // update the current column-width to the biggest in the column
        const roomStr = String(cell.room);
        columnNumberWidth[x] = Math.max(columnNumberWidth[x], roomStr.length);

        let str = roomStr;
        if (useColors) {
          const colorize = colors[cell.room % colors.length];
          str = colorize(roomStr);
        }

        const isSameRoom = when(Boolean, propEq('room', cell.room));
        line.push([
          str,
          (roomStr.length as unknown) as string /*cheat*/,
          isSameRoom(east) ? ' ' : '|',
        ]);
        separatorLine.push(isSameRoom(south) ? ' ' : '-');
      }
      lineFragments.push(line, separatorLine);
    }

    const rooms = sort(this.listRooms())
      .map(id => this.findRoomById(id))
      .filter(Boolean);

    if (rooms.length > 0) {
      lineFragments.push(
        [], // empty line to separate
        ...rooms.map(
          ({ id, size, cells }) => `room ${id} size=${size} cells=${cells}`,
        ),
      );
    }

    const mapIndexed = addIndex(map);
    const defaultTo1 = defaultTo(1);

    let previousWasVerticalWall = true;

    return pipe<typeof lineFragments, string[], string>(
      map(
        pipe(
          ifElse(
            is(String),
            identity,
            pipe(
              ifElse(
                ([first]) => is(Array, first),
                pipe(
                  mapIndexed(
                    (
                      [roomIdStr, roomIdStrLength, maybeWall]: [
                        string,
                        number,
                        '|' | ' '
                      ],
                      column,
                    ) => {
                      const width = defaultTo1(columnNumberWidth[column]);
                      // cannot use String.padEnd because of color in text
                      const paddedId =
                        roomIdStr + ' '.repeat(width - roomIdStrLength);

                      return `${paddedId} ${maybeWall} `;
                    },
                  ),
                  (list: string[]) => prepend('| ', list),
                ),
                pipe(
                  mapIndexed((wallType: '-' | ' ', column) => {
                    const width = defaultTo1(columnNumberWidth[column]);

                    const isVerticalWall = wallType === '-';

                    const dot =
                      isVerticalWall || previousWasVerticalWall
                        ? '+'
                        : column === 0
                        ? '|'
                        : ' ';

                    previousWasVerticalWall =
                      column === this.width - 1 ? isVerticalWall : false;

                    return dot + wallType.repeat(width + 2);
                  }),
                  (lines: string[]) =>
                    lines.length === 0
                      ? lines
                      : // try to read the last character of the last fragment
                      tryCatch(
                          pipe<string[], string, string>(
                            last,
                            last,
                          ),
                          () => ' ',
                        )(lines) === '-'
                      ? append('+', lines)
                      : append('|', lines),
                ),
              ),
              join(''),
            ),
          ),
          trim,
        ),
      ),
      join(os.EOL),
    )(lineFragments);
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
