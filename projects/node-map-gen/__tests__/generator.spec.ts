import * as os from 'os';

import { compose, contains, filter, pluck, test as testRE, uniq } from 'ramda';
import { generateCells, IGeneratorOptions } from '../src/generator';
import { Grid, ICell } from '../src/grid';
import { render } from '../src/grid-renderer';

describe.each`
  width | height | roomCount | pickMethod
  ${5}  | ${5}   | ${4}      | ${'random'}
  ${5}  | ${5}   | ${4}      | ${'closest'}
  ${5}  | ${5}   | ${10}     | ${'closest'}
  ${5}  | ${5}   | ${10}     | ${'prefer closer'}
  ${10} | ${10}  | ${4}      | ${'closest'}
  ${10} | ${10}  | ${10}     | ${'random'}
  ${10} | ${10}  | ${35}     | ${'prefer closer'}
  ${20} | ${20}  | ${40}     | ${'random'}
  ${20} | ${20}  | ${40}     | ${'prefer closer'}
  ${20} | ${20}  | ${40}     | ${'closest'}
`(
  'greedily generated grid $width $height $roomCount "$pickMethod"',
  ({ width, height, roomCount, pickMethod }: IGeneratorOptions) => {
    jest.setTimeout(3e3);
    let cells: ICell[];
    let grid: Grid;
    let display: string;
    beforeAll(() => {
      cells = generateCells({
        width,
        height,
        roomCount,
        pickMethod,
      });
      grid = Grid.FROM_CELLS(width, height, cells);
      display = render(grid, true);
      // tslint:disable-next-line: no-console
      console.log(display);
    });

    test('is probably a grid', () => {
      expect(cells).toBeDefined();
      expect(cells).toHaveLength(width * height);
    });

    test('has the required rooms', () => {
      const uniqueRoomIds = compose<ICell[], number[], number[]>(
        uniq,
        pluck('roomId'),
      )(cells);
      expect(uniqueRoomIds).toHaveLength(roomCount);
    });

    it('does not have rooms split over separate chunks', () => {
      const roomLines = display.split(os.EOL).filter(testRE(/ size=\d+ /));
      for (const line of roomLines) {
        const [, roomId, , cellList] = line.split(/\s/);
        const cellIds = cellList
          .split('=')[1]
          .split(',')
          .map(Number);
        const roomCells = cells.filter(({ id }) => cellIds.includes(id));
        const visitedIds: number[] = [];
        const toVisit = roomCells.slice(0, 1);
        while (toVisit.length > 0) {
          const { x, y, id } = toVisit.shift();
          if (visitedIds.includes(id)) {
            continue;
          }
          toVisit.push(
            ...[[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]]
              .map(([nx, ny]) => grid.cellAt(nx, ny))
              .filter(Boolean)
              .filter(
                ({ id: nextId }) =>
                  cellIds.includes(nextId) && !visitedIds.includes(nextId),
              ),
          );
          visitedIds.push(id);
        }
        expect(visitedIds.sort()).toEqual(cellIds.sort());
      }
    });

    test('does not have unnecessary isolated cells', () => {
      const isolatedCells = cells.reduce((total, cell) => {
        const isPartOfRoom = compose(
          contains(cell.roomId),
          pluck('roomId'),
          filter(
            ({ x, y }: ICell) =>
              Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1,
          ),
        )(cells);

        return total + (isPartOfRoom ? 0 : 1);
      }, 0);
      const expectedIsolatedCells = display.split('size=1 ').length - 1;
      expect(isolatedCells).toBe(expectedIsolatedCells);
    });
  },
);
