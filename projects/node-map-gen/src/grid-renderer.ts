import * as os from 'os';
import {
  addIndex,
  append,
  compose,
  defaultTo,
  identity,
  ifElse,
  is,
  join,
  last,
  length,
  map,
  pipe,
  pluck,
  prepend,
  propEq,
  repeat,
  sort,
  subtract,
  toString,
  trim,
  tryCatch,
  when,
} from 'ramda';
import {
  manyColors,
  manyColorsLength,
  someColors,
  someColorsLength,
} from './color-lists';
import { Grid, ICell } from './grid';
import { generate } from './utils';

export const renderSimple = (grid: Grid, useColors: boolean = true): string => {
  if (grid.listRooms().length > manyColorsLength) {
    // tslint:disable-next-line: no-parameter-reassignment
    useColors = false;
  }
  const colors = useColors
    ? grid.cells.length <= someColorsLength
      ? someColors()
      : manyColors()
    : [];

  const columnWidths = repeat(1, grid.width);

  generate(grid.height, (rowIndex: number) => {
    const row = grid.row(rowIndex);
    const roomStrWidths = compose<ICell[], number[], number[]>(
      map(
        compose<number, string, number>(
          length,
          toString,
        ),
      ),
      pluck<ICell, 'room'>('room'),
    )(row);
    // update column
    roomStrWidths.forEach((width, column) => {
      columnWidths[column] = Math.max(width, columnWidths[column]);
    });
  });

  return generate<string>(grid.height, (rowIndex: number) =>
    grid
      .row(rowIndex)
      .map((cell: ICell, index) => {
        let roomIdStr = cell.room.toString();
        const roomIdStrCharLength = roomIdStr.length;
        if (useColors) {
          const colorize = colors[cell.room % colors.length];
          roomIdStr = colorize(roomIdStr);
        }
        const width = columnWidths[index];

        // cannot use String.padEnd because of color in text
        return ' '.repeat(width - roomIdStrCharLength) + roomIdStr;
      })
      .join(' '),
  ).join(os.EOL);
};

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
export const render = (grid: Grid, useColors: boolean = true): string => {
  if (grid.listRooms().length > manyColorsLength) {
    // tslint:disable-next-line: no-parameter-reassignment
    useColors = false;
  }
  const colors = useColors
    ? grid.cells.length <= someColorsLength
      ? someColors()
      : manyColors()
    : [];

  const header = repeat('-', grid.width);
  const lineFragments: (string | string[] | string[][])[] = [header];
  const columnNumberWidth: number[] = generate(grid.width, () => 1);

  for (let y = 0; y < grid.height; y += 1) {
    const line = [];
    const separatorLine = [];
    for (let x = 0; x < grid.width; x += 1) {
      const cell = grid.cellAt(x, y);
      const east = grid.cellAt(x + 1, y);
      const south = grid.cellAt(x, y + 1);

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

  const rooms = sort(subtract, grid.listRooms())
    .map(id => grid.findRoomById(id))
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
                    [roomIdStr, roomIdStrCharLength, maybeWall]: [
                      string,
                      number,
                      '|' | ' '
                    ],
                    column,
                  ) => {
                    const width = defaultTo1(columnNumberWidth[column]);
                    // cannot use String.padEnd because of color in text
                    const paddedId =
                      roomIdStr + ' '.repeat(width - roomIdStrCharLength);

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
                    column === grid.width - 1 ? isVerticalWall : false;

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
};
