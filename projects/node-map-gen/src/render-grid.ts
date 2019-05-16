import { assert } from 'chai';
import * as os from 'os';
import {
  aperture,
  compose,
  defaultTo,
  filter,
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
import { Grid, ICell, IRoom } from './grid';
import { generate } from './utils';

export const renderSimple = (
  grid: Grid,
  useANSIColors: boolean = true,
): string => {
  if (grid.listRooms().length > manyColorsLength) {
    // tslint:disable-next-line: no-parameter-reassignment
    useANSIColors = false;
  }
  const colors = useANSIColors
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
        if (useANSIColors) {
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

interface IGridRenderOptions {
  // only return the graphic, not the lists
  mapOnly?: boolean;
  // colorize room numbers
  useANSIColors?: boolean;
  // single character used as padding
  padding?: string;
}

/** render the grid into a string
 * example output:
 * +---------+--------+-----+
 * | 10   10 | 2    2 | 200 |
 * +----+    |        +-----+
 * |  0 | 10 | 2    2 |  10 |
 * |    |    |        +-----+
 * |  0 | 10 | 2    2 |   0 |
 * |    |    |        |     |
 * |  0 | 10 | 2    2 |   0 |
 * +    +----+---+----+-----+
 * |  0    0   0 | 10   10  |
 * +-------------+----------+
 *
 * room 0 size=9 cells=4,5,10,14,15,19,20,21,22
 * room 1 size=8 cells=0,1,6,9,11,16,23,24
 * room 2 size=8 cells=2,3,7,8,12,13,17,18
 */
// tslint:disable-next-line: max-func-body-length
export const renderGrid = (
  grid: Grid,
  {
    useANSIColors = false,
    padding = ' ',
    mapOnly = false,
  }: IGridRenderOptions = {},
): string => {
  type WallStr = '|' | '+' | '-' | ' ';

  const columnWidths: number[] = generate(grid.width, () => 1);

  const mapCellContents = generate(grid.height, y => {
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

  const topLine: WallStr[] = mapCellContents[0].map((value: number | WallStr) =>
    typeof value === 'number' ? '-' : value === '|' ? '+' : '-',
  );
  const lastMapLine = mapCellContents[grid.height - 1];
  const bottomLine: WallStr[] = lastMapLine.map((value: number | WallStr) =>
    typeof value === 'number' ? '-' : value === '|' ? '+' : '-',
  );
  const mapLinesFromCells = [
    topLine,
    ...unnest(
      // list like [[0,1],[1,2], ...], with extra last entry
      [...aperture(2, mapCellContents), [lastMapLine, undefined]].map(
        ([currentLine, nextLine]) => {
          if (nextLine === undefined) {
            return [currentLine, bottomLine];
          }
          const wallLine = generate(currentLine.length, x => {
            const ax = currentLine[x];
            const bx = nextLine[x];

            if (typeof ax === 'number') {
              return ax === bx ? ' ' : '-';
            }

            return ax === bx ? '|' : '+';
          });

          return [currentLine, wallLine];
        },
      ),
    ),
  ];

  assert.lengthOf(mapLinesFromCells, grid.height * 2 + 1);

  let updated = mapLinesFromCells;

  generate(grid.height + 1, gy => {
    generate(grid.width + 1, gx => {
      const x = gx * 2;
      const y = gy * 2;
      // const cornerPart = mapLinesB[y * 2][x * 2];
      const [n, s, e, w] = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]]
        // tslint:disable-next-line: no-any no-unsafe-any
        .map(p => path(p as any[], mapLinesFromCells))
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

  const totalPaddingSize = padding.length * 2;
  const lineFragments = updated.map((chunks, y) => {
    const newLine = chunks.map(String).map((chunk, x) => {
      const isRoomCenterX = x % 2 === 1;
      if (!isRoomCenterX) {
        return chunk;
      }
      const isRoomCenterY = y % 2 === 1;
      const targetWidth = defaultTo(1, columnWidths[(x - 1) / 2]);

      const paddedRoomId = isRoomCenterY
        ? `${padding}${chunk.padStart(targetWidth)}${padding}`
        : chunk.repeat(targetWidth + totalPaddingSize);
      assert.lengthOf(paddedRoomId, targetWidth + totalPaddingSize);

      return paddedRoomId;
    });

    return newLine.join('');
  });

  const renderedString = lineFragments.join(os.EOL);

  let postProcessedString = renderedString;

  if (useANSIColors) {
    const colors =
      grid.cells.length <= someColorsLength ? someColors() : manyColors();
    const getColorizer = (n: number) => colors[n % colors.length];

    postProcessedString = renderedString
      .split(' ')
      .map(when(test(/^\d+$/), (str: string) => getColorizer(Number(str))(str)))
      .join(' ');
  }

  if (mapOnly) {
    return postProcessedString;
  }

  const roomFragments = compose<number[], number[], IRoom[], IRoom[], string[]>(
    map(({ id, size, cells }) => `room ${id} size=${size} cells=${cells}`),
    filter(Boolean),
    map(id => grid.findRoomById(id)),
    sort(subtract),
  )(grid.listRooms());

  return [renderedString, '', ...roomFragments].join(os.EOL);
};
