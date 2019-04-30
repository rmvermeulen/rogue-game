import * as os from 'os';
import { compose, length, map, pluck, repeat, toString } from 'ramda';
import { Grid, ICell } from './grid';
import { generate } from './utils';

export const renderSimple = (grid: Grid): string => {
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
        const str = cell.room.toString();

        const width = columnWidths[index];

        return str.padStart(width);
      })
      .join(' '),
  ).join(os.EOL);
};

// export const render = (grid: Grid): string => {
//   const lines = [];
//   return lines.join('');
// };
