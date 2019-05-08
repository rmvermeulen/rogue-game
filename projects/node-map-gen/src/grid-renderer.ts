import { assert } from 'chai';
import * as os from 'os';
import {
  aperture,
  compose,
  defaultTo,
  length,
  lensPath,
  map,
  path,
  pluck,
  repeat,
  set,
  sort,
  subtract,
  test,
  toString,
  unnest,
  when,
  zip,
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
      pluck<ICell, 'roomId'>('roomId'),
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
        let roomIdStr = cell.roomId.toString();
        const roomIdStrCharLength = roomIdStr.length;
        if (useColors) {
          const colorize = colors[cell.roomId % colors.length];
          roomIdStr = colorize(roomIdStr);
        }
        const width = columnWidths[index];

        // cannot use String.padEnd because of color in text
        return ' '.repeat(width - roomIdStrCharLength) + roomIdStr;
      })
      .join(' '),
  ).join(os.EOL);
};

// const stringifyLine = (
//   values: number[],
// ): { text: string; columnWidths: number[] } => {
//   return compose<number[], string[], { text: string; columnWidths: number[] }>(
//     applySpec({
//       text: (ss: string[]) => `| ${ss.join(' | ')} |`,
//       columnWidths: pluck('length'),
//     }),
//     map(String),
//   )(values);
// };

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
  type WallStr = '|' | '+' | '-' | ' ';

  const columnWidths: number[] = generate(grid.width, () => 1);

  const mapLinesA = generate(grid.height, y => {
    const row = grid.row(y);
    const roomIds = pluck('roomId', row);
    generate(grid.width, column => {
      const tokenWidth = String(roomIds[column]).length;
      columnWidths[column] = Math.max(columnWidths[column], tokenWidth);
    });
    const walls: WallStr[] = [];
    for (const [a, b] of aperture(2, roomIds)) {
      const nextWall: WallStr = a === b ? ' ' : '|';
      walls.push(nextWall);
    }
    const [first, ...rest] = roomIds;

    return ['|', first, ...unnest(zip(walls, rest)), '|'];
  });

  const columnWalls: WallStr[][] = repeat([], grid.width);
  generate(grid.width, x => {
    const column = grid.column(x);
    const walls = columnWalls[x];
    walls.push('-');
    for (const [a, b] of aperture(2, pluck('roomId', column))) {
      const nextWall: WallStr = a === b ? ' ' : '-';
      walls.push(nextWall);
    }
    walls.push('-');
  });

  const topLine: WallStr[] = mapLinesA[0].map((value: number | WallStr) =>
    typeof value === 'number' ? '-' : value === '|' ? '+' : '-',
  );
  const lastMapLine = mapLinesA[grid.height - 1];
  const bottomLine: WallStr[] = lastMapLine.map((value: number | WallStr) =>
    typeof value === 'number' ? '-' : value === '|' ? '+' : '-',
  );
  const mapLinesB = [
    topLine,
    ...unnest(
      [...aperture(2, mapLinesA), [lastMapLine, undefined]].map(([a, b]) => {
        if (b === undefined) {
          return [a, bottomLine];
        }
        const walls = generate(a.length, x => {
          const ax = a[x];
          const bx = b[x];

          if (typeof ax === 'number') {
            return ax === bx ? ' ' : '-';
          }

          return ax === bx ? '|' : '+';
        });

        return [a, walls];
      }),
    ),
  ];

  assert.lengthOf(mapLinesB, grid.height * 2 + 1);

  let updated = mapLinesB;

  generate(grid.height + 1, gy => {
    generate(grid.width + 1, gx => {
      const x = gx * 2;
      const y = gy * 2;
      // const cornerPart = mapLinesB[y * 2][x * 2];
      const [n, s, e, w] = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]]
        // tslint:disable-next-line: no-any no-unsafe-any
        .map(p => path(p as any[], mapLinesB))
        .map(defaultTo(' '));
      const assignField = (char: string) => {
        // tslint:disable-next-line: no-any
        const modify = set(lensPath([y, x]), char) as any;
        // tslint:disable-next-line: no-unsafe-any
        updated = modify(updated);
      };
      if (n === ' ' && s === ' ' && e === ' ' && w === ' ') {
        return assignField(' ');
      }
      if (e === ' ' && w === ' ') {
        return assignField('|');
      }
      if (n === ' ' && s === ' ') {
        return assignField('-');
      }

      return assignField('+');
    });
  });

  const lineFragments = updated.map((chunks, y) => {
    const newLine = chunks.map(String).map((chunk, x) => {
      const isRoomCenterX = x % 2 === 1;
      if (!isRoomCenterX) {
        return chunk;
      }
      const isRoomCenterY = y % 2 === 1;
      const width = defaultTo(1, columnWidths[(x - 1) / 2]);

      const padded = isRoomCenterY
        ? ` ${chunk.padStart(width)} `
        : chunk.repeat(width + 2);
      assert.lengthOf(padded, width + 2);

      return padded;
    });

    return newLine.join('');
  });

  const rooms = sort(subtract, grid.listRooms())
    .map(id => grid.findRoomById(id))
    .filter(Boolean);

  const roomFragments = rooms.map(
    ({ id, size, cells }) => `room ${id} size=${size} cells=${cells}`,
  );

  const renderedString = lineFragments.join(os.EOL);

  if (useColors) {
    const colors =
      grid.cells.length <= someColorsLength ? someColors() : manyColors();
    const getColorizer = (n: number) => colors[n % colors.length];

    return [
      renderedString
        .split(' ')
        .map(
          when(test(/^\d+$/), (str: string) => getColorizer(Number(str))(str)),
        )
        .join(' '),
      '',
      ...roomFragments,
    ].join(os.EOL);
  }

  return [renderedString, '', ...roomFragments].join(os.EOL);
};
